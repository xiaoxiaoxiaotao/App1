# Docker-Based Function Chaining System

This project is a Docker-based function chaining system that includes multiple containers, each running a specific service. The system is controlled by a central controller that manages the flow of data between these services.

## Project Structure

```
App1/
│
├── Docker-common_error_option1/
│   ├── node_modules/               # Node.js dependencies (not included in version control)
│   ├── api_info.json               # API configuration file
│   ├── app.js                      # Main application logic for the controller
│   ├── Dockerfile                  # Dockerfile for the controller
│    ├── package.json                # Node.js package file
│    └──package-lock.json           # Node.js lock file
│
├── Docker-common_error_option1/
│   ├── functions/              # Contains Go functions related to common errors
│   ├── app.go                  # Main application logic for this service
│   ├── Dockerfile              # Dockerfile for building this service's image
│   ├── go.mod                  # Go module file
│   └── go.sum                  # Go module dependencies
│
├── Docker-even/
│   ├── functions/              # Contains Go functions for even number handling
│   ├── Even.go                 # Main logic for even number service
│   ├── app.go                  # Main application logic for this service
│   ├── Dockerfile              # Dockerfile for building this service's image
│   ├── go.mod                  # Go module file
│   └── go.sum                  # Go module dependencies
│
├── Docker-number/
│   ├── functions/              # Contains Go functions for number handling
│   ├── number.go               # Main logic for number service
│   ├── app.go                  # Main application logic for this service
│   ├── Dockerfile              # Dockerfile for building this service's image
│   ├── go.mod                  # Go module file
│   └── go.sum                  # Go module dependencies
│
├── Docker-odd/
│   ├── functions/              # Contains Go functions for odd number handling
│   ├── functions.go            # Main logic for odd number service
│   ├── app.go                  # Main application logic for this service
│   ├── Dockerfile              # Dockerfile for building this service's image
│   ├── go.mod                  # Go module file
│   └── go.sum                  # Go module dependencies
│
├── .gitignore                  # Git ignore file for excluding unnecessary files
├── remove_image_container.sh   # Script to remove all containers and images
├── start_functions.sh          # Script to build and start all containers
└── stop_functions.sh           # Script to stop all running containers
```

## Prerequisites

- Docker
- Docker Compose (optional, for orchestrating containers)
- Node.js and npm (for the controller)
- Go (for the individual services)

## Setup Instructions

### 1. Build and Start Containers

To build the Docker images and start the containers, run the following script:

```bash
./start_functions.sh
```

This script will:
- Create a Docker network (`my_docker_network`) if it doesn't already exist. Dockers will conmunicate each other through this Docker network.
- Build Docker images for each service if they don't already exist.
- Start containers for each service, binding them to specific ports:
  - Controller: `localhost:5000`
  - Even Service: `localhost:5001`
  - Odd Service: `localhost:5002`
  - Number Service: `localhost:5003`
  - Common Error Handler: `localhost:5004`

### 2. Stopping Containers

To stop all running containers, execute the following script:

```bash
./stop_functions.sh
```

This script will stop all containers defined in the project.

### 3. Removing Containers and Images

To remove all containers and Docker images related to the project, use the following script:

```bash
./remove_image_container.sh
```

This script will:
- Stop and remove all containers defined in the project.
- Remove all Docker images associated with the services.
- Remove the Docker network if it exists.

## Usage

- The system is designed to chain functions, passing data between different services.
- Each service is responsible for handling a specific task, such as processing even numbers, odd numbers, or handling common errors.
- The `Controller` service orchestrates the flow by making requests to each service based on the input received from the user.

### Example API Call

You can test the controller by sending a POST request:

```bash
curl -X POST http://localhost:5000/api -H 'Content-Type: application/json' -d '{"root":"{\"Number\":\"2123214\"}"}'
```

You can expect the following results:
```bash
{"result":"oddTask"}
```

Here is another example:

```bash
curl -X POST http://localhost:5000/api -H 'Content-Type: application/json' -d '{"root":"{\"Number\":\"2123215\"}"}'
```

You can expect the following results:
```bash
{"result":"evenTask"}
```

This request will:
- Trigger the `number` service, which will then route `odd` service and next `even` service.
- If an error occurs, the `common_error_handler` service will handle it and return all errors during the conduction of function chain.

## Notes

- Ensure all required ports (5000-5004) are free before starting the services.
- The `api_info.json` file in the `Controller` directory contains the configuration for routing requests between the services.
