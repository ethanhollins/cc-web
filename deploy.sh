#!/bin/bash

# Deploy script for cc-web Next.js application to S3
# This script builds the application and uploads it to S3 for static hosting
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh dev

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="out"
ENVIRONMENT="${1:-dev}"  # Default to 'dev' if no environment specified

# AWS Configuration - use environment variables by default, fallback to profile
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${BLUE}🔑 Using AWS credentials from environment variables${NC}"
    AWS_CLI_ARGS=""
else
    AWS_PROFILE="${AWS_PROFILE:-default}"
    echo -e "${BLUE}🔑 Using AWS profile: ${AWS_PROFILE}${NC}"
    AWS_CLI_ARGS="--profile $AWS_PROFILE"
fi

echo -e "${BLUE}🚀 Starting deployment process for environment: ${YELLOW}${ENVIRONMENT}${NC}"

# Load environment variables
ENV_FILE=".env.${ENVIRONMENT}"
if [ -f "$ENV_FILE" ]; then
    echo -e "${BLUE}📋 Loading environment variables from ${ENV_FILE}...${NC}"
    set -a  # Automatically export all variables
    source "$ENV_FILE"
    set +a  # Stop auto-exporting
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file ${ENV_FILE} not found, continuing without it...${NC}"
fi

# Set NODE_ENV based on environment
export NODE_ENV="${ENVIRONMENT}"
echo -e "${BLUE}🔧 NODE_ENV set to: ${NODE_ENV}${NC}"

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

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf $BUILD_DIR

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

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
aws s3 sync $BUILD_DIR s3://"$BUCKET_NAME" \
    $AWS_CLI_ARGS \
    --delete

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Note: It may take a few minutes for changes to propagate${NC}"
