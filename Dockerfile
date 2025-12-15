# ---- Build stage: React app builden ----
FROM node:20-alpine AS build

WORKDIR /app

# Alleen package-bestanden eerst kopiëren (beter caching)
COPY package*.json ./

# Dependencies installeren
RUN npm install

# Rest van de code kopiëren
COPY . .

# Production build maken
RUN npm run build

# ---- Run stage: met nginx de build serven ----
FROM nginx:1.27-alpine

# Eigen nginx-config voor React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build van React naar nginx html-map
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
