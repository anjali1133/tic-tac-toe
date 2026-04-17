FROM heroiclabs/nakama:3.22.0

# Set working directory
WORKDIR /nakama

# Copy all project files first
COPY . /tmp/build/

# Create necessary directories and copy files
RUN mkdir -p /nakama/data/modules && \
    cp /tmp/build/nakama/data/config.yml /nakama/data/config.yml && \
    cp /tmp/build/nakama/data/modules/match.js /nakama/data/modules/match.js && \
    cp /tmp/build/start.sh /nakama/start.sh && \
    chmod +x /nakama/start.sh && \
    rm -rf /tmp/build

# Expose necessary ports
EXPOSE 7349 7350 7351 9100

# Set default environment variables
ENV NAKAMA_DB_ADDRESS=""
ENV NAKAMA_SERVER_KEY="defaultkey"
ENV NAKAMA_PORT="7350"

# Use the startup script
CMD ["/nakama/start.sh"]