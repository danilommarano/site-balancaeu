#!/usr/bin/env bash
# ===========================================
# Ritmo — AWS Infrastructure Teardown
# Remove TODOS os recursos criados pelo setup.sh
# ===========================================
#
# ⚠️  CUIDADO: Este script DESTRÓI toda a infraestrutura!
#
# Uso:
#   chmod +x aws/teardown.sh
#   ./aws/teardown.sh
# ===========================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-sa-east-1}"
APP_NAME="ritmo"

# Carregar outputs se existirem
if [ -f aws/outputs.env ]; then
  source aws/outputs.env
  echo "📂 Outputs carregados de aws/outputs.env"
else
  echo "⚠️  aws/outputs.env não encontrado. Tentando descobrir recursos..."
fi

echo ""
echo "⚠️  ATENÇÃO: Isto vai DESTRUIR toda a infraestrutura Ritmo na AWS!"
echo "   Região: $AWS_REGION"
echo ""
read -p "Tem certeza? Digite 'DESTRUIR' para confirmar: " CONFIRM
if [ "$CONFIRM" != "DESTRUIR" ]; then
  echo "Cancelado."
  exit 0
fi

echo ""
echo "🗑️  Removendo recursos..."

# 1. ECS Service
echo "   Removendo ECS Service..."
aws ecs update-service --cluster ${APP_NAME}-cluster --service ${APP_NAME}-service --desired-count 0 --region $AWS_REGION 2>/dev/null || true
aws ecs delete-service --cluster ${APP_NAME}-cluster --service ${APP_NAME}-service --force --region $AWS_REGION 2>/dev/null || true

# 2. ECS Task Definitions
echo "   Desregistrando Task Definitions..."
for td in $(aws ecs list-task-definitions --family-prefix $APP_NAME --query 'taskDefinitionArns[]' --output text --region $AWS_REGION 2>/dev/null); do
  aws ecs deregister-task-definition --task-definition $td --region $AWS_REGION 2>/dev/null || true
done

# 3. ECS Cluster
echo "   Removendo ECS Cluster..."
aws ecs delete-cluster --cluster ${APP_NAME}-cluster --region $AWS_REGION 2>/dev/null || true

# 4. ALB + Target Group + Listener
echo "   Removendo ALB..."
if [ -n "${ALB_ARN:-}" ]; then
  for listener in $(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].ListenerArn' --output text --region $AWS_REGION 2>/dev/null); do
    aws elbv2 delete-listener --listener-arn $listener --region $AWS_REGION 2>/dev/null || true
  done
  aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $AWS_REGION 2>/dev/null || true
  sleep 5
fi
if [ -n "${TG_ARN:-}" ]; then
  aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $AWS_REGION 2>/dev/null || true
fi

# 5. RDS
echo "   Removendo RDS (skip final snapshot)..."
aws rds delete-db-instance --db-instance-identifier ${APP_NAME}-db --skip-final-snapshot --delete-automated-backups --region $AWS_REGION 2>/dev/null || true
echo "   ⏳ Aguardando RDS ser removido..."
aws rds wait db-instance-deleted --db-instance-identifier ${APP_NAME}-db --region $AWS_REGION 2>/dev/null || true
aws rds delete-db-subnet-group --db-subnet-group-name ${APP_NAME}-db-subnets --region $AWS_REGION 2>/dev/null || true

# 6. ECR
echo "   Removendo ECR..."
aws ecr delete-repository --repository-name $APP_NAME --force --region $AWS_REGION 2>/dev/null || true

# 7. SSM Parameters
echo "   Removendo SSM Parameters..."
for param in DATABASE_URL AUTH_SECRET ORIGIN RESEND_API_KEY EMAIL_FROM; do
  aws ssm delete-parameter --name "/${APP_NAME}/${param}" --region $AWS_REGION 2>/dev/null || true
done

# 8. IAM Roles
echo "   Removendo IAM Roles..."
aws iam detach-role-policy --role-name ${APP_NAME}-ecs-execution-role --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true
aws iam delete-role-policy --role-name ${APP_NAME}-ecs-execution-role --policy-name ${APP_NAME}-ssm-access 2>/dev/null || true
aws iam delete-role --role-name ${APP_NAME}-ecs-execution-role 2>/dev/null || true
aws iam delete-role --role-name ${APP_NAME}-ecs-task-role 2>/dev/null || true

# 9. CloudWatch
echo "   Removendo CloudWatch Log Group..."
aws logs delete-log-group --log-group-name /ecs/$APP_NAME --region $AWS_REGION 2>/dev/null || true

# 10. NAT Gateway + EIP
echo "   Removendo NAT Gateway..."
for nat in $(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=${VPC_ID:-}" --query 'NatGateways[].NatGatewayId' --output text --region $AWS_REGION 2>/dev/null); do
  aws ec2 delete-nat-gateway --nat-gateway-id $nat --region $AWS_REGION 2>/dev/null || true
done
sleep 30 # NAT Gateway takes time to delete

for eip in $(aws ec2 describe-addresses --filter "Name=domain,Values=vpc" --query 'Addresses[?AssociationId==null].AllocationId' --output text --region $AWS_REGION 2>/dev/null); do
  aws ec2 release-address --allocation-id $eip --region $AWS_REGION 2>/dev/null || true
done

# 11. Security Groups
echo "   Removendo Security Groups..."
for sg in ${SG_APP:-} ${SG_DB:-} ${SG_ALB:-}; do
  if [ -n "$sg" ]; then
    aws ec2 delete-security-group --group-id $sg --region $AWS_REGION 2>/dev/null || true
  fi
done

# 12. Subnets + Route Tables + IGW + VPC
echo "   Removendo VPC e componentes..."
if [ -n "${VPC_ID:-}" ]; then
  for rt in $(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text --region $AWS_REGION 2>/dev/null); do
    for assoc in $(aws ec2 describe-route-tables --route-table-ids $rt --query 'RouteTables[0].Associations[].RouteTableAssociationId' --output text --region $AWS_REGION 2>/dev/null); do
      aws ec2 disassociate-route-table --association-id $assoc --region $AWS_REGION 2>/dev/null || true
    done
    aws ec2 delete-route-table --route-table-id $rt --region $AWS_REGION 2>/dev/null || true
  done

  for subnet in ${SUBNET_PUB_1:-} ${SUBNET_PUB_2:-} ${SUBNET_PRIV_1:-} ${SUBNET_PRIV_2:-}; do
    if [ -n "$subnet" ]; then
      aws ec2 delete-subnet --subnet-id $subnet --region $AWS_REGION 2>/dev/null || true
    fi
  done

  for igw in $(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query 'InternetGateways[].InternetGatewayId' --output text --region $AWS_REGION 2>/dev/null); do
    aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $VPC_ID --region $AWS_REGION 2>/dev/null || true
    aws ec2 delete-internet-gateway --internet-gateway-id $igw --region $AWS_REGION 2>/dev/null || true
  done

  aws ec2 delete-vpc --vpc-id $VPC_ID --region $AWS_REGION 2>/dev/null || true
fi

echo ""
echo "✅ Teardown completo!"
echo "   Lembre-se de remover aws/outputs.env manualmente."
