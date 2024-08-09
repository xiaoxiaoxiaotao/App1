# Use the official Node.js 18 image as the base image
FROM node:18.20.4

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install -g npm@10.7.0
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Expose port 5000
EXPOSE 5000

# Command to run the server
CMD ["node", "app.js"]
