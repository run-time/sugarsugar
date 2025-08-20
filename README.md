# 🍭 SugarSugar API

An easy to host, easy to use webservice to get your blood glucose data from Dexcom

---

# [• &nbsp;• •• Live Demo •• •&nbsp; •](https://sugarsugar.vercel.app/)

## 📊 API Endpoints

| Endpoint                                                                    | Description                                                                                    |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **GET [`/glucose`](https://sugarsugar.vercel.app/glucose)**                        | Latest glucose reading in a simple format                                                      |
| **GET [`/graph`](https://sugarsugar.vercel.app/graph)**                     | List of all glucose readings for the last 2 hours (default)                                    |
| **GET [`/graph?hours=5.5`](https://sugarsugar.vercel.app/graph?hours=12)** | Get up to an entire day of glucose readings by adding the query parameter `hours` (0.1 - 24.0) |
| **GET [`/health`](https://sugarsugar.vercel.app/health)**                   | Service health check and status                                                                |

---

## 📦 Native Web Component

[`circle-trendicator.js`](https://sugarsugar.vercel.app/cgm.html)

Easily display glucose trends on your own web app with this responsive CGM trendicator

## 📱 Amazon Echo Viewer

[`alexa.html`](https://sugarsugar.vercel.app/alexa.html)

## ⌗ API Response Data

<details>
  <summary><span style="color:#368dda;font-size:20px;">/glucose</span> &nbsp; <span style="font-size:16px;">returns your latest blood sugar reading</span></summary>

```json
{
  "time": "2025-08-20T00:13:29.000Z",
  "value": 146,
  "previous_value": 163,
  "value_difference": -17,
  "trend": {
    "id": "FortyFiveDown",
    "symbol": "↘",
    "name": "Falling Slowly",
    "trendRate": -1
  },
  "status": "IN RANGE",
  "minutes_ago": 3,
  "last_reading": "last checked 3 minutes ago"
}
```

</details>

<details>
  <summary><span style="color:#368dda;font-size:20px;">/graph</span> &nbsp; <span style="font-size:16px;">returns a list of readings for the last 2 hours</span></summary>

```json
{
  "count": 8,
  "hours": 2,
  "readings": [
    {
      "time": "2025-08-20T01:13:28.000Z",
      "value": 143,
      "trend": {
        "id": "NotComputable",
        "symbol": "?",
        "name": "Not Computable",
        "trendRate": 0
      }
    },
    {
      "time": "2025-08-20T00:13:29.000Z",
      "value": 163,
      "trend": {
        "id": "NotComputable",
        "symbol": "?",
        "name": "Not Computable",
        "trendRate": 0
      }
    },
    {
      "time": "2025-08-19T23:53:28.000Z",
      "value": 146,
      "trend": {
        "id": "DoubleDown",
        "symbol": "⇊",
        "name": "Falling Rapidly",
        "trendRate": -3
      }
    },
    {
      "time": "2025-08-19T23:48:28.000Z",
      "value": 220,
      "trend": {
        "id": "FortyFiveDown",
        "symbol": "↘",
        "name": "Falling Slowly",
        "trendRate": -1
      }
    },
    {
      "time": "2025-08-19T23:43:28.000Z",
      "value": 203,
      "trend": {
        "id": "NotComputable",
        "symbol": "?",
        "name": "Not Computable",
        "trendRate": 0
      }
    },
    {
      "time": "2025-08-19T23:38:28.000Z",
      "value": 241,
      "trend": {
        "id": "NotComputable",
        "symbol": "?",
        "name": "Not Computable",
        "trendRate": 0
      }
    },
    {
      "time": "2025-08-19T23:33:29.000Z",
      "value": 235,
      "trend": {
        "id": "NotComputable",
        "symbol": "?",
        "name": "Not Computable",
        "trendRate": 0
      }
    },
    {
      "time": "2025-08-19T23:28:29.000Z",
      "value": 252,
      "trend": {
        "id": "NotComputable",
        "symbol": "?",
        "name": "Not Computable",
        "trendRate": 0
      }
    }
  ]
}
```

</details>

<details>
  <summary><span style="color:#368dda;font-size:20px;">/health</span> &nbsp; <span style="font-size:16px;">returns the status of the web service</span></summary>

```json
{
  "status": "ok",
  "timestamp": "2025-08-20T01:14:41.234Z",
  "service": "SugarSugar Dexcom API"
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

# add your Dexcom share credentials to .env.vercel (message me directly if you don't know where to find these)

npm start
```

## 🛠 Scripts

- `npm start` – Start local development server
- `npm run dev` – Start with file watching
- `npm test` – Run tests
- `npm run build` – Build for production
- `npm run vercel-build` – Vercel build command
- `npm run lint` – Check code style
- `npm run format` – Check formatting
- `npm run verify` - Run this before making a PR

## 📚 Documentation

Looking for helpers to add complete documentation on the [GitHub repository](https://github.com/run-time/sugarsugar) for how to run your own SugarSugar webservice and connect your own Amazon Echo devices to it for free using [vercel](https://vercel.com/).

## ❤️ Author

Hi I'm Dave 👋

I messaged the creator of sugarmate a few times and was sad when that was taken down. I now have a way to run and host everything myself for free and it's all in this repo.

Send me a message that doesn't look like SPAM and I'll help you get up and running too! <me@davealger.com>

---

### ⚠️ _Disclaimer_

This project is not affiliated with Dexcom, Inc. Use of the Dexcom Share API is subject to Dexcom's terms of service.
