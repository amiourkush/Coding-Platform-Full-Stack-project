FROM node:18-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-17-jdk \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm install

EXPOSE 4000

CMD ["node", "index.js"]