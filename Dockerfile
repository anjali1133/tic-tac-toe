FROM heroiclabs/nakama:3.22.0

WORKDIR /nakama

# Create necessary directories
RUN mkdir -p /nakama/data/modules

# Copy files individually to avoid path issues
COPY nakama/data/config.yml /nakama/data/config.yml
COPY nakama/data/modules/match.js /nakama/data/modules/match.js

# Copy startup script
COPY start.sh /nakama/start.sh
RUN chmod +x /nakama/start.sh

# Verify files were copied correctly
RUN echo "=== Verifying Nakama files ===" && \
    ls -la /nakama/data/ && \
    ls -la /nakama/data/modules/ && \
    echo "=== Config file content ===" && \
    head -5 /nakama/data/config.yml && \
    echo "=== Match.js exists ===" && \
    ls -la /nakama/data/modules/match.js

# Expose Nakama ports (Railway will map to $PORT automatically)
EXPOSE 7349 7350 7351

# Environment variables for Railway
ENV NAKAMA_SERVER_KEY="defaultkey"
ENV NAKAMA_PORT="7350"
ENV NAKAMA_DATABASE_URL=""

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD ["/nakama/nakama", "--version"]

# Start Nakama server
CMD ["/nakama/start.sh"]