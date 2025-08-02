const { app } = require('@azure/functions');

// Azure Functions セットアップ
app.setup({});

// Hello エンドポイント
app.http('hello', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'hello',
    handler: async (request, context) => {
        context.log('Hello endpoint called');
        
        return {
            status: 200,
            body: 'Hello from Azure Functions Sample!'
        };
    }
});

// Status エンドポイント（JSON レスポンス）
app.http('status', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'status',
    handler: async (request, context) => {
        context.log('Status endpoint called');
        
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Azure Functions Sample is running',
                timestamp: new Date().toISOString(),
                node_version: process.version,
                endpoints: [
                    'GET /api/hello - Simple hello message',
                    'GET /api/status - System status information'
                ]
            })
        };
    }
});