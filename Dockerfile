# Telegram Bot Template - Production Dockerfile
# Version: 1.0
# Updated: 2025-10-03

# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Labels for documentation
LABEL maintainer="Alsaada <support@alsaada.com>"
LABEL version="1.0"
LABEL description="Telegram Bot Template with comprehensive features"
LABEL org.opencontainers.image.source="https://github.com/alsaadacomp/TelegramBotTemplate"

# Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV BOT_TIMEZONE=Asia/Riyadh

# Create app directory and set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p \
    data/database \
    data/logs \
    data/cache \
    data/backups \
    uploads \
    && chown -R nodejs:nodejs /app

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to non-root user
USER nodejs

# Create volume mount points
VOLUME ["/app/data", "/app/logs"]

# Expose port for health checks (3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/bot.js"]
