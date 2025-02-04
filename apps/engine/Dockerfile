FROM node:20-slim
RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY ./apps/engine/.python-version .

RUN which uv

RUN uv python install

COPY ./pnpm-lock.yaml .

# Fetch dependencies using lockfile
RUN pnpm fetch

COPY ./apps/engine/pyproject.toml .

ENV WATCHPACK_POLLING=true
ENV NODE_ENV=development

ENV UV_LINK_MODE=copy
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN uv venv
RUN uv sync

WORKDIR /app

COPY ./apps/engine/ .
RUN pnpm install --prefer-offline

EXPOSE 8000
CMD ["pnpm", "start"]
