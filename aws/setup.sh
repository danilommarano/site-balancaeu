#!/usr/bin/env bash
# ===========================================
# Ritmo — AWS Infrastructure Setup
# ECS Fargate + RDS PostgreSQL + ALB + ECR
# ===========================================
#
# Pré-requisitos:
#   - AWS CLI v2 configurado (aws configure)
#   - Conta AWS com permissões de admin
#
# Uso:
#   chmod +x aws/setup.sh
#   ./aws/setup.sh
#
# Este script cria:
#   1. VPC com subnets públicas e privadas
#   2. Security Groups
#   3. RDS PostgreSQL (db.t4g.micro)
#   4. ECR Repository
#   5. ECS Cluster + Service + Task Definition
#   6. Application Load Balancer
#   7. CloudWatch Log Group
#   8. SSM Parameters (secrets)
# ===========================================

set -euo pipefail

# ── Configuração ──────────────────────────
AWS_REGION="${AWS_REGION:-sa-east-1}"
APP_NAME="ritmo"
DB_USER="ritmo"
DB_NAME="ritmo"
DB_PASSWORD="${DB_PASSWORD:?Defina DB_PASSWORD antes de rodar}"
DOMAIN="${DOMAIN:-}" # Opcional: seu domínio (ex: app.ritmo.com.br)

echo "🚀 Iniciando setup da infraestrutura Ritmo na AWS..."
echo "   Região: $AWS_REGION"
echo ""

# ── 1. VPC ────────────────────────────────
echo "📦 1/8 — Criando VPC..."

VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${APP_NAME}-vpc}]" \
  --query 'Vpc.VpcId' --output text \
  --region $AWS_REGION)

aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support --region $AWS_REGION
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames --region $AWS_REGION

# Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${APP_NAME}-igw}]" \
  --query 'InternetGateway.InternetGatewayId' --output text \
  --region $AWS_REGION)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $AWS_REGION

# Subnets (2 AZs para ALB)
AZ1="${AWS_REGION}a"
AZ2="${AWS_REGION}b"

SUBNET_PUB_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone $AZ1 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${APP_NAME}-pub-1}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

SUBNET_PUB_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone $AZ2 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${APP_NAME}-pub-2}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

SUBNET_PRIV_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID --cidr-block 10.0.10.0/24 --availability-zone $AZ1 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${APP_NAME}-priv-1}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

SUBNET_PRIV_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID --cidr-block 10.0.11.0/24 --availability-zone $AZ2 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${APP_NAME}-priv-2}]" \
  --query 'Subnet.SubnetId' --output text --region $AWS_REGION)

# Auto-assign public IPs to public subnets
aws ec2 modify-subnet-attribute --subnet-id $SUBNET_PUB_1 --map-public-ip-on-launch --region $AWS_REGION
aws ec2 modify-subnet-attribute --subnet-id $SUBNET_PUB_2 --map-public-ip-on-launch --region $AWS_REGION

# Route table for public subnets
RT_PUB=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${APP_NAME}-rt-pub}]" \
  --query 'RouteTable.RouteTableId' --output text --region $AWS_REGION)
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $AWS_REGION
aws ec2 associate-route-table --route-table-id $RT_PUB --subnet-id $SUBNET_PUB_1 --region $AWS_REGION
aws ec2 associate-route-table --route-table-id $RT_PUB --subnet-id $SUBNET_PUB_2 --region $AWS_REGION

# NAT Gateway for private subnets (ECS Fargate needs outbound internet)
EIP_ALLOC=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text --region $AWS_REGION)
NAT_GW=$(aws ec2 create-nat-gateway \
  --subnet-id $SUBNET_PUB_1 --allocation-id $EIP_ALLOC \
  --tag-specifications "ResourceType=natgateway,Tags=[{Key=Name,Value=${APP_NAME}-nat}]" \
  --query 'NatGateway.NatGatewayId' --output text --region $AWS_REGION)

echo "   Aguardando NAT Gateway ficar disponível..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW --region $AWS_REGION

RT_PRIV=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${APP_NAME}-rt-priv}]" \
  --query 'RouteTable.RouteTableId' --output text --region $AWS_REGION)
aws ec2 create-route --route-table-id $RT_PRIV --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW --region $AWS_REGION
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUBNET_PRIV_1 --region $AWS_REGION
aws ec2 associate-route-table --route-table-id $RT_PRIV --subnet-id $SUBNET_PRIV_2 --region $AWS_REGION

echo "   ✅ VPC: $VPC_ID"

# ── 2. Security Groups ───────────────────
echo "📦 2/8 — Criando Security Groups..."

SG_ALB=$(aws ec2 create-security-group \
  --group-name ${APP_NAME}-alb-sg --description "ALB - HTTP/HTTPS" \
  --vpc-id $VPC_ID --query 'GroupId' --output text --region $AWS_REGION)
aws ec2 authorize-security-group-ingress --group-id $SG_ALB --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $SG_ALB --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION

SG_APP=$(aws ec2 create-security-group \
  --group-name ${APP_NAME}-app-sg --description "App - port 3000 from ALB" \
  --vpc-id $VPC_ID --query 'GroupId' --output text --region $AWS_REGION)
aws ec2 authorize-security-group-ingress --group-id $SG_APP --protocol tcp --port 3000 --source-group $SG_ALB --region $AWS_REGION

SG_DB=$(aws ec2 create-security-group \
  --group-name ${APP_NAME}-db-sg --description "RDS - port 5432 from App" \
  --vpc-id $VPC_ID --query 'GroupId' --output text --region $AWS_REGION)
aws ec2 authorize-security-group-ingress --group-id $SG_DB --protocol tcp --port 5432 --source-group $SG_APP --region $AWS_REGION

echo "   ✅ SGs: ALB=$SG_ALB, App=$SG_APP, DB=$SG_DB"

# ── 3. RDS PostgreSQL ────────────────────
echo "📦 3/8 — Criando RDS PostgreSQL..."

DB_SUBNET_GROUP="${APP_NAME}-db-subnets"
aws rds create-db-subnet-group \
  --db-subnet-group-name $DB_SUBNET_GROUP \
  --db-subnet-group-description "Ritmo DB subnets" \
  --subnet-ids $SUBNET_PRIV_1 $SUBNET_PRIV_2 \
  --region $AWS_REGION > /dev/null

aws rds create-db-instance \
  --db-instance-identifier ${APP_NAME}-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version "16" \
  --master-username $DB_USER \
  --master-user-password "$DB_PASSWORD" \
  --db-name $DB_NAME \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids $SG_DB \
  --db-subnet-group-name $DB_SUBNET_GROUP \
  --no-publicly-accessible \
  --backup-retention-period 7 \
  --storage-encrypted \
  --region $AWS_REGION > /dev/null

echo "   ⏳ RDS criando (leva ~5-10 min)... continuando setup em paralelo."

# ── 4. ECR Repository ────────────────────
echo "📦 4/8 — Criando ECR Repository..."

ECR_URI=$(aws ecr create-repository \
  --repository-name $APP_NAME \
  --image-scanning-configuration scanOnPush=true \
  --query 'repository.repositoryUri' --output text \
  --region $AWS_REGION 2>/dev/null || \
  aws ecr describe-repositories \
  --repository-names $APP_NAME \
  --query 'repositories[0].repositoryUri' --output text \
  --region $AWS_REGION)

# Lifecycle policy: keep last 10 images
aws ecr put-lifecycle-policy \
  --repository-name $APP_NAME \
  --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Keep last 10 images","selection":{"tagStatus":"any","countType":"imageCountMoreThan","countNumber":10},"action":{"type":"expire"}}]}' \
  --region $AWS_REGION > /dev/null

echo "   ✅ ECR: $ECR_URI"

# ── 5. CloudWatch Log Group ──────────────
echo "📦 5/8 — Criando CloudWatch Log Group..."

aws logs create-log-group \
  --log-group-name /ecs/$APP_NAME \
  --retention-in-days 30 \
  --region $AWS_REGION 2>/dev/null || true

echo "   ✅ Log Group: /ecs/$APP_NAME"

# ── 6. IAM Roles ─────────────────────────
echo "📦 6/8 — Criando IAM Roles..."

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# ECS Execution Role (pull images, get secrets)
cat > /tmp/ecs-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ecs-tasks.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

EXEC_ROLE_ARN=$(aws iam create-role \
  --role-name ${APP_NAME}-ecs-execution-role \
  --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
  --query 'Role.Arn' --output text 2>/dev/null || \
  aws iam get-role --role-name ${APP_NAME}-ecs-execution-role --query 'Role.Arn' --output text)

aws iam attach-role-policy --role-name ${APP_NAME}-ecs-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true

# Policy for SSM Parameter Store access
cat > /tmp/ssm-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["ssm:GetParameters", "ssm:GetParameter"],
    "Resource": "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter/${APP_NAME}/*"
  }]
}
EOF

aws iam put-role-policy \
  --role-name ${APP_NAME}-ecs-execution-role \
  --policy-name ${APP_NAME}-ssm-access \
  --policy-document file:///tmp/ssm-policy.json

# Task Role (app permissions)
TASK_ROLE_ARN=$(aws iam create-role \
  --role-name ${APP_NAME}-ecs-task-role \
  --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
  --query 'Role.Arn' --output text 2>/dev/null || \
  aws iam get-role --role-name ${APP_NAME}-ecs-task-role --query 'Role.Arn' --output text)

echo "   ✅ Roles: Exec=$EXEC_ROLE_ARN, Task=$TASK_ROLE_ARN"

# ── 7. ALB ────────────────────────────────
echo "📦 7/8 — Criando Application Load Balancer..."

ALB_ARN=$(aws elbv2 create-load-balancer \
  --name ${APP_NAME}-alb \
  --subnets $SUBNET_PUB_1 $SUBNET_PUB_2 \
  --security-groups $SG_ALB \
  --scheme internet-facing \
  --type application \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text \
  --region $AWS_REGION)

ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' --output text \
  --region $AWS_REGION)

TG_ARN=$(aws elbv2 create-target-group \
  --name ${APP_NAME}-tg \
  --protocol HTTP --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path "/" \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' --output text \
  --region $AWS_REGION)

aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region $AWS_REGION > /dev/null

echo "   ✅ ALB: $ALB_DNS"

# ── 8. ECS Cluster + Service ─────────────
echo "📦 8/8 — Criando ECS Cluster e Service..."

# Criar Service-Linked Role para ECS (necessário na primeira vez)
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com 2>/dev/null || true
sleep 5

aws ecs create-cluster \
  --cluster-name ${APP_NAME}-cluster \
  --capacity-providers FARGATE \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --region $AWS_REGION > /dev/null

# Aguardar RDS ficar disponível antes de salvar DATABASE_URL
echo "   ⏳ Aguardando RDS ficar disponível..."
aws rds wait db-instance-available --db-instance-identifier ${APP_NAME}-db --region $AWS_REGION

DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ${APP_NAME}-db \
  --query 'DBInstances[0].Endpoint.Address' --output text \
  --region $AWS_REGION)

# URL-encode a senha para lidar com caracteres especiais (#, @, etc.)
DB_PASSWORD_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${DB_PASSWORD}', safe=''))")
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_ENDPOINT}:5432/${DB_NAME}?schema=public"

# ── SSM Parameters (secrets) ─────────────
echo "   🔑 Salvando secrets no SSM Parameter Store..."

aws ssm put-parameter --name "/${APP_NAME}/DATABASE_URL" --type SecureString --value "$DATABASE_URL" --overwrite --region $AWS_REGION > /dev/null
aws ssm put-parameter --name "/${APP_NAME}/AUTH_SECRET" --type SecureString --value "$(openssl rand -base64 32)" --overwrite --region $AWS_REGION > /dev/null
aws ssm put-parameter --name "/${APP_NAME}/ORIGIN" --type String --value "http://${ALB_DNS}" --overwrite --region $AWS_REGION > /dev/null
aws ssm put-parameter --name "/${APP_NAME}/RESEND_API_KEY" --type SecureString --value "${RESEND_API_KEY:-placeholder}" --overwrite --region $AWS_REGION > /dev/null
aws ssm put-parameter --name "/${APP_NAME}/EMAIL_FROM" --type String --value "${EMAIL_FROM:-noreply@ritmo.app}" --overwrite --region $AWS_REGION > /dev/null

# ── Update task-definition.json com valores reais ──
echo "   📝 Atualizando task-definition.json..."

sed -i "s|ACCOUNT_ID|${ACCOUNT_ID}|g" aws/task-definition.json

# ── Register task definition ─────────────
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition.json \
  --query 'taskDefinition.taskDefinitionArn' --output text \
  --region $AWS_REGION)

# ── Create ECS Service ───────────────────
aws ecs create-service \
  --cluster ${APP_NAME}-cluster \
  --service-name ${APP_NAME}-service \
  --task-definition $TASK_DEF_ARN \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_PRIV_1,$SUBNET_PRIV_2],securityGroups=[$SG_APP],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=ritmo-app,containerPort=3000" \
  --region $AWS_REGION > /dev/null

echo ""
echo "============================================"
echo "✅ Infraestrutura Ritmo criada com sucesso!"
echo "============================================"
echo ""
echo "📋 Resumo:"
echo "   VPC:          $VPC_ID"
echo "   ALB DNS:      $ALB_DNS"
echo "   RDS Endpoint: $DB_ENDPOINT"
echo "   ECR URI:      $ECR_URI"
echo "   ECS Cluster:  ${APP_NAME}-cluster"
echo "   ECS Service:  ${APP_NAME}-service"
echo ""
echo "🌐 Acesse: http://$ALB_DNS"
echo ""
echo "📌 Próximos passos:"
echo "   1. Faça o primeiro push da imagem Docker:"
echo "      aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI"
echo "      docker build -t $ECR_URI:latest ."
echo "      docker push $ECR_URI:latest"
echo ""
echo "   2. Configure os GitHub Secrets:"
echo "      AWS_ACCESS_KEY_ID"
echo "      AWS_SECRET_ACCESS_KEY"
echo ""
echo "   3. (Opcional) Configure domínio + HTTPS:"
echo "      - Crie certificado no ACM"
echo "      - Adicione listener HTTPS no ALB"
echo "      - Crie registro CNAME/A no Route53 ou seu DNS"
echo ""
echo "   4. Rode o seed (uma vez):"
echo "      aws ecs run-task --cluster ${APP_NAME}-cluster --task-definition ${APP_NAME} --launch-type FARGATE \\"
echo "        --network-configuration 'awsvpcConfiguration={subnets=[$SUBNET_PRIV_1],securityGroups=[$SG_APP],assignPublicIp=DISABLED}' \\"
echo "        --overrides '{\"containerOverrides\":[{\"name\":\"${APP_NAME}-app\",\"command\":[\"sh\",\"-c\",\"npx prisma db push && npx tsx prisma/seed.ts\"]}]}'"
echo ""

# ── Salvar outputs ────────────────────────
cat > aws/outputs.env << EOF
# Gerado automaticamente por setup.sh em $(date -Iseconds)
AWS_REGION=$AWS_REGION
ACCOUNT_ID=$ACCOUNT_ID
VPC_ID=$VPC_ID
SUBNET_PUB_1=$SUBNET_PUB_1
SUBNET_PUB_2=$SUBNET_PUB_2
SUBNET_PRIV_1=$SUBNET_PRIV_1
SUBNET_PRIV_2=$SUBNET_PRIV_2
SG_ALB=$SG_ALB
SG_APP=$SG_APP
SG_DB=$SG_DB
ALB_ARN=$ALB_ARN
ALB_DNS=$ALB_DNS
TG_ARN=$TG_ARN
DB_ENDPOINT=$DB_ENDPOINT
ECR_URI=$ECR_URI
EXEC_ROLE_ARN=$EXEC_ROLE_ARN
TASK_ROLE_ARN=$TASK_ROLE_ARN
EOF

echo "💾 Outputs salvos em aws/outputs.env"
