# Ritmo — Deploy AWS (ECS Fargate + RDS)

## Arquitetura

```
Internet → ALB (HTTP/HTTPS) → ECS Fargate (container SvelteKit) → RDS PostgreSQL
                                         ↓
                                   SSM Parameter Store (secrets)
                                   CloudWatch Logs
                                   ECR (imagens Docker)
```

**Componentes:**
- **VPC** com 2 subnets públicas (ALB) + 2 privadas (ECS + RDS)
- **ALB** (Application Load Balancer) — ponto de entrada HTTP/HTTPS
- **ECS Fargate** — roda o container sem gerenciar servidores
- **RDS PostgreSQL 16** — banco de dados gerenciado (db.t4g.micro)
- **ECR** — registro de imagens Docker
- **NAT Gateway** — acesso à internet para containers privados
- **SSM Parameter Store** — armazenamento seguro de secrets

**Custo estimado:** ~$50-70/mês (Fargate $15 + RDS $15 + NAT $32 + ALB $16 + data transfer)

> 💡 **Dica de economia:** Para reduzir custos, considere usar VPC endpoints em vez de NAT Gateway (~$7/mês por endpoint vs $32/mês NAT).

---

## Pré-requisitos

1. **Conta AWS** com permissões de administrador
2. **AWS CLI v2** instalado e configurado:
   ```bash
   aws configure
   # AWS Access Key ID: ...
   # AWS Secret Access Key: ...
   # Default region name: sa-east-1
   ```
3. **Docker** instalado localmente
4. **Repositório no GitHub** (para CI/CD)

---

## Setup Inicial (uma vez)

### 1. Criar a infraestrutura

```bash
# Definir senha do banco (obrigatório)
export DB_PASSWORD="SuaSenhaSegura123!"

# Opcional: configurar região
export AWS_REGION="sa-east-1"

# Opcional: definir secrets
export RESEND_API_KEY="re_..."
export EMAIL_FROM="noreply@seudominio.com"

# Executar setup
chmod +x aws/setup.sh
./aws/setup.sh
```

O script cria tudo automaticamente e salva os IDs em `aws/outputs.env`.

### 2. Primeiro deploy manual

```bash
# Carregar outputs
source aws/outputs.env

# Login no ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_URI

# Build e push
docker build -t $ECR_URI:latest .
docker push $ECR_URI:latest

# Forçar novo deployment no ECS
aws ecs update-service \
  --cluster ritmo-cluster \
  --service ritmo-service \
  --force-new-deployment \
  --region $AWS_REGION
```

### 3. Executar seed (primeira vez)

```bash
source aws/outputs.env

aws ecs run-task \
  --cluster ritmo-cluster \
  --task-definition ritmo \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_PRIV_1],securityGroups=[$SG_APP],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"ritmo-app","command":["sh","-c","npx prisma db push && npx tsx prisma/seed.ts"]}]}' \
  --region $AWS_REGION
```

### 4. Acessar a aplicação

```bash
source aws/outputs.env
echo "http://$ALB_DNS"
```

---

## GitHub Actions (CI/CD)

### Plano Gratuito

- **Repos públicos:** minutos ilimitados
- **Repos privados:** 2.000 min/mês (Ubuntu runners)
- Mais que suficiente para este projeto

### Configurar Secrets no GitHub

Vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Descrição |
|---|---|
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS (IAM user para deploy) |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS |

### Como criar um IAM User para deploy

```bash
# Criar user
aws iam create-user --user-name ritmo-github-deployer

# Criar policy
cat > /tmp/deployer-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/ritmo-*"
    }
  ]
}
EOF

aws iam put-user-policy \
  --user-name ritmo-github-deployer \
  --policy-name ritmo-deploy-policy \
  --policy-document file:///tmp/deployer-policy.json

# Criar access key
aws iam create-access-key --user-name ritmo-github-deployer
# → Copie AccessKeyId e SecretAccessKey para os GitHub Secrets
```

### Workflows

- **CI** (`.github/workflows/ci.yml`): roda em todo push/PR para `main`/`develop`
  - svelte-check (type checking)
  - npm build
  - Docker build test

- **Deploy** (`.github/workflows/deploy.yml`): roda em push para `main`
  - Build imagem Docker
  - Push para ECR
  - Deploy no ECS Fargate
  - Aguarda estabilidade do serviço

---

## HTTPS (Domínio Personalizado)

### 1. Criar certificado SSL (ACM)

```bash
aws acm request-certificate \
  --domain-name app.seudominio.com.br \
  --validation-method DNS \
  --region sa-east-1
```

Valide o domínio criando o registro DNS CNAME indicado.

### 2. Adicionar listener HTTPS no ALB

```bash
source aws/outputs.env

CERT_ARN="arn:aws:acm:sa-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"

# Listener HTTPS
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS --port 443 \
  --certificates CertificateArn=$CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region $AWS_REGION

# Redirect HTTP → HTTPS
LISTENER_HTTP=$(aws elbv2 describe-listeners \
  --load-balancer-arn $ALB_ARN \
  --query 'Listeners[?Port==`80`].ListenerArn' --output text \
  --region $AWS_REGION)

aws elbv2 modify-listener \
  --listener-arn $LISTENER_HTTP \
  --default-actions '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","StatusCode":"HTTP_301"}}]' \
  --region $AWS_REGION
```

### 3. Configurar DNS

Crie um registro CNAME ou Alias (Route53) apontando para o ALB DNS.

### 4. Atualizar ORIGIN

```bash
aws ssm put-parameter \
  --name "/ritmo/ORIGIN" \
  --type String \
  --value "https://app.seudominio.com.br" \
  --overwrite \
  --region sa-east-1

# Forçar redeploy para pegar novo ORIGIN
aws ecs update-service --cluster ritmo-cluster --service ritmo-service --force-new-deployment --region sa-east-1
```

---

## Comandos Úteis

```bash
# Ver logs do container
aws logs tail /ecs/ritmo --follow --region sa-east-1

# Forçar redeploy
aws ecs update-service --cluster ritmo-cluster --service ritmo-service --force-new-deployment --region sa-east-1

# Escalar (ex: 2 instâncias)
aws ecs update-service --cluster ritmo-cluster --service ritmo-service --desired-count 2 --region sa-east-1

# Ver status do serviço
aws ecs describe-services --cluster ritmo-cluster --services ritmo-service --query 'services[0].{status:status,running:runningCount,desired:desiredCount}' --region sa-east-1

# Atualizar um secret
aws ssm put-parameter --name "/ritmo/RESEND_API_KEY" --type SecureString --value "re_novo_valor" --overwrite --region sa-east-1

# Destruir TUDO
chmod +x aws/teardown.sh
./aws/teardown.sh
```

---

## Estrutura de Arquivos

```
aws/
├── README.md              ← Este arquivo
├── setup.sh               ← Script de criação da infraestrutura
├── teardown.sh            ← Script de destruição (cuidado!)
├── task-definition.json   ← Definição do container ECS
└── outputs.env            ← IDs dos recursos (gerado, não commitado)

.github/workflows/
├── ci.yml                 ← Pipeline CI (svelte-check, build, docker)
└── deploy.yml             ← Pipeline CD (ECR push, ECS deploy)
```
