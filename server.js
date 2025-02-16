const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/chat', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');

    try {
        if (!req.body || !req.body.bot_id || !req.body.user_id) {
            console.error('请求参数验证失败:', req.body);
            return res.status(400).json({
                error: '请求失败',
                message: '缺少必要的请求参数：bot_id 或 user_id',
                details: req.body
            });
        }

        console.log('发送请求到Coze API:', req.body);
        const response = await axios({
            method: 'post',
            url: 'https://api.coze.cn/v3/chat',
            headers: {
                'Authorization': `Bearer ${process.env.COZE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: req.body,
            responseType: 'text',
            timeout: 120000,
            httpsAgent: new https.Agent({
                keepAlive: true,
                timeout: 120000,
                rejectUnauthorized: false
            })
        });

        console.log('收到Coze API响应:', response.status, response.statusText);
        const responseText = response.data;
        
        // 使用更可靠的方式处理事件流
        let contentParts = [];
        let currentMessage = '';
        let isCollectingData = false;

        const lines = responseText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('event:conversation.message.delta')) {
                isCollectingData = true;
                continue;
            }

            if (isCollectingData && line.startsWith('data:')) {
                try {
                    const data = JSON.parse(line.slice(5));
                    if (data.content) {
                        currentMessage += data.content;
                        // 实时发送消息片段到客户端
                        res.write(`data: ${JSON.stringify({ content: data.content })}\n\n`);
                    }
                } catch (e) {
                    console.error('解析事件流数据失败:', e, '原始数据:', line);
                }
                isCollectingData = false;
            }

            // 检测消息结束
            if (line === '') {
                if (currentMessage) {
                    contentParts.push(currentMessage);
                    currentMessage = '';
                }
            }
        }

        // 组合完整的回复内容
        const finalContent = contentParts.join('');

        if (!finalContent) {
            console.error('无法从API响应中提取有效回复:', responseText);
            return res.write(`data: ${JSON.stringify({
                error: '处理失败',
                message: '无法从API响应中提取有效回复'
            })}\n\n`);
        }

        console.log('成功提取AI回复:', finalContent);
        // 发送结束标记
        res.write(`data: [DONE]\n\n`);
        res.end();

    } catch (error) {
        console.error('请求处理失败:', error.message);
        if (error.response) {
            console.error('API错误响应:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }

        res.write(`data: ${JSON.stringify({
            error: '请求失败',
            message: error.response?.data?.message || error.message || '服务器内部错误',
            details: error.response?.data || null
        })}\n\n`);
        res.end();
    }
});

const server = app.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});

server.timeout = 120000;
server.keepAliveTimeout = 120000;