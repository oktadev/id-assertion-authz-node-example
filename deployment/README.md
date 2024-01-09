# Sample Apps Deployment

### Deploy Wiki0

```
fly deploy -c deployment/wikisrv.fly.toml
```

### Deploy Todo0

```
fly deploy -c deployment/todosrv.fly.toml
```

### SSH into an app

```
fly ssh console --pty -c deployment/todosrv.fly.toml # update the toml file depending on the app
```

### Perform DB Migration

- First SSH into the app where the migration will run
- Then run the following

```
npx prisma migrate deploy --schema <APP_FOLDER>/prisma/schema.prisma
```

### Redis Commands

See https://fly.io/docs/flyctl/redis/
**Connect**

```
flyctl redis connect
```

**Flush Keys**

```
fly redis proxy

# The command above will output the port and password to connect with
# PREFIX could be, for example, "todo0:"
redis-cli -p <PORT> --pass <PASSWORD> --scan --pattern "<PREFIX>" | xargs redis-cli del
```
