# Dockerfile untuk React + Vite
FROM node:18

# Set working directory
WORKDIR /app

# ⬇⬇ Tambahkan ini untuk copy .env ⬇⬇
COPY .env .env

# Copy file konfigurasi
COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY .eslintrc.cjs ./
COPY .prettier* ./

# ⬇⬇ Tambahkan ini untuk pastikan index.html disalin ⬇⬇
COPY index.html ./

# Copy direktori publik dan source
COPY ./public ./public
COPY ./src ./src

# Install dependencies
RUN npm install

# Build project
RUN npm run build

# Install serve untuk preview hasil build
RUN npm install -g serve

# Expose port untuk serve
EXPOSE 4173

# Jalankan hasil build
CMD ["serve", "-s", "dist", "-l", "4173"]
