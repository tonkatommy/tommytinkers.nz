# v2 site is plain static files: HTML pages load React, Babel standalone and
# Lucide from unpkg and transpile the .jsx in the browser. No build step, so
# nginx just serves the folder.
FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy only what the pages reference (screenshots, package.json, compose
# files etc. stay out of the image).
COPY *.html *.css ./
COPY assets ./assets
COPY fonts ./fonts
COPY pages ./pages
COPY shared ./shared

# Same port the Next.js app used, so the Cloudflare tunnel's app:3000 target
# keeps working unchanged.
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1:3000/ || exit 1
