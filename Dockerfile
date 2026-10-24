FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --workspace=@clipora/backend --include-workspace-root=false

COPY backend backend

RUN npm run build --workspace=@clipora/backend

FROM node:22-bookworm-slim AS runtime

COPY backend/requirements.txt backend/requirements.txt

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates ffmpeg python3 python3-pip \
  && rm -rf /var/lib/apt/lists/* \
  && pip3 install --break-system-packages --no-cache-dir -r backend/requirements.txt

WORKDIR /app

ENV NODE_ENV=production \
    PORT=10000 \
    STORAGE_DIR=/tmp/clipora-storage

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --omit=dev --workspace=@clipora/backend --include-workspace-root=false \
  && npm cache clean --force

COPY --from=build /app/backend/dist ./backend/dist

EXPOSE 10000

CMD ["npm", "run", "start", "--workspace=@clipora/backend"]