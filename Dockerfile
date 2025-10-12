#update: Added back-end/assets/images directory structure for storing uploaded images
FROM node:24.3.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

#update: Create both public uploads (legacy) and backend assets directories
RUN mkdir -p /app/public/images/uploads/users \
            /app/public/images/uploads/shops \
            /app/public/images/uploads/publications \
            /app/public/images/uploads/organizations \
            /app/public/images/uploads/temp \
            /app/back-end/assets/images/users \
            /app/back-end/assets/images/shops \
            /app/back-end/assets/images/products \
            /app/back-end/assets/images/publications \
            /app/back-end/assets/images/organizations && \
    find /app/public/images/uploads -type d -exec chmod 755 {} + && \
    find /app/public/images/uploads -type f -exec chmod 755 {} + && \
    find /app/back-end/assets/images -type d -exec chmod 755 {} + && \
    chown -R node:node /app/public/images/uploads && \
    chown -R node:node /app/back-end/assets/images

EXPOSE 3000

CMD ["node", "back-end/index.js"]