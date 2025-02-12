# FROM node:20-alpine AS development-dependencies-env
# COPY . /app
# WORKDIR /app
# RUN npm ci

# FROM node:20-alpine AS production-dependencies-env
# COPY ./package.json package-lock.json /app/
# WORKDIR /app
# RUN npm ci --omit=dev

# FROM node:20-alpine AS build-env
# COPY . /app/
# COPY --from=development-dependencies-env /app/node_modules /app/node_modules
# WORKDIR /app
# RUN npm run build

# FROM node:20-alpine
# COPY ./package.json package-lock.json /app/
# COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# COPY --from=build-env /app/build /app/build
# WORKDIR /app
# CMD ["npm", "run", "start"]

FROM node:20-alpine AS development-dependencies-env

# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat

# Ensure Corepack is enabled properly
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN ls

COPY . /app
WORKDIR /app
RUN pnpm install

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml  /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile

# Define build-time arguments (e.g., API keys, environment URLs, etc.)
ARG VITE_COOKIE_SECRET
ARG VITE_PUBLIC_BASE_URL

# Set environment variables for the build stage
ENV VITE_COOKIE_SECRET=$VITE_COOKIE_SECRET
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL


FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build 

# Set runtime environment variables (these will be available when the app is running)
ENV VITE_COOKIE_SECRET=$VITE_COOKIE_SECRET
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL

FROM node:20-alpine
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["pnpm", "run", "start"]