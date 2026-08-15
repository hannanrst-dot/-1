# نوشت‌افزار حنان — استقرار روی لیارا با Dockerfile اختصاصی.
# با این روش، بیلدپکِ داخلی لیارا (configure.sh) دور زده می‌شود و کنترل کامل دستِ ماست؛
# ابزارهای لازم برای کامپایل ماژول نیتیو better-sqlite3 هم اینجا نصب می‌شوند.
FROM node:20-bookworm-slim

# ابزار کامپایل برای better-sqlite3 (node-gyp نیاز به python3/make/g++ دارد)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ۱) فقط package.json را کپی و نصب می‌کنیم (کش لایه‌ها)
COPY package.json ./
RUN npm install --no-audit --no-fund

# ۲) کل سورس را کپی و build می‌کنیم
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# اجرای برنامه روی پورت ۳۰۰۰
CMD ["npx", "next", "start", "-p", "3000"]
