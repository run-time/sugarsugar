const SERVERS = {
  US: {
    code: 'us',
    name: 'United States',
    accountUrl: 'https://uam1.dexcom.com',
    baseUrl: 'https://share2.dexcom.com',
    id: 'd89443d2-327c-4a6f-89e5-496bbb0317db',
  },
  JP: {
    code: 'jp',
    name: 'Japan',
    accountUrl: 'https://uam.dexcom.jp',
    baseUrl: 'https://share.dexcom.jp',
    id: 'd8665ade-9673-4e27-9ff6-92db4ce13d13',
  },
  OTHER: {
    code: 'ous',
    name: 'Outside United States',
    accountUrl: 'https://uam.dexcom.com',
    baseUrl: 'https://shareous1.dexcom.com',
    id: 'd89443d2-327c-4a6f-89e5-496bbb0317db',
  },
};

const ROUTES = {
  AUTHENTICATE:
    '/ShareWebServices/Services/General/AuthenticatePublisherAccount',
  LOGIN: '/ShareWebServices/Services/General/LoginPublisherAccountById',
  READ_LATEST:
    '/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues',
};

const BENCHMARKS = {
  LOW: 60,
  HIGH: 240,
};

const MGDL_TO_MMOLL_FACTOR = 0.0555;

const UNIT_LABELS = {
  MGDL: 'mg/dL',
  MMOLL: 'mmol/L',
};

const MINUTES = {
  LAST_READING: 5,
  LAST_TWO_READINGS: 10,
  LAST_THREE_READINGS: 15,
  LAST_HOUR: 60,
  LAST_DAY: 24 * 60,
};

const TREND_ARROWS = {
  None: {
    id: 'None',
    symbol: '—',
    name: 'No Arrow',
    trendRate: 0,
  },
  DoubleUp: {
    id: 'DoubleUp',
    symbol: '⇈',
    name: 'Rising Rapidly',
    trendRate: 3,
  },
  SingleUp: {
    id: 'SingleUp',
    symbol: '↑',
    name: 'Rising',
    trendRate: 2,
  },
  FortyFiveUp: {
    id: 'FortyFiveUp',
    symbol: '↗',
    name: 'Rising Slowly',
    trendRate: 1,
  },
  Flat: {
    id: 'Flat',
    symbol: '→',
    name: 'Level',
    trendRate: 0,
  },
  FortyFiveDown: {
    id: 'FortyFiveDown',
    symbol: '↘',
    name: 'Falling Slowly',
    trendRate: -1,
  },
  SingleDown: {
    id: 'SingleDown',
    symbol: '↓',
    name: 'Falling',
    trendRate: -2,
  },
  DoubleDown: {
    id: 'DoubleDown',
    symbol: '⇊',
    name: 'Falling Rapidly',
    trendRate: -3,
  },
  NotComputable: {
    id: 'NotComputable',
    symbol: '?',
    name: 'Not Computable',
    trendRate: 0,
  },
  RateOutOfRange: {
    id: 'RateOutOfRange',
    symbol: '!',
    name: 'Rate Out Of Range',
    trendRate: 0,
  },
};

export {
  SERVERS,
  ROUTES,
  BENCHMARKS,
  MGDL_TO_MMOLL_FACTOR,
  UNIT_LABELS,
  MINUTES,
  TREND_ARROWS,
};
