#!/bin/sh
set -e

echo "Running database migrations..."
node apps/api/dist/db/migrate.js

echo "Starting server..."
exec node apps/api/dist/server.js
