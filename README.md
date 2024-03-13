# API Proxy

## Configuration

Have a `.env` file with the following format:

```env
PROXY_TARGET_HOST=https://example.com
PROXY_PATH=/api
PORT=8600
```

This config will forward all requests to: `http://localhost:8600/api` to `https://example.com/api`
