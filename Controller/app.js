const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

let requestLog = {};

// 读取 api_info.json 文件中的 API 信息
let apiInfo = {};
try {
    const data = fs.readFileSync('api_info.json', 'utf8');
    apiInfo = JSON.parse(data);
} catch (err) {
    console.error('Error reading api_info.json:', err);
}

// 定义 API 的输入模型
class UserInput {
    constructor(Number) {
        this.Number = Number;
    }
}

// 定义 API 的输出模型
class FunctionOutput {
    constructor(result) {
        this.result = result;
    }
}

// 格式化数据为 JSON
function formatData(outputResult) {
    return { root: JSON.stringify(outputResult) };
}

// 发送带有 JSON 负载的 POST 请求
async function sendPostRequestJson(apiName, payload) {
    let url = null;
    let headers = {};

    // 获取 API 信息
    for (const api of apiInfo.apis) {
        if (api.name === apiName) {
            url = api.path;
            headers = api.request.headers;
            break;
        }
    }

    // 检查 URL 是否存在
    if (url === null) {
        throw new Error(`API named '${apiName}' not found.`);
    }

    try {
        // 发送 POST 请求
        const response = await axios.post(url, payload, { headers });
    
        // 处理响应
        if (response.status === 200) {
            const successResult = response.data.result || "No result";
            const message = `Response for ${apiName} task is ${successResult}`;
            requestLog[`${apiName}TaskSuccess`] = message;
    
            const nextApi = apiInfo.apis.find(a => a.name === apiName).next;
            if (nextApi) {
                apiName = nextApi;
                payload = formatData(successResult);
                return await sendPostRequestJson(apiName, payload);
            } else {
                return response; // 无下一个 API，返回当前响应
            }
        } else {
            return response; // 处理其他状态码，返回当前响应
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorResult = error.response.data.result || "No result";
            requestLog[`${apiName}TaskFailure`] = errorResult;
    
            const errorHandler = apiInfo.apis.find(a => a.name === apiName).error_handler;
            if (errorHandler) {
                apiName = errorHandler;
                payload = formatData(requestLog);
                return await sendPostRequestJson(apiName, payload);
            } else {
                return error.response; // 无错误处理器，返回当前响应
            }
        } else {
            console.error('Error in sendPostRequestJson:', error);
            throw error; // 抛出其他错误，以便外部处理
        }
    }
    
}

// 管理功能链的控制器函数
app.post('/api', async (req, res) => {
    payload = JSON.parse(req.body.root)

    try {
        // 触发 number 功能
        const response = await sendPostRequestJson('number', formatData(payload));
        console.log(response);

        let result;
        result = response.data.result || "No result"

        res.json(new FunctionOutput(result));
    } catch (error) {
        console.error('Error in /api:', error);
        res.status(500).json({ error: error.message });
    }
});

// 测试端点
app.post('/api/test', (req, res) => {
    const payload = req.body.Payload;
    res.json(new FunctionOutput(JSON.stringify(payload)));
});

// 在端口 5000 启动服务器
app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:5000');
});
