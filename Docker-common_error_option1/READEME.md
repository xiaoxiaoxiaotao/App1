# README

## Overview

This document provides instructions for using a REST API endpoint to process task results. The API receives task information in JSON format and returns a response indicating the task status along with a timestamp and time taken for processing.

## Usage

### Endpoint
- **URL:** `http://localhost:5000/api`
- **Method:** POST
- **Content-Type:** application/json

### Input

To use this API, send a POST request with a JSON payload containing task details. The payload should include a key `root` with a value that is a stringified JSON object. The object can contain details about various tasks, including both successes and failures.

#### Example Input

```sh
curl -X POST http://localhost:5000/api -H 'Content-Type: application/json' -d '{  
  "root": "{\"Task1Failure\":\"Error details for Task 1\",\"Task2Success\":\"Success details for Task 2\",\"AnotherTaskFailure\":\"Error details for Another Task\"}"  
}'
```

### Output

The API response is a JSON object containing the following fields:
- **result:** The key of the task that was processed or identified.
- **start_time:** A timestamp indicating when the request was received.
- **time_taken:** The time taken to process the request.

#### Example Output

```json
{
  "result": "AnotherTask",
  "start_time": "1722858227",
  "time_taken": "0.000407243"
}
```

### Notes
- Ensure that the JSON string provided in the `root` key is properly escaped and formatted.
- The API response will include the task key processed (`result`), the starting timestamp (`start_time`), and the time taken (`time_taken`) to process the input.

This API is designed for testing and evaluation purposes, and it can handle both success and failure cases for different tasks.