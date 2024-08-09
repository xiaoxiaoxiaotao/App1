#!/bin/bash

# Define the image names and container names
images=("common_error_image:v1.0" "even_image:v1.0" "number_image:v1.0" "odd_image:v1.0" "controller_image:v1.0")
containers=("container1" "container2" "container3" "container4" "controller")
network_name="my_docker_network"

# Function to stop and remove a container
remove_container() {
    container_name=$1
    if [ "$(docker ps -a -q -f name=${container_name})" ]; then
        echo "Stopping and removing container ${container_name}..."
        docker stop ${container_name}
        docker rm ${container_name}
    else
        echo "Container ${container_name} does not exist. Skipping."
    fi
}

# Function to remove a Docker image
remove_image() {
    image_name=$1
    if [ "$(docker images -q ${image_name} 2> /dev/null)" ]; then
        echo "Removing image ${image_name}..."
        docker rmi ${image_name}
    else
        echo "Image ${image_name} does not exist. Skipping."
    fi
}

# Remove the containers
for container in ${containers[@]}; do
    remove_container ${container}
done

# Remove the images
for image in ${images[@]}; do
    remove_image ${image}
done

# Remove the Docker network if it exists
if [ "$(docker network ls | grep ${network_name})" ]; then
    echo "Removing Docker network ${network_name}..."
    docker network rm ${network_name}
else
    echo "Docker network ${network_name} does not exist. Skipping."
fi
