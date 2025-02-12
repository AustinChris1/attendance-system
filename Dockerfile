FROM node:22-bookworm

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev -y

WORKDIR /app

RUN corepack enable && corepack prepare --activate pnpm@latest
COPY package.json pnpm-lock.yaml .
RUN pnpm install
COPY . .
EXPOSE 3000

CMD ["pnpm", "start"]