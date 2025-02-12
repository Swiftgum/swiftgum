FROM node:20-slim
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

ENV WATCHPACK_POLLING=true
ENV NODE_ENV=development

ENV UV_LINK_MODE=copy
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY ./apps/engine/.python-version ./apps/engine/.python-version
COPY ./apps/engine/pyproject.toml ./apps/engine/pyproject.toml

RUN (cd apps/engine && uv python install)
RUN (cd apps/engine && uv sync)

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY .npmrc ./

# Fetch dependencies using lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch


COPY ./apps/shared ./apps/shared
COPY ./apps/engine ./apps/engine

WORKDIR /app/apps/engine

RUN pnpm install --prefer-offline

EXPOSE 8000
CMD ["pnpm", "start"]
