#!/bin/sh

# Telegram Bot Template - Docker Entrypoint
# Version: 1.0
# Updated: 2025-10-03

set -e

echo "🚀 Starting Telegram Bot Template..."

# Wait for database if needed
if [ "$WAIT_FOR_DB" = "true" ]; then
    echo "⏳ Waiting for database connection..."
    timeout 30 sh -c 'until nc -z $DB_HOST $DB_PORT; do sleep 1; done' || {
        echo "❌ Database connection timeout"
        exit 1
    }
    echo "✅ Database connection established"
fi

# Create directories if they don't exist
mkdir -p data/database data/logs data/cache data/backups uploads

# Set proper permissions
chmod 755 data/

# Initialize database if flag is set
if [ "$INIT_DB" = "true" ]; then
    echo "🗄️ Initializing database..."
    node scripts/init-database.script.js || {
        echo "❌ Database initialization failed"
        exit 1
    }
    echo "✅ Database initialized"
fi

# Run migrations if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Running database migrations..."
    node src/utils/migrate.js || {
        echo "❌ Migration failed"
        exit 1
    }
    echo "✅ Migrations completed"
fi

# Start the bot
echo "🎯 Starting bot application..."
exec "$@"
