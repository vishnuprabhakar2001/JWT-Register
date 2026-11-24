FROM node:20-slim

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    PORT=8001

WORKDIR /app

# Install FFmpeg (includes ffprobe) and Tesseract OCR (for scanned PDFs)
# Need another OCR language? add its pack, e.g. tesseract-ocr-hin, tesseract-ocr-kan
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ffmpeg \
       tesseract-ocr \
       tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install Node dependencies with cache mount for fast rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm install

COPY . .

EXPOSE 8001

CMD ["node", "index.js"]
