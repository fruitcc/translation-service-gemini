# AWS Deployment Guide

This guide provides multiple options for deploying the translation service to AWS.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (`aws configure`)
- Docker installed locally
- Gemini API Key

## Deployment Options

### Option 1: AWS ECS with Fargate (Recommended)

Fully managed container service with auto-scaling and high availability.

#### Quick Deploy

```bash
# Set your API key
export GEMINI_API_KEY=your_gemini_api_key_here

# Deploy everything
chmod +x aws/deploy.sh
./aws/deploy.sh deploy
```

This will:
1. Create an ECR repository for Docker images
2. Build and push your Docker image
3. Deploy CloudFormation stack with:
   - ECS Fargate cluster
   - Application Load Balancer
   - Auto-scaling (2-10 instances)
   - CloudWatch logging
   - Secure secrets management

#### Manual Steps

```bash
# 1. Create ECR repository
./aws/deploy.sh ecr

# 2. Build and push Docker image
./aws/deploy.sh build

# 3. Deploy infrastructure
./aws/deploy.sh stack

# Check status
./aws/deploy.sh status

# Destroy when done
./aws/deploy.sh destroy
```

### Option 2: Elastic Beanstalk (Simplest)

AWS's PaaS solution - easiest to deploy but less control.

#### Setup

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize Elastic Beanstalk:
```bash
eb init -p node.js-20 translation-service
```

3. Create environment:
```bash
eb create production-env
```

4. Set environment variables:
```bash
eb setenv GEMINI_API_KEY=your_api_key_here NODE_ENV=production
```

5. Deploy:
```bash
eb deploy
```

6. Open application:
```bash
eb open
```

### Option 3: AWS Lambda (Serverless)

For intermittent usage with pay-per-request pricing.

#### Using Serverless Framework

1. Install Serverless:
```bash
npm install -g serverless
```

2. Create `serverless.yml`:
```yaml
service: translation-service

provider:
  name: aws
  runtime: nodejs20.x
  environment:
    GEMINI_API_KEY: ${env:GEMINI_API_KEY}

functions:
  app:
    handler: lambda.handler
    events:
      - http: ANY /
      - http: ANY /{proxy+}
```

3. Create Lambda wrapper (`lambda.js`):
```javascript
const serverless = require('serverless-http');
const app = require('./src/app');

module.exports.handler = serverless(app);
```

4. Deploy:
```bash
serverless deploy
```

### Option 4: EC2 with Auto Scaling

Traditional VM approach with full control.

Use the CloudFormation template with modifications for EC2:
- Replace ECS/Fargate with EC2 Auto Scaling Group
- Use User Data script to install Node.js and run application
- Configure Application Load Balancer

## Architecture Overview

### ECS Fargate Architecture (Option 1)
```
Internet → ALB → ECS Service → Fargate Tasks (2-10)
                                      ↓
                              Secrets Manager (API Key)
                                      ↓
                              CloudWatch Logs
```

### Cost Comparison

| Option | Monthly Cost (Est.) | Best For |
|--------|-------------------|----------|
| ECS Fargate | $20-50 | Production, auto-scaling needed |
| Elastic Beanstalk | $10-30 | Quick deployment, less traffic |
| Lambda | $0-20 | Intermittent usage, <1M requests |
| EC2 (t3.micro) | $8-15 | Full control, consistent load |

## Environment Configuration

### Required Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key
- `NODE_ENV`: Environment (production/staging)
- `PORT`: Application port (8080 for AWS)

### Setting Secrets Securely

#### Using AWS Secrets Manager (Recommended)
```bash
aws secretsmanager create-secret \
  --name translation-service/gemini-api-key \
  --secret-string "your_api_key_here"
```

#### Using Systems Manager Parameter Store
```bash
aws ssm put-parameter \
  --name /translation-service/gemini-api-key \
  --value "your_api_key_here" \
  --type SecureString
```

## Monitoring

### CloudWatch Metrics
- CPU Utilization
- Memory Usage
- Request Count
- Error Rate

### Setting Up Alarms
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-cpu \
  --alarm-description "Alarm when CPU exceeds 70%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold
```

## CI/CD with GitHub Actions

Create `.github/workflows/aws-deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
      
      - name: Build and push Docker image
        run: |
          docker build -t translation-service .
          docker tag translation-service:latest ${{ secrets.ECR_REGISTRY }}/translation-service:latest
          docker push ${{ secrets.ECR_REGISTRY }}/translation-service:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service --cluster translation-service-cluster --service translation-service --force-new-deployment
```

## Custom Domain Setup

1. Register domain in Route 53 or use existing domain
2. Request ACM certificate:
```bash
aws acm request-certificate --domain-name api.yourdomain.com
```
3. Update ALB listener to use HTTPS
4. Create Route 53 record pointing to ALB

## Troubleshooting

### Service Not Starting
- Check CloudWatch logs: `aws logs tail /ecs/translation-service-stack`
- Verify environment variables are set
- Check security group rules

### High Costs
- Review CloudWatch metrics for over-provisioning
- Consider Lambda for low-traffic scenarios
- Use Fargate Spot for non-critical workloads

### Connection Timeouts
- Check security groups allow traffic on port 80/443
- Verify ALB health checks are passing
- Check target group health

## Cleanup

To avoid charges, delete resources when not needed:

```bash
# Using deploy script
./aws/deploy.sh destroy

# Or manually
aws cloudformation delete-stack --stack-name translation-service-stack
aws ecr delete-repository --repository-name translation-service --force
```

## Support

- AWS Support: https://console.aws.amazon.com/support/
- ECS Documentation: https://docs.aws.amazon.com/ecs/
- Elastic Beanstalk: https://docs.aws.amazon.com/elasticbeanstalk/