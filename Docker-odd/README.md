# README

## Overview

This README outlines the usage of a REST API endpoint that determines whether a given number is odd or even. The API accepts a JSON payload containing a numeric value and returns a message indicating the number's parity, along with metadata about the request processing.

## Usage

### Endpoint
- **URL:** `http://localhost:5000/api`
- **Method:** POST
- **Content-Type:** application/json

### Input

To utilize this API, send a POST request with a JSON payload. The payload must include a key `root` containing a stringified JSON object. This object should have a key `Number` with a numeric value to be evaluated for parity.

#### Example Input

```sh
curl -X POST http://localhost:5000/api -H 'Content-Type: application/json' -d '{"root":"{\"Number\":212323}"}'
```

### Output

The API responds with a JSON object containing the following fields:
- **result:** A string indicating whether the provided number is odd or even.
- **start_time:** A timestamp representing when the request was received.
- **time_taken:** The duration in seconds taken to process the request.

#### Example Output

```json
{
  "result": "woohoo odd number",
  "start_time": "1722860021",
  "time_taken": "0.000051882"
}
```

### Notes
- The value of the `Number` field should be an integer.
- The response will indicate the parity of the number, with a message specifying if it is odd (`"woohoo odd number"`) or even. It also provides the `start_time` and `time_taken` for processing.

This API serves as a simple tool to check the parity of a given number and provides additional details regarding the processing time and request start time.