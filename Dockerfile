FROM node:24-alpine3.22
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
# on complie TypeScript
RUN npm run build
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
EXPOSE 8000
USER app
# on lance directement le JS compilé
CMD ["node", "build/index.js"]