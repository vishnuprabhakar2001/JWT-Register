# Use official Node image
FROM node:20

# Create app directory inside container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining project files
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]