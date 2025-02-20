FROM node:22.9.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create necessary directories and set permissions
# Note: Changed path to match the actual structure
RUN mkdir -p /app/public/images/uploads/users \
            /app/public/images/uploads/shops \
            /app/public/images/uploads/temp && \
    find /app/public/images/uploads -type d -exec chmod 755 {} + && \
    find /app/public/images/uploads -type f -exec chmod 755 {} + && \
    chown -R node:node /app/public/images/uploads

EXPOSE 3000

CMD ["node", "back-end/index.js"]