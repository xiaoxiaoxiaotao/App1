const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

let requestLog = {};

// read api_info.json to extract the iinformation of APIs
let apiInfo = {};
try {
    const data = fs.readFileSync('api_info.json', 'utf8');
    apiInfo = JSON.parse(data);
} catch (err) {
    console.error('Error reading api_info.json:', err);
}

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

// formatt the JSON to the input format of functions
function formatData(outputResult) {
    return { root: JSON.stringify(outputResult) };
}

// send a request to function chain (conduct recursively)
async function sendPostRequestJson(apiName, payload) {
    let url = null;
    let headers = {};

    // find API inforation through the name of api
    for (const api of apiInfo.apis) {
        if (api.name === apiName) {
            url = api.path;
            headers = api.request.headers;
            break;
        }
    }

    // check URL
    if (url === null) {
        throw new Error(`API named '${apiName}' not found.`);
    }

    try {
        // send post request
        const response = await axios.post(url, payload, { headers });
    
        // get response
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
                return response; // if there is not next api, this is the last function of chain, so just return this to user
            }
        } else {
            return response; // this has not conducted by the app yet
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
                return error.response; // no error handler, this has not conducted by the app yet
            }
        } else {
            console.error('Error in sendPostRequestJson:', error);
            throw error; // other unknown error
        }
    }
    
}

// api for controller
app.post('/api', async (req, res) => {
    payload = JSON.parse(req.body.root)

    try {
        // trigger number function
        const response = await sendPostRequestJson('number', formatData(payload)); //"number" is the first function of function chain!
        console.log(response);

        let result;
        result = response.data.result || "No result"

        res.json(new FunctionOutput(result));
    } catch (error) {
        console.error('Error in /api:', error);
        res.status(500).json({ error: error.message });
    }
});

// start service at 0.0.0.0:5000
app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:5000');
});
