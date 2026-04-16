FROM heroiclabs/nakama:3.22.0

COPY ./nakama /nakama/data

CMD ["nakama", "--database.address", ""]