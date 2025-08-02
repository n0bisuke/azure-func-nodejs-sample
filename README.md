# Azure Functions Simple Sample

This is a simple sample project to learn the basics of Azure Functions v4.

## Overview

This sample provides the following two endpoints:
- `GET /api/hello` - Returns a simple text response
- `GET /api/status` - Returns system information as JSON

## Prerequisites

- Node.js 18.x - 22.x
- Azure Functions Core Tools v4

## Setup

1. **Install dependencies**
   ```bash
   cd sample
   npm install
   ```

2. **Install Azure Functions Core Tools (if not already installed)**
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

## Local Development

1. **Start the development server**
   ```bash
   npm start
   # or
   func start
   ```

2. **Check if it's working**
   Open the following URLs in your browser:
   - http://localhost:7071/api/hello
   - http://localhost:7071/api/status

## Endpoint Details

### GET /api/hello
- **Description**: Returns a simple hello message
- **Response**: Plain text
- **Example**: `Hello from Azure Functions Sample!`

### GET /api/status
- **Description**: Returns system status and meta information in JSON format
- **Response**: JSON
- **Example**:
  ```json
  {
    "message": "Azure Functions Sample is running",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "node_version": "v18.17.0",
    "endpoints": [
      "GET /api/hello - Simple hello message",
      "GET /api/status - System status information"
    ]
  }
  ```

## File Structure

```
sample/
├── package.json          # Project configuration
├── host.json             # Azure Functions configuration
├── local.settings.json   # Local development settings
├── index.js              # Main function definition
└── README.md             # This file
```

## Learning Points

What you can learn from this sample:

1. **Basic structure of Azure Functions**
   - Setup using `app.setup()`
   - Define HTTP endpoints with `app.http()`

2. **Endpoint configuration**
   - `methods`: Specify HTTP methods
   - `authLevel`: Set authentication level
   - `route`: Route settings

3. **Response handling**
   - Text response
   - JSON response (with appropriate Content-Type headers)

4. **Logging**
   - Use `context.log()` to log messages

## Next Steps

After understanding this sample, try adding the following features:

- Add a POST endpoint
- Handle request bodies
- Use environment variables
- Enhance error handling

## Troubleshooting

### Node.js version error
```
Incompatible Node.js version (v24.x.x)
```
Please downgrade to Node.js v18-22.

### Function not recognized
- Check your `package.json` and `host.json` configuration
- Reinstall dependencies with `npm install`

## Deployment Sample

- Example YAML for deploying with GitHub Actions

```.github/workflows/deploy.yml
# Docs for the Azure Web Apps Deploy action: https://github.com/azure/functions-action
# More GitHub Actions for Azure: https://github.com/Azure/actions

name: Build and deploy Node.js project to Azure Function App - n0bisuke-functions-apps

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.' # set this to the path to your web app project, defaults to the repository root
  NODE_VERSION: '22.x' # set this to the node version to use (supports 8.x, 10.x, 12.x)

jobs:
  build:
    runs-on: windows-latest
    permissions:
      contents: read #This is required for actions/checkout
      
    steps:
      - name: 'Checkout GitHub Action'
        uses: actions/checkout@v4

      - name: Setup Node ${{ env.NODE_VERSION }} Environment
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: 'Resolve Project Dependencies Using Npm'
        shell: pwsh
        run: |
          pushd './${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
          npm install
          npm run build --if-present
          npm run test --if-present
          popd

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: .

  deploy:
    runs-on: windows-latest
    needs: build
    permissions:
      id-token: write #This is required for requesting the JWT
      contents: read #This is required for actions/checkout

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app
      
      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZUREAPPSERVICE_CLIENTID_650E1610E8C942409D491D10A3140367 }}
          tenant-id: ${{ secrets.AZUREAPPSERVICE_TENANTID_D2FF7AC8229D433EA070BBA9090182B1 }}
          subscription-id: ${{ secrets.AZUREAPPSERVICE_SUBSCRIPTIONID_999EA92F462041398310F89937402453 }}

      - name: 'Run Azure Functions Action'
        uses: Azure/functions-action@v1
        id: fa
        with:
          app-name: 'n0bisuke-functions-apps'
          slot-name: 'Production'
          package: ${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
          
```