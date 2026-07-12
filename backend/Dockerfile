# Base node image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client
RUN npm install
RUN npx prisma generate

# Copy application source code
COPY . .

# Expose port
EXPOSE 5000

# Start command: migrate DB then start server
# Note: we use deploy for production migrations, or db push if there are no migrations yet.
# We will use deploy.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
