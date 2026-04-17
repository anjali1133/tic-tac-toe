FROM heroiclabs/nakama:3.22.0

WORKDIR /nakama

# Copy Nakama configuration and modules
COPY nakama/data /nakama/data

# Copy and set up startup script
COPY start.sh /nakama/start.sh
RUN chmod +x /nakama/start.sh

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