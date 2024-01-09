FROM mariadb:latest

COPY ./deployment/sql /docker-entrypoint-initdb.d