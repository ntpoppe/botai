FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install build deps for any native modules (canvas, etc.)
RUN apk add --no-cache make gcc g++ python3 cairo-dev pango-dev libpng-dev jpeg-dev giflib-dev pkgconfig

# Copy package manifest and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

CMD ["npm", "start"]
