# Use Node 20 Alpine as the base image for development dependencies
FROM node:20-alpine AS development-dependencies-env

# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat

# Enable Corepack and install PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the entire project
COPY . /app
WORKDIR /app

# Install all dependencies
RUN pnpm install


# =========================
# PRODUCTION DEPENDENCIES
# =========================
FROM node:20-alpine AS production-dependencies-env

# Enable Corepack and install PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app

# Install only production dependencies
RUN pnpm install --frozen-lockfile


# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS build-env

COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

# Build the project
RUN pnpm run build

# Set environment variables
ARG VITE_COOKIE_SECRET
ARG VITE_PUBLIC_BASE_URL
ENV VITE_COOKIE_SECRET=$VITE_COOKIE_SECRET
ENV VITE_PUBLIC_BASE_URL=$VITE_PUBLIC_BASE_URL


# =========================
# FINAL PRODUCTION IMAGE
# =========================
FROM node:20-alpine

# Enable Corepack and install PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

# Start the application
CMD ["pnpm", "run", "start"]
