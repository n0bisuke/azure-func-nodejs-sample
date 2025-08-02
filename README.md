# Azure Functions Simple Sample

Azure Functions v4 の基本的な使い方を学ぶためのシンプルなサンプルプロジェクトです。

## 概要

このサンプルでは以下の2つのエンドポイントを提供します：
- `GET /api/hello` - シンプルなテキストレスポンス
- `GET /api/status` - システム情報をJSON形式で返却

## 前提条件

- Node.js 18.x - 22.x
- Azure Functions Core Tools v4

## セットアップ

1. **依存関係のインストール**
   ```bash
   cd sample
   npm install
   ```

2. **Azure Functions Core Tools のインストール（未インストールの場合）**
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

## ローカル開発

1. **開発サーバーの起動**
   ```bash
   npm start
   # または
   func start
   ```

2. **動作確認**
   ブラウザで以下のURLにアクセス：
   - http://localhost:7071/api/hello
   - http://localhost:7071/api/status

## エンドポイント詳細

### GET /api/hello
- **説明**: シンプルなhelloメッセージを返却
- **レスポンス**: テキスト形式
- **例**: `Hello from Azure Functions Sample!`

### GET /api/status
- **説明**: システム状態とメタ情報をJSON形式で返却
- **レスポンス**: JSON形式
- **例**:
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

## ファイル構成

```
sample/
├── package.json          # プロジェクト設定
├── host.json             # Azure Functions設定
├── local.settings.json   # ローカル開発設定
├── index.js              # メインの Function定義
└── README.md             # このファイル
```

## 学習ポイント

このサンプルから学べる内容：

1. **Azure Functions の基本構造**
   - `app.setup()` によるセットアップ
   - `app.http()` による HTTP エンドポイント定義

2. **エンドポイント設定**
   - `methods`: HTTP メソッド指定
   - `authLevel`: 認証レベル設定
   - `route`: ルート設定

3. **レスポンス処理**
   - テキストレスポンス
   - JSONレスポンス（適切なContent-Typeヘッダー設定）

4. **ログ出力**
   - `context.log()` によるログ記録

## 次のステップ

このサンプルを理解したら、以下の機能を追加してみてください：

- POST エンドポイントの追加
- リクエストボディの処理
- 環境変数の使用
- エラーハンドリングの強化

## トラブルシューティング

### Node.js バージョンエラー
```
Incompatible Node.js version (v24.x.x)
```
Node.js v18-22にダウングレードしてください。

### 関数が認識されない
- `package.json` と `host.json` の設定を確認
- `npm install` で依存関係を再インストール


## デプロイサンプル情報

- GitHub Actionsでデプロイする際のサンプルYML

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