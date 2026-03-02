# ----------- Build Stage -----------
FROM node:24-alpine AS builder

# Update all packages including OpenSSL and npm to fix security vulnerabilities
RUN apk update && apk upgrade && npm install -g npm@latest

# Set the working directory inside the container
WORKDIR /code

# Copy only package.json and package-lock.json (for npm ci/npm install caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the app (output goes to /code/dist)
RUN npm run build

# ----------- Production Stage -----------
FROM node:24-alpine AS production

# Update all packages including OpenSSL and npm to fix security vulnerabilities
RUN apk update && apk upgrade && npm install -g npm@latest

# Set the working directory for the production image
WORKDIR /app

# Install 'serve' globally to serve the built static files
RUN npm install -g serve

# Copy the built app from the builder stage
COPY --from=builder /code/dist ./dist

# Expose port 3000 for the application
EXPOSE 3000

# Start the app using 'serve'
CMD ["serve", "-s", "dist", "-l", "3000"]