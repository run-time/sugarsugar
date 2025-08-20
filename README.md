# SugarSugar

A webservice to ask Dexcom Share for blood glucose data.

## [Live Demo](https://sugarsugar.vercel.app/)

---

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

4. Edit `.env.vercel` with your actual Dexcom credentials:

```bash
# Edit the file with your credentials
DEXCOM_SHARE_ID=your_account_id
DEXCOM_SHARE_USERNAME=your_dexcom_username
DEXCOM_SHARE_PASSWORD=your_dexcom_password
```

> **⚠️ Security Note**: Never commit `.env.vercel` files to git. These files contain sensitive credentials and should only exist locally or in your deployment environment.

## Configuration

1. Set up your environment variables in `.env.vercel`:

```bash
npm run setup
```

- `DEXCOM_SHARE_ID`: Your Dexcom Share account ID
- `DEXCOM_SHARE_USERNAME`: Your Dexcom Share username
- `DEXCOM_SHARE_PASSWORD`: Your Dexcom Share password
- `DEXCOM_SHARE_SERVER`: Dexcom server region

| Code  | Region                  | Server URL      |
| ----- | ----------------------- | --------------- |
| us    | United States (default) | uam1.dexcom.com |
| jp    | Japan/Asia-Pacific      | uam.dexcom.jp   |
| other | Outside the US          | uam2.dexcom.com |

2. Start the API server:

```bash
npm start
```

3. The API will be available at `http://localhost:3000`

## API Directory Structure

The `api/` directory contains the core functionality:

- **`sugarsugar.js`** - Main SugarSugar class that handles Dexcom Share API communication
- **`constants.js`** - Configuration constants for Dexcom servers and endpoints
- **`index.js`** - Express server for **local development only** (not used in Vercel deployments)
- **`glucose.js`** - Vercel serverless function for glucose data endpoint (used in production)
- **`health.js`** - Vercel serverless function for health check endpoint (used in production)

### Local Development vs Deployment

**Local Development:**

- Uses `api/index.js` as an Express server
- Run with `npm start` or `npm run dev`
- Serves the full API on `http://localhost:3000`

**Vercel Deployment:**

- Uses serverless functions `glucose.js` and `health.js`
- `index.js` is **NOT** used in production
- Configured via `vercel.json` routing

## API Endpoints

### `GET /api/health`

Health check endpoint that returns the service status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-08-05T12:00:00.000Z",
  "service": "SugarSugar API"
}
```

### `GET /api/glucose`

Retrieves blood glucose readings from Dexcom Share.

**Query Parameters:**

- `minutes` (optional) - Number of minutes of historical data to retrieve (default: 1440, max: 1440)
- `maxCount` (optional) - Maximum number of readings to return (default: 1, max: 288)

**Response:**

```json
[
  {
    "DT": "/Date(1722859200000)/",
    "ST": "/Date(1722859200000)/",
    "Trend": 4,
    "Value": 120,
    "WT": "/Date(1722859200000)/"
  }
]
```

## Scripts

### Development

```bash
npm start        # Start local development server
npm run dev      # Start with file watching
npm test         # Run tests
```

### Build & Deploy

```bash
npm run build           # Build for production
npm run vercel-build    # Vercel build command
```

### Code Quality

```bash
npm run lint            # Check code style
npm run lint:fix        # Fix linting issues
npm run format          # Check formatting
npm run format:fix      # Fix formatting
```

## Dependencies

## Author

Dave Alger <me@davealger.com>

## Disclaimer

This project is not affiliated with Dexcom, Inc. Use of the Dexcom Share API is subject to Dexcom's terms of service. Please ensure you have permission to access the data you're requesting.
