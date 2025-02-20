FROM node:20-slim
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

ENV WATCHPACK_POLLING=true
ENV NODE_ENV=development

# UV specific configurations for better performance
ENV UV_LINK_MODE=copy
ENV UV_SYSTEM_PYTHON=1
ENV UV_CACHE_DIR=/tmp/.uv-cache
ENV UV_COMPILE_BYTECODE=1

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copy Python-specific files first
COPY ./apps/engine/.python-version ./apps/engine/.python-version
COPY ./apps/engine/pyproject.toml ./apps/engine/pyproject.toml

# Copy Node.js related files
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY .npmrc ./

# Fetch dependencies using lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

COPY ./apps/shared ./apps/shared
COPY ./apps/engine ./apps/engine

WORKDIR /app/apps/engine

RUN --mount=type=cache,target=$UV_CACHE_DIR \
    uv sync
RUN pnpm install --prefer-offline

EXPOSE 8000

# Use UV's run command directly
CMD ["uv", "run", "--", "pnpm", "start"]
