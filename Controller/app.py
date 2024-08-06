from fastapi import FastAPI
from pydantic import BaseModel
import requests
import sys
import json

app = FastAPI()
with open("api_info.json", 'r') as f:
    api_info = json.load(f)

# Define the input model for the API
class NumberInput(BaseModel):
    Number: str

# Define the output model for the API
class FunctionOutput(BaseModel):
    status: str
    result: str

def SendPostRequest_json(api_name,payload):
    url = None
    for api in api_info['apis']:
        if api['name'] == api_name:
            url = api['path']
            headers = api['headers']
            break
    # send post request
    response = requests.post(url, json=payload, headers=headers)
    return response

# Controller function to manage the function chain
@app.post("/controller", response_model=None)
def controller(input_data: NumberInput):
    payload = input_data.dict()

    # Trigger the number function
    number_response = SendPostRequest_json("number",payload)
    
    if number_response.status == "Failure":
        # If error, call error function
        error_response = SendPostRequest_json("error",number_response.result)
        return error_response
    else:
        # If success, proceed to odd function
        odd_response = SendPostRequest_json("odd",number_response.result)
        
        if odd_response.status == "Failure":
            error_response = SendPostRequest_json("error",odd_response.result)
            return error_response
        
@app.post("/api/test", response_model=FunctionOutput)
def test(input_data: NumberInput):
    payload = input_data.dict()["Number"]
    item = {
        "status": "Success",
        "result": str(payload),
    }
    return item