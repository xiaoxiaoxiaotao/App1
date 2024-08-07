from fastapi import FastAPI
from pydantic import BaseModel
import requests
import json
from typing import Any

app = FastAPI()
request_log = {}

with open("api_info.json", 'r') as f:
    api_info = json.load(f)

# Define the input model for the API
class UserInput(BaseModel):
    Number: str

# Define the output model for the API
class FunctionOutput(BaseModel):
    result: str

def formatData(outputResult: str) -> json:
    return {"root": str(outputResult)}

def SendPostRequest_json(api_name: str, payload: Any) -> requests.Response:
    url = None
    headers = {}

    # get api information
    for api in api_info['apis']:
        if api['name'] == api_name:
            url = api['path']
            headers = api["request"]["headers"]
            break

    # check url
    if url is None:
        raise ValueError(f"API named '{api_name}' not found.")

    while True:
        # send post request
        response = requests.post(url, json=payload, headers=headers)

        # check error and log
        if response.status_code == 400:
            try:
                error_result = response.json().get("result", "No result")
            except json.JSONDecodeError:
                error_result = "No result"
            request_log[f'{api_name}TaskFailure'] = error_result
            if api.get("error_handler"):
                api_name = api["error_handler"]
                payload = formatData(json.dumps(request_log, indent=4))
            else:
                break
        elif response.status_code == 200:
            try:
                success_result = response.json().get("result", "No result")
            except json.JSONDecodeError:
                success_result = "No result"
            message = f'Response for {api_name} task is {success_result}'
            request_log[f'{api_name}TaskSuccess'] = message
            if api.get("next"):
                api_name = api["next"]
                payload = formatData(success_result)
            else:
                break
        else:
            break
    return response

# Controller function to manage the function chain
@app.post("/controller", response_model=FunctionOutput)
def controller(input_data: UserInput):
    payload = input_data.dict()

    # Trigger the number function
    response = SendPostRequest_json("number", formatData(payload))

    try:
        if response.headers.get("Content-Type") == "application/json":
            result = response.json().get("result", "No result")
        else:
            result = "No JSON response"
    except json.JSONDecodeError:
        result = "No result"

    return {"result": result}

@app.post("/api/test", response_model=FunctionOutput)
def test(input_data: UserInput):
    payload = input_data.Payload
    return {"result": str(payload)}
