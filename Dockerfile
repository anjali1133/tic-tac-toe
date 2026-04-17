FROM heroiclabs/nakama:3.22.0

# Set working directory
WORKDIR /nakama

# Copy Nakama configuration and modules
COPY ./nakama/data /nakama/data
COPY ./nakama/modules /nakama/data/modules

# Copy startup script
COPY ./start.sh /nakama/start.sh
RUN chmod +x /nakama/start.sh

# Expose necessary ports
EXPOSE 7349 7350 7351 9100

# Set default environment variables
ENV NAKAMA_DB_ADDRESS=""
ENV NAKAMA_SERVER_KEY="defaultkey"
ENV NAKAMA_PORT="7350"

# Use the startup script
CMD ["/nakama/start.sh"]