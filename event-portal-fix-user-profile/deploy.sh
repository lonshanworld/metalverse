#!/bin/bash
set -e

echo "==> Pulling latest code..."
git pull origin master

echo "==> Building and starting container..."
docker compose up -d --build

echo "==> Done. Running containers:"
docker compose ps
