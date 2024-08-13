const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// read api_info.json to extract the information of APIs
let apiInfo = {};
try {
    const data = fs.readFileSync('api_info.json', 'utf8');
    apiInfo = JSON.parse(data);
} catch (err) {
    console.error('Error reading api_info.json:', err);
}

let startFunction = apiInfo.startFunction;

// define input from user
class UserInput {
    constructor(Number) {
        this.Number = Number;
    }
}

// define output of user
class FunctionOutput {
    constructor(result) {
        this.result = result;
    }
}

// format the JSON to the input format of functions
function formatData(outputResult) {
    return { root: JSON.stringify(outputResult) };
}

async function sendPostRequestJson(apiName, payload,successResult="No result") {
    let requestLog = {};

    // Find API information by the name of the API
    const api = apiInfo.functions.find(a => a.name === apiName);
    if (!api) {
        throw new Error(`API named '${apiName}' not found.`);
    }

    const url = api.path;
    const headers = api.request.headers || {};
    const timeout = api.timeout ? parseInt(api.timeout) * 1000 : 10000; // Convert timeout to milliseconds, default to 10s

    try {
        // Send POST request with timeout
        const response = await axios.post(url, payload, { headers, timeout });

        // Handle the response
        if (response.status === 200) {
            if (api.name !== "commom_error_option1"){
                successResult = response.data.result;
                const message = `Response for ${apiName} task is ${successResult}`;
                requestLog[`${apiName}TaskSuccess`] = message;
            }

            if (api.isLast) {
                return { response, successResult }; // Return the response and result if this is the last function
            } else {
                return await nextRequest(api, response, successResult);
            }
        }

        // Return the response and result even if the status is not 200
        return { response, successResult };
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorResult = error.response.data.result || "No error log";
            requestLog[`${apiName}TaskFailure`] = errorResult;

            if (api.isLast) {
                return { response: error.response, successResult }; // Return the response and result if this is the last function
            } else {
                return await nextRequest_Error(api, error.response, requestLog, successResult);
            }
        } else {
            console.error('Error in sendPostRequestJson:', error);
            throw error; // Re-throw other unknown errors
        }
    }
}

async function nextRequest(api, response, successResult) {
    const nextApis = api.next || [];
    for (const nextApi of nextApis) {
        const condition = nextApi.condition || [];
        const isConditionMet = condition.every(c => {
            return evaluateCondition(c, response.data);
        });

        if (isConditionMet) {
            const apiName = nextApi.name;
            const payload = response.data.nextInput ? formatData(response.data.nextInput) : formatData(successResult);
            return await sendPostRequestJson(apiName, payload, successResult);
        }
    }
}

async function nextRequest_Error(api, response,requestLog, successResult) {
    const nextApis = api.next || [];
    for (const nextApi of nextApis) {
        const condition = nextApi.condition || [];
        const isConditionMet = condition.every(c => {
            return evaluateCondition(c, response.data);
        });

        if (isConditionMet) {
            const apiName = nextApi.name;
            const payload = formatData(requestLog);
            return await sendPostRequestJson(apiName, payload, successResult);
        }
    }
}

// Helper function to evaluate condition
function evaluateCondition(condition, responseData) {
    const { key, operator, val } = condition;
    const actualVal = responseData[key];

    switch (operator) {
        case "=":
            return actualVal === val;
        case "!=":
            return actualVal !== val;
        case ">":
            return actualVal > val;
        case "<":
            return actualVal < val;
        // Add more operators as needed
        default:
            return false;
    }
}

// api for controller
app.post('/api', async (req, res) => {
    const payload = JSON.parse(req.body.root);

    try {
        // trigger the first function
        const {response, successResult} = await sendPostRequestJson(startFunction, formatData(payload)); //"number" is the first function of function chain!

        // Returning both the response and successResult to the client
        res.json({
            FailureTask: response.data.result,
            FunctionResult: successResult,
        });
    } catch (error) {
        console.error('Error in /api:', error);
        res.status(500).json({ error: error.message });
    }
});

// start service at 0.0.0.0:5000
app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:5000');
});
