# Use Node 20 Alpine as the base image for dependencies
FROM node:20-alpine AS development-dependencies-env

# Install libc6-compat for compatibility and manually install PNPM
RUN apk add --no-cache libc6-compat curl \
    && npm install -g pnpm

# Copy the entire project
RUN ls
COPY . /app
WORKDIR /app

# Install all dependencies
RUN pnpm install

# Set environment variables
ARG VITE_COOKIE_SECRET
ARG VITE_PUBLIC_BASE_URL
ENV VITE_COOKIE_SECRET=$VITE_COOKIE_SECRET
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL

# =========================
# PRODUCTION DEPENDENCIES
# =========================
FROM node:20-alpine AS production-dependencies-env

# Install PNPM manually
RUN apk add --no-cache curl \
    && npm install -g pnpm

COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app

# Install only production dependencies
RUN pnpm install --frozen-lockfile


# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS build-env

# Install PNPM manually
RUN apk add --no-cache curl \
    && npm install -g pnpm

COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

ENV VITE_COOKIE_SECRET=$VITE_COOKIE_SECRET
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL

# Build the project
RUN pnpm run build


# =========================
# FINAL PRODUCTION IMAGE
# =========================
FROM node:20-alpine

ENV VITE_COOKIE_SECRET=$VITE_COOKIE_SECRET
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL

# Install PNPM manually
RUN apk add --no-cache curl \
    && npm install -g pnpm

COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

# Start the application
CMD ["pnpm", "run", "start"]
