# Multi-stage build approach
FROM node:18-alpine AS node-service

WORKDIR /app
COPY package.json server.js ./
EXPOSE 7350
CMD ["node", "server.js"]

# Alternative Nakama build (uncomment to use full game server)
# FROM heroiclabs/nakama:3.22.0 AS nakama-service
# COPY nakama/data /nakama/data
# COPY start.sh /start.sh
# RUN chmod +x /start.sh
# EXPOSE 7349 7350 7351 9100
# ENV NAKAMA_SERVER_KEY="defaultkey"
# CMD ["/start.sh"]