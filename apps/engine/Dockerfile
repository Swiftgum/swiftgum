# Use Python 3.13
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install uv
RUN pip install uv

# Copy pyproject.toml
COPY pyproject.toml .

# Set environment variables
ENV UV_LINK_MODE=copy
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy the application code
COPY . .

# Create a non-root user for security and set up permissions
RUN adduser --disabled-password --gecos '' appuser && \
    mkdir -p /app/.venv && \
    chown -R appuser:appuser /app

USER appuser

# Install dependencies using uv after switching to appuser
RUN uv venv && \
    uv sync

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
  CMD curl -f http://localhost:8000/health || exit 1

# The actual application code will be mounted as a volume
CMD ["uv", "run", "fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]
