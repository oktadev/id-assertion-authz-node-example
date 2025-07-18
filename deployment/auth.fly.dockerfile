FROM ubuntu:jammy

# Install deps
RUN apt update && apt upgrade -y && apt install -y \
    curl \
    wget

RUN apt-get update && apt-get install -y \
    git \
    gnupg \
    jq

# Install Node
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ARG NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y

# Install Yarn Package Manager
RUN npm install --global yarn

# Copy packages
# Need to keep code in separate working directory for yarn workspaces for some reason, not root path
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn/releases .yarn/releases


RUN mkdir cwo-app
WORKDIR cwo-app

RUN mkdir deployment
RUN mkdir packages
COPY deployment deployment
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY packages/authorization-server packages/authorization-server
COPY packages/id-assert-authz-grant-client packages/id-assert-authz-grant-client

RUN yarn install
RUN yarn postinstall

ENTRYPOINT deployment/start-auth.sh
