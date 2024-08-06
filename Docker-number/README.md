# README

## Overview

This README provides details on interacting with a REST API endpoint that accepts a numeric string input and returns the integer value, along with metadata about the processing time and request initiation.

## Usage

### Endpoint
- **URL:** `http://localhost:5000/api`
- **Method:** POST
- **Content-Type:** application/json

### Input

To use the API, send a POST request with a JSON payload. The payload should include a key `root` containing a stringified JSON object, where the object has a key `Number` with the value being the numeric string to be converted to an integer.

#### Example Input

```sh
curl -X POST http://localhost:5000/api -H 'Content-Type: application/json' -d '{"root":"{\"Number\":\"2123214\"}"}'
```

### Output

The API response is a JSON object with the following fields:
- **result:** The integer representation of the provided numeric string.
- **start_time:** A timestamp indicating when the request was received.
- **time_taken:** The time taken in seconds to process the request.

#### Example Output

```json
{
  "result": 2123214,
  "start_time": "1722859791",
  "time_taken": "0.000234250"
}
```

### Notes
- The value of the `Number` field must be a string representation of a number.
- The response converts the numeric string to an integer and returns it in the `result` field, alongside the `start_time` and `time_taken` for processing.

This API is useful for converting numeric strings to integers and provides additional details about the request processing time and initiation.