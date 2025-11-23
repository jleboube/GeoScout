# GeoScout Deployment Guide

## Docker Compose Deployment

This project is configured to build and deploy using Docker Compose v2 following the guidelines in AGENTS.md.

### Port Configuration

The application is exposed on **port 7843** (an obscure port suitable for Cloudflare Tunnel).

### Prerequisites

- Docker and Docker Compose v2 installed
- A valid Gemini API key

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Gemini API key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

### Building and Running

1. Build the Docker image:
```bash
docker compose build
```

2. Start the application:
```bash
docker compose up -d
```

3. Check the status:
```bash
docker compose ps
```

4. View logs:
```bash
docker compose logs -f
```

### Accessing the Application

- **Local URL**: http://localhost:7843
- **Health Check**: http://localhost:7843/health

### Cloudflare Tunnel Configuration

Add the following to your Cloudflare Tunnel configuration (`config.yml`):

```yaml
ingress:
  - hostname: your-domain.com
    service: http://localhost:7843
  # ... other services
  - service: http_status:404
```

Or use the CLI:
```bash
cloudflared tunnel route dns <tunnel-name> your-subdomain.your-domain.com
```

Then update your tunnel configuration to point to `http://localhost:7843`.

### Container Management

**Stop the application:**
```bash
docker compose down
```

**Restart the application:**
```bash
docker compose restart
```

**Rebuild and restart:**
```bash
docker compose up -d --build
```

**View container logs:**
```bash
docker compose logs -f geoscout-app
```

**Execute commands in container:**
```bash
docker compose exec geoscout-app sh
```

### Architecture

The deployment uses a multi-stage Docker build:

1. **deps stage**: Installs production dependencies
2. **builder stage**: Builds the Vite application
3. **runner stage**: Serves the built application with Nginx

### Features

- **Multi-stage build** for optimized image size
- **Nginx** for efficient static file serving
- **Health checks** for container monitoring
- **Gzip compression** for better performance
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **SPA routing** support via Nginx fallback
- **Production-ready** configuration

### Troubleshooting

**Container won't start:**
```bash
docker compose logs geoscout-app
```

**Rebuild from scratch:**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Check health status:**
```bash
curl http://localhost:7843/health
```

**Port already in use:**
Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "7843:80"  # Change 7843 to another port
```

### Security Notes

- Never commit `.env` or `.env.local` files (already in `.gitignore`)
- Keep your Gemini API key secure
- The application runs as a non-root user in the container
- Security headers are enabled in Nginx configuration

### Performance

- Gzip compression enabled for text assets
- Static assets cached for 1 year
- SPA pages served with no-cache headers
- Nginx worker processes set to auto

### Monitoring

The container includes a health check that runs every 30 seconds:
- Endpoint: `http://localhost:80/`
- Timeout: 3 seconds
- Retries: 3
- Start period: 5 seconds

Check health status:
```bash
docker compose ps
# Look for "healthy" in the STATUS column
```

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure Cloudflare Tunnel with port 7843
- [ ] Set up SSL/TLS through Cloudflare
- [ ] Enable rate limiting on Cloudflare
- [ ] Monitor container logs
- [ ] Set up automated backups (if needed)
- [ ] Configure monitoring/alerting
- [ ] Test health check endpoint

## Cloudflare Tunnel Example Configuration

Full example `config.yml`:

```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: geoscout.yourdomain.com
    service: http://localhost:7843
  - service: http_status:404
```

Restart Cloudflare Tunnel after configuration changes:
```bash
sudo systemctl restart cloudflared
# or
cloudflared tunnel run your-tunnel-name
```
