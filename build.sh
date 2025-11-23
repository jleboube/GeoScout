#!/bin/bash
# Build script for VMs with AppArmor issues
# This script builds the Docker image without BuildKit to avoid AppArmor errors

set -e

echo "Building GeoScout Docker image (without BuildKit to avoid AppArmor issues)..."

# Disable BuildKit to avoid AppArmor issues during build
export DOCKER_BUILDKIT=0

# Build using docker compose
docker compose build

echo ""
echo "Build complete!"
echo "Run 'docker compose up -d' to start the container"
