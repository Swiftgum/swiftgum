#!/bin/bash

echo "🧹 Cleaning up Docker resources..."

# Stop all running containers
echo "Stopping all running containers..."
docker-compose -f docker-compose.dev.yml down

# Remove dangling images
echo "Removing dangling images..."
docker image prune -f

# Remove unused volumes (optional, uncomment if needed)
# echo "Removing unused volumes..."
# docker volume prune -f

echo "✨ Cleanup complete!"
