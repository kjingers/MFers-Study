#!/bin/bash

# Azure Setup Script for MFers Bible Study App
# This script creates the necessary Azure resources for deployment

set -e

# Configuration - Update these values
RESOURCE_GROUP="mfers-bible-study-rg"
LOCATION="eastus2"
STATIC_WEB_APP_NAME="mfers-bible-study"
OPENAI_RESOURCE_NAME="mfers-openai"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MFers Bible Study - Azure Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed.${NC}"
    echo "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
echo -e "${YELLOW}Checking Azure login status...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}Not logged in. Starting Azure login...${NC}"
    az login
fi

echo -e "${GREEN}✓ Logged in to Azure${NC}"
echo ""

# Show current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "Current subscription: ${GREEN}$SUBSCRIPTION${NC}"
echo ""

# Confirm before proceeding
read -p "Do you want to create resources in this subscription? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Step 1: Create Resource Group
echo ""
echo -e "${YELLOW}Step 1: Creating Resource Group...${NC}"
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo -e "${GREEN}✓ Resource group '$RESOURCE_GROUP' already exists${NC}"
else
    az group create \
        --name $RESOURCE_GROUP \
        --location $LOCATION \
        --output none
    echo -e "${GREEN}✓ Resource group '$RESOURCE_GROUP' created${NC}"
fi

# Step 2: Create Static Web App
echo ""
echo -e "${YELLOW}Step 2: Creating Azure Static Web App...${NC}"
echo -e "${YELLOW}Note: You'll need to connect this to your GitHub repository manually.${NC}"

if az staticwebapp show --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${GREEN}✓ Static Web App '$STATIC_WEB_APP_NAME' already exists${NC}"
else
    az staticwebapp create \
        --name $STATIC_WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --sku Free \
        --output none
    echo -e "${GREEN}✓ Static Web App '$STATIC_WEB_APP_NAME' created${NC}"
fi

# Get deployment token
echo ""
echo -e "${YELLOW}Getting deployment token...${NC}"
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "properties.apiKey" -o tsv)

echo -e "${GREEN}✓ Deployment token retrieved${NC}"
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}IMPORTANT: Save this deployment token!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Add this as a GitHub secret named 'AZURE_STATIC_WEB_APPS_API_TOKEN':"
echo ""
echo -e "${GREEN}$DEPLOYMENT_TOKEN${NC}"
echo ""

# Step 3: Azure OpenAI (Manual steps)
echo ""
echo -e "${YELLOW}Step 3: Azure OpenAI Setup${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Azure OpenAI requires manual setup. Please follow these steps:"
echo ""
echo "1. Go to the Azure Portal: https://portal.azure.com"
echo ""
echo "2. Create an Azure OpenAI resource:"
echo "   - Search for 'Azure OpenAI' in the marketplace"
echo "   - Click 'Create'"
echo "   - Select resource group: $RESOURCE_GROUP"
echo "   - Region: East US (or your preferred region with OpenAI availability)"
echo "   - Name: $OPENAI_RESOURCE_NAME"
echo "   - Pricing tier: Standard S0"
echo ""
echo "3. Deploy a model:"
echo "   - Go to Azure OpenAI Studio: https://oai.azure.com"
echo "   - Click 'Deployments' > 'Create new deployment'"
echo "   - Select model: gpt-4 (or gpt-35-turbo for lower cost)"
echo "   - Deployment name: gpt-4 (remember this name)"
echo ""
echo "4. Get your API credentials:"
echo "   - Go to your Azure OpenAI resource in Azure Portal"
echo "   - Click 'Keys and Endpoint'"
echo "   - Copy KEY 1 and Endpoint"
echo ""
echo "5. Configure environment variables in Static Web App:"
echo "   - Go to your Static Web App in Azure Portal"
echo "   - Click 'Configuration' > 'Application settings'"
echo "   - Add the following settings:"
echo "     - AZURE_OPENAI_ENDPOINT: <your-endpoint>"
echo "     - AZURE_OPENAI_API_KEY: <your-key>"
echo "     - AZURE_OPENAI_DEPLOYMENT: gpt-4"
echo ""

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Resources created:"
echo "  - Resource Group: $RESOURCE_GROUP"
echo "  - Static Web App: $STATIC_WEB_APP_NAME"
echo ""
echo "Next steps:"
echo "  1. Add the deployment token as a GitHub secret"
echo "  2. Complete Azure OpenAI setup (manual)"
echo "  3. Push to main branch to trigger deployment"
echo ""
echo "Static Web App URL will be available after first deployment."
echo ""

# Get the Static Web App URL
SWA_URL=$(az staticwebapp show \
    --name $STATIC_WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "defaultHostname" -o tsv 2>/dev/null || echo "Not yet available")

if [ "$SWA_URL" != "Not yet available" ]; then
    echo -e "Your app URL: ${GREEN}https://$SWA_URL${NC}"
fi
