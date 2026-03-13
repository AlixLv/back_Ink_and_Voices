FROM node:24-alpine3.22
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
# on génère le client Prisma puis on compile TypeScript
ARG NODE_ENV=production
ARG DATABASE_URL
RUN DATABASE_URL="${DATABASE_URL}" 
RUN npm run build
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
EXPOSE 8032
USER app
# on lance directement le JS compilé
CMD ["node", "build/index.js"]