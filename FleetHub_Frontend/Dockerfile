# Runtime container met Nginx Alpine om de gebouwde SPA te serveren
FROM nginx:alpine

# Verwijder standaard Nginx homepage
RUN rm -rf /usr/share/nginx/html/*

# Kopieer de in CI gebouwde statische bestanden (dist)
COPY dist /usr/share/nginx/html

# Zorg voor HTML5 Client-side Routing fallback (belangrijk voor React Router)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
