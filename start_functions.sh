#!/bin/bash

# Define the directories, image names, container names, and ports
dirs=("Docker-common_error_option1" "Docker-even" "Docker-number" "Docker-odd" "Docker-Controller")
images=("common_error_image:v1.0" "even_image:v1.0" "number_image:v1.0" "odd_image:v1.0" "controller_image:v1.0")
containers=("container1" "container2" "container3" "container4" "controller")
ports=(5001 5002 5003 5004 5000)
network_name="my_docker_network"

# Function to build Docker images if they don't exist
build_image() {
    dir=$1
    image_name=$2
    if [[ "$(docker images -q ${image_name} 2> /dev/null)" == "" ]]; then
        echo "Building image ${image_name} from directory ${dir}..."
        docker build -t ${image_name} ${dir}
    else
        echo "Image ${image_name} already exists. Skipping build."
    fi
}

# Function to start a container
start_container() {
    container_name=$1
    external_port=$2
    image_name=$3
    dir=$4
    if [ "$(docker ps -a -q -f name=${container_name})" ]; then
        echo "Container ${container_name} already exists. Starting it..."
        docker start ${container_name}
    else
        echo "Container ${container_name} does not exist. Creating and starting it..."
        if [ "${container_name}" == "controller" ]; then
            docker run -d -p ${external_port}:5000 --name ${container_name} --network ${network_name} -v "$(pwd)/${dir}:/app" ${image_name}
        else
            docker run -d -p ${external_port}:5000 --name ${container_name} --network ${network_name} -v "$(pwd)/${dir}/functions:/app/functions" ${image_name}
        fi
    fi
}

# Create a Docker network if it doesn't exist
if [ ! "$(docker network ls | grep ${network_name})" ]; then
    echo "Creating Docker network ${network_name}..."
    docker network create ${network_name}
else
    echo "Docker network ${network_name} already exists. Skipping creation."
fi

# Loop through directories, images, and containers
for i in ${!dirs[@]}; do
    build_image ${dirs[$i]} ${images[$i]}
    start_container ${containers[$i]} ${ports[$i]} ${images[$i]} ${dirs[$i]}
done
