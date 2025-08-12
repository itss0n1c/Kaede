FROM oven/bun:1.2.20

RUN apt-get update && apt-get install -y curl

WORKDIR /kaede

COPY . .

RUN bun install --frozen-lockfile

ENV NODE_ENV=production

EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:3000/health" ]

CMD ["bun", "bot"]
