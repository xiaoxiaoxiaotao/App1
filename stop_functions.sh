#!/bin/bash

containers=("container1" "container2" "container3" "container4" "controller")

# Function to stop a container
stop_container() {
    container_name=$1
    if [ "$(docker ps -q -f name=${container_name})" ]; then
        echo "Stopping container ${container_name}..."
        docker stop ${container_name}
    else
        echo "Container ${container_name} is not running or does not exist. Skipping..."
    fi
}

# Loop through containers and stop them
for container in "${containers[@]}"; do
    stop_container ${container}
done
