# SugarSugar

A webservice to ask Dexcom Share servers for blood glucose data.

## Description

SugarSugar is a Node.js web service that interfaces with Dexcom Share API to retrieve blood glucose data. This service can be used to build applications that need access to continuous glucose monitoring (CGM) data. Fork this project and setup environment on vercel to make your own SugarSugar webservice!

### Live Demo

You can see a live demo at: [`https://sugarsugar-i7mr5b18t-dave-algers-projects.vercel.app/api/glucose`](https://sugarsugar-k98tap9gd-dave-algers-projects.vercel.app/)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/run-time/sugarsugar.git
cd sugarsugar
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
npm run setup
```

4. Edit `.env.local` with your actual Dexcom credentials:

```bash
# Edit the file with your credentials
DEXCOM_SHARE_ID=your_account_id
DEXCOM_SHARE_USERNAME=your_dexcom_username
DEXCOM_SHARE_PASSWORD=your_dexcom_password
```

> **⚠️ Security Note**: Never commit `.env.local` or `.env.vercel` files to git. These files contain sensitive credentials and should only exist locally or in your deployment environment.

## Configuration

The following environment variables need to be configured in `.env.local`:

- `DEXCOM_SHARE_ID`: Your Dexcom Share account ID
- `DEXCOM_SHARE_USERNAME`: Your Dexcom Share username
- `DEXCOM_SHARE_PASSWORD`: Your Dexcom Share password
- `DEXCOM_SHARE_SERVER`: Dexcom server region

| Code  | Region                  | Server URL      |
| ----- | ----------------------- | --------------- |
| us    | United States (default) | uam1.dexcom.com |
| jp    | Japan/Asia-Pacific      | uam.dexcom.jp   |
| other | Outside the US          | uam2.dexcom.com |

## Usage

1. Set up your environment variables in `.env.local`:

```bash
npm run setup
# Then edit .env.local with your actual credentials
```

2. Start the API server:

```bash
npm start
```

3. The API will be available at `http://localhost:3000`

## API Endpoints

The SugarSugar API provides the following endpoints:

| Endpoint       | Method | Description                              |
| -------------- | ------ | ---------------------------------------- |
| `/`            | GET    | API documentation and service info       |
| `/api/health`  | GET    | Service health check                     |
| `/api/glucose` | GET    | Latest glucose reading with full details |

### Example Responses

**GET /api/health**

```json
{
  "status": "ok",
  "timestamp": "2025-08-05T10:30:00.000Z",
  "service": "SugarSugar Dexcom API"
}
```

**GET /api/glucose**

```json
{
  "time": "2025-08-05T10:30:00.000Z",
  "value": 120,
  "previous_value": 115,
  "value_difference": 5,
  "trend": {
    "id": "SingleUp",
    "symbol": "↑",
    "name": "Rising",
    "description": "Blood sugar is increasing at a moderate pace (+2 ≤ trendRate < +3)",
    "trendRate": 2
  },
  "status": "IN RANGE",
  "read": "2 minutes ago"
}
```

**Trend Symbols:**

- `⇈` - Rising Rapidly (DoubleUp)
- `↑` - Rising (SingleUp)
- `↗` - Rising Slowly (FortyFiveUp)
- `→` - Level (Flat)
- `↘` - Falling Slowly (FortyFiveDown)
- `↓` - Falling (SingleDown)
- `⇊` - Falling Rapidly (DoubleDown)
- `—` - No Arrow (None)
- `?` - Not Computable
- `!` - Rate Out Of Range

**Status Values:**

- `LOW` - Below 60 mg/dL
- `IN RANGE` - Between 60-240 mg/dL
- `HIGH` - Above 240 mg/dL

````

### Testing the API

You can test the API using curl, Postman, or your browser:

```bash
# Health check
curl http://localhost:3000/api/health

# Get latest glucose reading
curl http://localhost:3000/api/glucose

# Or visit the web interface
open http://localhost:3000
````

## Deployment to Vercel

### Prerequisites

1. Install Vercel CLI globally:

```bash
npm install -g vercel
```

2. Sign up for a [Vercel account](https://vercel.com) if you don't have one

### Deploy Steps

1. **Login to Vercel:**

```bash
vercel login
```

2. **Deploy your project:**

```bash
vercel --prod
```

3. **Set up environment variables in Vercel dashboard:**
   - Go to your project in the Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     - `DEXCOM_SHARE_USERNAME`: Your Dexcom username
     - `DEXCOM_SHARE_PASSWORD`: Your Dexcom password
     - `DEXCOM_SHARE_SERVER`: Your region (US, JP, or OTHER)

4. **Redeploy after setting environment variables:**

```bash
vercel --prod
```

### Vercel Configuration

The project includes a `vercel.json` configuration file that:

- Builds the API using `@vercel/node`
- Routes all requests to `api/dev.js`
- Sets production environment

### Live API Endpoints

Once deployed, your API will be available at:

- `https://your-project.vercel.app/health`
- `https://your-project.vercel.app/api/glucose`

## Development

### Scripts

- `npm start` - Start the production API server
- `npm run dev` - Start the development server with auto-reload
- `npm run setup` - Copy environment template and set up local config
- `npm test` - Run tests (not yet implemented)

## Dependencies

- **Express.js** (^5.1.0) - Web framework for Node.js
- **dotenv** - Load environment variables from .env files

## Author

Dave Alger <me@davealger.com>

## Disclaimer

This project is not affiliated with Dexcom, Inc. Use of the Dexcom Share API is subject to Dexcom's terms of service. Please ensure you have permission to access the data you're requesting.
