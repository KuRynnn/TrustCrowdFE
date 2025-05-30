FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./


# Copy the rest of the files
COPY . .
RUN npm install
EXPOSE 3000
# Use development mode
CMD ["npm", "run", "dev"]