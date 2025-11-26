# GeoScout AI

An AI-powered geolocation analysis tool using Google Gemini Vision API to identify locations from images.

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?logo=google&logoColor=fff)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=fff)](https://nginx.org/)

## Features

- **Image Analysis**: Upload images to identify locations using Google Gemini Vision AI
- **Interactive Chat**: Chat with an AI assistant about geographic locations
- **GeoGuesser Game**: Test your geography knowledge with AI-generated challenges
- **Real-time Analysis**: Fast image processing with streaming responses
- **Modern UI**: Clean, responsive interface built with React and TypeScript

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **AI Integration**: Google Gemini API (@google/genai)
- **Charts**: Recharts for data visualization
- **Deployment**: Docker, Docker Compose, Nginx
- **Server**: Nginx for production serving

## Quick Start

### Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose v2 (for containerized deployment)
- Google Gemini API key

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd geoscout
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

The project is configured for production deployment using Docker Compose.

1. Set up environment variables:
```bash
cp .env.example .env
```

2. Add your Gemini API key to `.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

3. Build and start the container:
```bash
docker compose up -d --build
```

4. Access the application:
- **Local**: http://localhost:7843
- **Health Check**: http://localhost:7843/health

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions and Cloudflare Tunnel configuration.

## Architecture

### Multi-Stage Docker Build

1. **deps**: Installs production dependencies
2. **builder**: Builds the Vite application
3. **runner**: Serves static files with Nginx

### Port Configuration

The application runs on **port 7843** (obscure port for Cloudflare Tunnel compatibility).

### Security Features

- Secure headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Environment variable management
- No exposed secrets in code
- Docker security best practices

## Project Structure

```
geoscout/
├── components/          # React components
│   ├── ChatBot.tsx     # AI chat interface
│   ├── GeoGuesser.tsx  # Geography game
│   ├── Header.tsx      # App header
│   ├── ImageAnalyzer.tsx # Image upload and analysis
│   └── LiveAgent.tsx   # Real-time AI agent
├── services/           # Service layer
│   └── geminiService.ts # Gemini API integration
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Container orchestration
├── nginx.conf          # Nginx configuration
└── vite.config.ts      # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `docker compose build` - Build Docker image
- `docker compose up -d` - Start container
- `docker compose down` - Stop container
- `docker compose logs -f` - View logs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Cloudflare Tunnel

This application is designed to work seamlessly with Cloudflare Tunnel. Configure your tunnel to point to `http://localhost:7843`.

Example configuration:
```yaml
ingress:
  - hostname: geoscout.yourdomain.com
    service: http://localhost:7843
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete tunnel configuration.

## Development

### Adding New Features

1. Create components in `components/`
2. Add services in `services/`
3. Define types in `types.ts`
4. Update Dockerfile if dependencies change

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- ESM module system
- Type-safe API integration

## Troubleshooting

### Container Issues

Check logs:
```bash
docker compose logs -f geoscout-app
```

Rebuild from scratch:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Health Check

Verify the application is running:
```bash
curl http://localhost:7843/health
```

Expected response: `healthy`

## AI Studio

View the original app in AI Studio: https://ai.studio/apps/drive/1jpemCy120uDdeizOKliPLsbjYDBgrw7L

## License

This project is private and proprietary.

## Author

[![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?logo=linkedin-white&logoColor=fff)](https://linkedin.com/in/joe-leboube)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/muscl3n3rd)
