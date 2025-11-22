# Multi-Agent Tourism System

A complete Node.js + TypeScript backend system that provides weather and tourist attraction information for any place using multiple specialized agents.

## 🏗️ Architecture

- **Parent Agent (Tourism Orchestrator)**: Coordinates geocoding and child agents
- **Child Agent 1 (Weather Agent)**: Fetches weather data from Open-Meteo API
- **Child Agent 2 (Places Agent)**: Fetches tourist attractions from Overpass API
- **Geocoding Service**: Converts place names to coordinates using Nominatim API

## ✨ Features

- ✅ RESTful API with Express
- ✅ TypeScript for type safety
- ✅ Multi-agent architecture
- ✅ Error handling with retries
- ✅ Timeout protection
- ✅ Comprehensive unit tests
- ✅ Docker support
- ✅ Simple web frontend
- ✅ No hardcoded data - all from APIs

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Using Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   docker build -t tourism-api .
   docker run -p 3000:3000 tourism-api
   ```

## 📡 API Endpoints

### GET `/plan`

Get tourism information for a place.

**Query Parameters:**
- `place` (required): The place name (e.g., "Bangalore", "Paris")
- `what` (optional): What to fetch - `weather`, `places`, or `all` (default: `all`)

**Example Requests:**

```bash
# Get both weather and places
curl "http://localhost:3000/plan?place=Bangalore&what=all"

# Get weather only
curl "http://localhost:3000/plan?place=Bangalore&what=weather"

# Get places only
curl "http://localhost:3000/plan?place=Bangalore&what=places"
```

**Success Response (200):**
```json
{
  "success": true,
  "place": "Bangalore, Karnataka, India",
  "message": "In Bangalore it's currently 24°C with a chance of 35% to rain. And these are the places you can go:\nLalbagh\nBangalore Palace\n...",
  "data": {
    "weather": {
      "success": true,
      "temperature": 24,
      "precipitationProbability": 35,
      "forecast": "Currently 24°C with a 35% chance of rain."
    },
    "places": {
      "success": true,
      "places": [
        { "name": "Lalbagh" },
        { "name": "Bangalore Palace" },
        { "name": "Bannerghatta National Park" }
      ]
    }
  }
}
```

**Error Response (404) - Unknown Place:**
```json
{
  "success": false,
  "place": "NonExistentPlace",
  "message": "I don't know this place exists",
  "error": "unknown_place"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## 📁 Project Structure

```
.
├── src/
│   ├── services/
│   │   ├── geocode.ts          # Nominatim geocoding service
│   │   ├── weather.ts           # Open-Meteo weather service
│   │   ├── places.ts            # Overpass places service
│   │   └── __tests__/           # Service unit tests
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── orchestrator.ts         # Parent agent (orchestrator)
│   ├── index.ts                 # Express server
│   └── orchestrator.test.ts    # Orchestrator tests
├── public/
│   └── index.html              # Web frontend
├── dist/                        # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── jest.config.js
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

The server runs on port `3000` by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 🌐 APIs Used

1. **Nominatim API** (Geocoding)
   - Base URL: `https://nominatim.openstreetmap.org/search`
   - Converts place names to coordinates

2. **Open-Meteo API** (Weather)
   - Base URL: `https://api.open-meteo.com/v1/forecast`
   - Provides current weather and forecasts

3. **Overpass API** (Places)
   - Base URL: `https://overpass-api.de/api/interpreter`
   - Queries OpenStreetMap for tourist attractions

## 🛡️ Error Handling

- **Unknown Place**: Returns 404 with `unknown_place` error
- **API Failures**: Retries up to 2 times with exponential backoff
- **Timeouts**: 10s for geocoding/weather, 30s for places
- **Partial Results**: Returns available data even if one service fails

## 📝 Example Usage

### Example 1: Places Only
```bash
curl "http://localhost:3000/plan?place=Bangalore&what=places"
```

**Response:**
```
In Bangalore these are the places you can go, 
Lalbagh
Sri Chamarajendra Park
Bangalore palace
Bannerghatta National Park
Jawaharlal Nehru Planetarium
```

### Example 2: Weather Only
```bash
curl "http://localhost:3000/plan?place=Bangalore&what=weather"
```

**Response:**
```
In Bangalore it's currently 24°C with a chance of 35% to rain.
```

### Example 3: Both Weather and Places
```bash
curl "http://localhost:3000/plan?place=Bangalore&what=all"
```

**Response:**
```
In Bangalore it's currently 24°C with a chance of 35% to rain. And these are the places you can go:
Lalbagh
Sri Chamarajendra Park
Bangalore palace
Bannerghatta National Park
Jawaharlal Nehru Planetarium
```

## 🐳 Docker Commands

```bash
# Build image
docker build -t tourism-api .

# Run container
docker run -p 3000:3000 tourism-api

# Run with docker-compose
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options:

**Render.com (Recommended - Free):**
1. Push code to GitHub
2. Connect repository on Render.com
3. Auto-deploys with `render.yaml`

**Railway.app:**
1. Push code to GitHub
2. Connect repository on Railway
3. Auto-deploys with `railway.json`

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**Docker:**
```bash
docker build -t tourism-api .
docker run -p 3000:3000 tourism-api
```

## 🧩 Development

### Adding New Features

1. Add new service in `src/services/`
2. Update types in `src/types/index.ts`
3. Integrate in `src/orchestrator.ts`
4. Add tests in `src/services/__tests__/`
5. Update API endpoint in `src/index.ts`

### Code Style

- TypeScript strict mode enabled
- All functions typed
- Error handling with proper types
- Async/await for async operations

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues or questions, please open an issue on the repository.

