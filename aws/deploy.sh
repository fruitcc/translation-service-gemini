#!/bin/bash

# AWS Deployment Script
# Prerequisites: AWS CLI configured with appropriate credentials

set -e

# Configuration
REGION=${AWS_REGION:-us-east-1}
STACK_NAME=${STACK_NAME:-translation-service-stack}
ECR_REPO=${ECR_REPO:-translation-service}
ENVIRONMENT=${ENVIRONMENT:-production}

echo "=== AWS Deployment Script ==="
echo "Region: $REGION"
echo "Stack: $STACK_NAME"
echo "Environment: $ENVIRONMENT"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Function to create ECR repository if it doesn't exist
create_ecr_repo() {
    echo "Checking ECR repository..."
    if ! aws ecr describe-repositories --repository-names $ECR_REPO --region $REGION 2>/dev/null; then
        echo "Creating ECR repository..."
        aws ecr create-repository --repository-name $ECR_REPO --region $REGION
    else
        echo "ECR repository already exists"
    fi
}

# Function to build and push Docker image
build_and_push() {
    echo "Building Docker image..."
    
    # Get ECR login token
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com
    
    # Build and tag image
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    IMAGE_URI=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
    
    docker build -t $ECR_REPO:latest .
    docker tag $ECR_REPO:latest $IMAGE_URI
    
    # Push to ECR
    echo "Pushing image to ECR..."
    docker push $IMAGE_URI
    
    echo "Image pushed: $IMAGE_URI"
}

# Function to deploy CloudFormation stack
deploy_stack() {
    echo "Deploying CloudFormation stack..."
    
    # Check if GEMINI_API_KEY is set
    if [ -z "$GEMINI_API_KEY" ]; then
        echo "Error: GEMINI_API_KEY environment variable is not set"
        echo "Please set it: export GEMINI_API_KEY=your_api_key"
        exit 1
    fi
    
    # Deploy or update stack
    aws cloudformation deploy \
        --template-file aws/cloudformation-template.yaml \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            GeminiApiKey=$GEMINI_API_KEY \
            EnvironmentName=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION \
        --no-fail-on-empty-changeset
    
    # Get outputs
    echo "Getting stack outputs..."
    ALB_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerURL'].OutputValue" \
        --output text \
        --region $REGION)
    
    echo "=== Deployment Complete ==="
    echo "Application URL: http://$ALB_URL"
}

# Main execution
main() {
    case "${1:-deploy}" in
        ecr)
            create_ecr_repo
            ;;
        build)
            build_and_push
            ;;
        stack)
            deploy_stack
            ;;
        deploy)
            create_ecr_repo
            build_and_push
            deploy_stack
            ;;
        destroy)
            echo "Deleting CloudFormation stack..."
            aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION
            echo "Stack deletion initiated. Check AWS Console for status."
            ;;
        status)
            aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION
            ;;
        *)
            echo "Usage: $0 [ecr|build|stack|deploy|destroy|status]"
            echo "  ecr     - Create ECR repository"
            echo "  build   - Build and push Docker image"
            echo "  stack   - Deploy CloudFormation stack"
            echo "  deploy  - Full deployment (ecr + build + stack)"
            echo "  destroy - Delete the stack"
            echo "  status  - Check stack status"
            exit 1
            ;;
    esac
}

main "$@"