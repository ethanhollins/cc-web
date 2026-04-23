#!/bin/bash

# Deploy script for cc-web Next.js application to S3
# This script builds the application and uploads it to S3 for static hosting
# Usage: ./deploy.sh [environment] [--destroy] [--force]
# Example: ./deploy.sh dev
# Example: ./deploy.sh feat-cc-123
# Example: ./deploy.sh feat-cc-123 --destroy
# Example: ./deploy.sh feat-cc-123 --destroy --force

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="out"
ENVIRONMENT="$(echo "${1:-dev}" | tr '[:upper:]' '[:lower:]')"  # Supported: dev or feat-<ticket-code>
DESTROY="${2:-}"  # Pass --destroy to delete the environment from S3 instead of deploying
FORCE="${3:-}"   # Pass --force to skip the confirmation prompt when destroying

if [[ "$ENVIRONMENT" != "dev" && ! "$ENVIRONMENT" =~ ^feat-cc-[0-9]+$ ]]; then
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}Usage: ./deploy.sh dev | ./deploy.sh feat-cc-123 (case-insensitive input)${NC}"
    exit 1
fi

if [ "$ENVIRONMENT" = "dev" ]; then
    S3_PREFIX="dev"
else
    S3_PREFIX="$ENVIRONMENT"
fi

if [ "$DESTROY" = "--destroy" ]; then
    echo -e "${BLUE}🗑️  Starting destroy process for environment: ${YELLOW}${ENVIRONMENT}${NC}"
else
    echo -e "${BLUE}🚀 Starting deployment process for environment: ${YELLOW}${ENVIRONMENT}${NC}"
fi

# Load environment variables
ENV_FILE=".env.${ENVIRONMENT}"
# Feature environments share dev config unless an explicit feature env file exists.
if [ ! -f "$ENV_FILE" ] && [[ "$ENVIRONMENT" =~ ^feat- ]]; then
    ENV_FILE=".env.dev"
fi

if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}📋 Loading environment variables from ${ENV_FILE}...${NC}"
    set -a  # Automatically export all variables
    source "$ENV_FILE"
    set +a  # Stop auto-exporting
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file ${ENV_FILE} not found, continuing without it...${NC}"
fi

# AWS Configuration - use environment variables by default, fallback to profile
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${BLUE}🔑 Using AWS credentials from environment variables${NC}"
    AWS_CLI_ARGS=""
else
    AWS_PROFILE="${AWS_PROFILE:-default}"
    echo -e "${BLUE}🔑 Using AWS profile: ${AWS_PROFILE}${NC}"
    AWS_CLI_ARGS="--profile $AWS_PROFILE"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Install with: brew install awscli"
    exit 1
fi



# Get AWS Account ID
echo -e "${BLUE}🔍 Getting AWS Account ID...${NC}"
AWS_ACCOUNT=$(aws sts get-caller-identity $AWS_CLI_ARGS --query Account --output text)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to get AWS Account ID. Please check your AWS credentials.${NC}"
    exit 1
fi

BUCKET_NAME="cc-web-app-bucket-${AWS_ACCOUNT}"
echo -e "${GREEN}✅ Using bucket: ${BUCKET_NAME}${NC}"

# Destroy mode: delete the environment prefix from S3 and exit
if [ "$DESTROY" = "--destroy" ]; then
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo -e "${RED}❌ Cannot destroy the 'dev' environment.${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⚠️  This will permanently delete all files at s3://${BUCKET_NAME}/${S3_PREFIX}/${NC}"
    if [ "$FORCE" != "--force" ]; then
        read -r -p "Are you sure? Type the environment name to confirm: " CONFIRM
        if [ "$CONFIRM" != "$ENVIRONMENT" ]; then
            echo -e "${RED}❌ Confirmation did not match. Aborting.${NC}"
            exit 1
        fi
    fi
    echo -e "${BLUE}🗑️  Deleting s3://${BUCKET_NAME}/${S3_PREFIX}/...${NC}"
    aws s3 rm "s3://${BUCKET_NAME}/${S3_PREFIX}/" $AWS_CLI_ARGS --recursive
    echo -e "${GREEN}✅ Environment '${ENVIRONMENT}' destroyed successfully.${NC}"
    exit 0
fi

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf $BUILD_DIR .next

# Install dependencies (NODE_ENV must not be production here, or npm will skip devDependencies like TypeScript)
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Static build should always run in production mode
export NODE_ENV="production"
echo -e "${BLUE}🔧 NODE_ENV set to: ${NODE_ENV}${NC}"

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run export

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed - $BUILD_DIR directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Upload to S3
echo -e "${BLUE}☁️  Uploading to S3...${NC}"
aws s3 sync "$BUILD_DIR" "s3://${BUCKET_NAME}/${S3_PREFIX}/" \
    $AWS_CLI_ARGS \
    --delete

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Deployment prefix: ${S3_PREFIX}/ in s3://${BUCKET_NAME}${NC}"
echo -e "${YELLOW}💡 Note: It may take a few minutes for changes to propagate${NC}"
