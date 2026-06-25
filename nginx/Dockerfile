FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY panafrican-nexus-spa-clean/package.json panafrican-nexus-spa-clean/package-lock.json ./
RUN npm ci
COPY panafrican-nexus-spa-clean/ .
ARG VITE_API_BASE_URL=https://api.elda.africa/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
RUN rm -f /etc/nginx/conf.d/default.conf
EXPOSE 80 443
