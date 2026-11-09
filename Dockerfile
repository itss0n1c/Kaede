FROM oven/bun:1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates ffmpeg ghostscript graphicsmagick libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock bunfig.toml ./
COPY packages/bot/package.json ./packages/bot/package.json
COPY packages/apis/package.json ./packages/apis/package.json
COPY packages/utils/package.json ./packages/utils/package.json

RUN bun install --frozen-lockfile --production

COPY packages ./packages

RUN mkdir -p /app/dbs \
    && chown bun:bun /app/dbs

# Supply the variables declared in packages/utils/lib/env.ts at runtime
# (for example, with docker run --env-file .env).
ENV NODE_ENV=production

USER bun

EXPOSE 3000

CMD ["bun", "run", "start"]
