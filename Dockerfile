FROM oven/bun:latest

WORKDIR /kaede

COPY . .

RUN bun install

EXPOSE 3005

CMD ["bun", "bot"]
