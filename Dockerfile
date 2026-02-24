# Builder stage
FROM nexus.nic.etu:8181/nic/node:16-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Final image
FROM nexus.nic.etu:8181/nic/nginx:alpine
COPY --from=builder /app/dist/frontend/contents/panda/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
