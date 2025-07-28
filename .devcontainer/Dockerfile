FROM alpine:latest

# Set environment variables for Fly.io before installing it
ENV FLYCTL_INSTALL="/root/.fly"
ENV PATH="$FLYCTL_INSTALL/bin:$PATH"

# Install core dependencies using apk (Alpine's package manager)
RUN echo "Starting core dependency installation at $(date)" && \
    apk update && \
    apk add --no-cache \
        curl \
        mariadb-client \
        wget \
        git \
        gnupg \
        jq \
        redis \
        openssl \
    && echo "Finished core dependency installation at $(date)"

# Install Node.js and npm (from Alpine repositories)
ARG NODE_MAJOR=20
RUN echo "Starting Node.js installation at $(date)" && \
    apk add --no-cache nodejs npm && \
    echo "Finished Node.js installation at $(date)"

# Install Yarn Package Manager globally
RUN echo "Starting Yarn installation at $(date)" && \
    npm install --global yarn && \
    echo "Finished Yarn installation at $(date)"
