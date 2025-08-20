# 🍭 SugarSugar API

**A webservice to ask Dexcom Share servers for blood glucose data**

[![Live Demo](https://sugarsugar.vercel.app/)](https://sugarsugar.vercel.app/)

> **Status:** LIVE &nbsp; **API Version:** 1.0.0

---

## 📊 API Endpoints

- **GET `/glucose`**  
  Latest glucose reading in a simple format

- **GET `/graph`**  
  List of all glucose readings for the last 2 hours (default)

- **GET `/graph?hours=5.5`**  
  Get up to an entire day of glucose readings by adding the query parameter `hours` (0.1 - 24.0)

- **GET `/health`**  
  Service health check and status

---

## 📦 Native Web Component

- `circle-trendicator.js`  
  Easily display glucose trends in your own app.

---

## 📖 Code Examples

- [CGM Viewer Example](public/examples/cgm.html)
- [Amazon Echo Viewer Example](public/examples/alexa.html)

---

## ⌗ API Responses

<details>
  <summary><strong>/glucose</strong></summary>

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

</details>

<details>
  <summary><strong>/graph</strong></summary>

Returns an array of glucose readings for the requested time period.

</details>

<details>
  <summary><strong>/health</strong></summary>

```json
{
  "status": "ok",
  "timestamp": "2025-08-05T12:00:00.000Z",
  "service": "SugarSugar API"
}
```

</details>

---

## 🚀 Quick Start

```bash
git clone https://github.com/run-time/sugarsugar.git
cd sugarsugar
npm install
npm run setup
# Edit .env.vercel with your Dexcom credentials
npm start
```

API available at: [http://localhost:3000](http://localhost:3000)

---

## 🛠 Scripts

- `npm start` – Start local development server
- `npm run dev` – Start with file watching
- `npm test` – Run tests
- `npm run build` – Build for production
- `npm run vercel-build` – Vercel build command
- `npm run lint` – Check code style
- `npm run format` – Check formatting
- `npm run verify` - Run this before making a PR

---

## 📚 Documentation

For complete setup instructions and API documentation, visit the [GitHub repository](https://github.com/run-time/sugarsugar).

---

## ❤️ Author

Dave Alger <me@davealger.com>

---

## ⚠️ Disclaimer

This project is not affiliated with Dexcom, Inc. Use of the Dexcom Share API is subject to Dexcom's terms of service.
