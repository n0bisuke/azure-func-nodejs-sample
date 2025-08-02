# Azure Functions + Node.js 開発グランドルール

## 新しいAIアシスタントへの引き継ぎ事項

このドキュメントは、Azure Functions + Node.js プロジェクトで他のAIが作業する際の重要なガイドラインです。Discord Bot から Azure Functions への移行プロジェクトで得られた知見をまとめています。

## 1. Node.js バージョン制約（最重要）

```bash
# ✅ 対応バージョン
Node.js 18.x - 22.x

# ❌ 非対応バージョン  
Node.js 24.x (Azure Functions Core Tools未対応)
```

**症状と対処法:**
- エラー: `Incompatible Node.js version (v24.x.x)`
- 対処: `nodebrew use v22` または `nvm use 22` でダウングレード
- 確認: `node -v` でバージョン確認必須

## 2. package.json 必須構成

**成功パターン:**
```json
{
  "main": "index.js",           // エントリーポイント必須
  "engines": {
    "node": ">=22.0.0"          // バージョン制約明記
  },
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests specified - skipping\" && exit 0"  // exit 0必須
  },
  "dependencies": {
    "@azure/functions": "^4.5.0"
  }
}
```

**失敗パターンと対処:**
- `"test": "exit 1"` → GitHub Actions デプロイ失敗
- `"main"` フィールド未記載 → Function runtime エラー
- engines 未指定 → バージョン競合

## 3. host.json 最適化パターン

**成功パターン:**
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    },
    "logLevel": {
      "default": "Information"
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "functionTimeout": "00:05:00"
}
```

**避けるべき設定:**
```json
{
  "customHandler": {  // ← 不要な場合は削除
    "description": {...}
  }
}
```

## 4. デプロイ失敗パターンと解決法

### パターン1: HTTP Worker timeout
- **症状**: `Host thresholds exceeded` エラー
- **原因**: index.js が見つからない、app.setup() 未実行
- **解決**: package.json の "main" フィールド確認

### パターン2: npm test 失敗でデプロイ中断
- **症状**: GitHub Actions で `npm test` が exit 1
- **解決**: test script を `exit 0` に変更

### パターン3: ZipDeploy Internal Server Error
- **症状**: Azure へのアップロード時 500 エラー
- **解決**: .funcignore でファイルサイズ削減

### パターン4: Module not found
- **症状**: `Cannot find module './index'`
- **解決**: package.json の main フィールドとファイル名一致確認

## 5. ファイル構成の制約

**単一ファイル構成（推奨）:**
```
index.js          # 全エンドポイント定義
libs/
  discord.js      # 共通ライブラリ
  teams.js
package.json
host.json
```

**複数ファイル構成（注意）:**
- `src/functions/` 分割は Azure Functions の検出に問題が生じる場合あり
- 分割時は host.json、package.json の再確認必須
- 「まずはさっきの動く状態 ファイルを分割する前に戻しつつ」のユーザーコメント通り、動作確認後に分割

## 6. 必須の事前チェック項目

デプロイ前に以下を確認:
```bash
# 1. Node.js バージョン確認
node -v  # 18.x-22.x であること

# 2. ローカル動作確認
npm start  # func start のエイリアス
curl http://localhost:7071/api/hello  # レスポンス確認

# 3. package.json 構文確認  
npm install  # エラーが出ないこと

# 4. 関数定義確認
# app.http() が正しく定義されていること
# app.setup() が実行されていること
```

## 7. エラー発生時のデバッグ手順

### 段階的デバッグアプローチ
1. **Azure Portal でログ確認**
   - Function App → Monitor → Live Metrics
   - Log Stream で実時間ログ確認

2. **ローカル再現**
   - `npm start` で同じエラーが出るか確認
   - curl でエンドポイントテスト

3. **設定ファイル見直し**
   - package.json の main, scripts, engines
   - host.json の extensionBundle
   - index.js の app.setup() 実行確認

4. **段階的デプロイ**
   - 最小構成で成功確認
   - 機能を段階的に追加

### 典型的なエラーメッセージと対処
- `context.log.error is not a function` → `context.error()` に修正
- `Cannot read properties of undefined (reading 'body')` → webhook_body 全体を渡す
- `プログラムではなくhost.jsonなどほかの部分もチェック` → 設定ファイル見直し

## 8. 成功した最終構成

この構成で確実にデプロイできることを確認済み:
- **Node.js**: v22.x
- **package.json**: main="index.js", test exit 0
- **host.json**: シンプルな構成（customHandler なし）
- **index.js**: app.setup() + 3つのエンドポイント
- **libs/**: discord.js, teams.js での機能分離

## 9. Azure Functions Core Tools 使用上の注意

```bash
# ✅ 正しい起動方法
npm start  # package.json で "start": "func start" 定義済み

# ❌ 直接実行は避ける
func start  # npm script 経由を推奨
```

## 10. GitHub Actions CI/CD での注意点

- **test script**: `exit 0` でないとデプロイ失敗
- **Node.js バージョン**: Actions でも 18.x-22.x 指定
- **デプロイ成功の確認**: ログで「デプロイがうまくいきました！」確認

## 11. 今後の作業時の注意点

- **ファイル分割は慎重に**: 動作確認してから実施
- **バージョン更新は段階的に**: Node.js, Azure Functions バージョン
- **デプロイ前にローカル確認**: エラーの早期発見
- **設定変更は最小限**: 動く構成をベースに小さく変更
- **問題発生時は基本に戻る**: シンプル構成から段階的に拡張

## 12. 参考情報

- Azure Functions Node.js v4 プログラミングモデル
- GitHub Webhook処理パターン
- Discord/Teams Webhook 送信仕様
- プロトアウト社内システム連携仕様

---

**最重要**: このガイドラインは実際のトラブルシューティング経験に基づいています。新しい問題が発生した場合は、このドキュメントを更新してください。