# ---- Base commune ----
FROM node:24-alpine3.22 AS base
WORKDIR /app
COPY package*.json ./

# ---- Cible dev (hot-reload via tsx) ----
# Les dépendances sont installées dans l'image ; le code est monté en volume
# par docker-compose. prisma generate + migrate sont lancés au démarrage
# (voir la commande du service "dev" dans docker-compose.yml).
FROM base AS dev
RUN npm ci
EXPOSE 8032
CMD ["npm", "run", "dev"]

# ---- Build de production ----
FROM base AS build
RUN npm ci
COPY . .
ENV NODE_ENV=production
# prisma generate a besoin d'une URL pour charger prisma.config.ts
# (aucune connexion réelle n'est faite pendant la génération du client).
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN DATABASE_URL="${DATABASE_URL}" npx prisma generate
RUN npm run build

# ---- Image de production ----
FROM node:24-alpine3.22 AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/src/generated ./src/generated
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
EXPOSE 8032
USER app
CMD ["node", "build/index.js"]
