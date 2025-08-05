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
    description:
      'No arrow is displayed, typically indicating that the system cannot compute a reliable trend arrow.',
    trendRate: 0,
  },
  DoubleUp: {
    id: 'DoubleUp',
    symbol: '⇈',
    name: 'Rising Rapidly',
    description: 'Blood sugar is rapidly increasing (+3 ≤ trendRate ≤ +8)',
    trendRate: 3,
  },
  SingleUp: {
    id: 'SingleUp',
    symbol: '↑',
    name: 'Rising',
    description:
      'Blood sugar is increasing at a moderate pace (+2 ≤ trendRate < +3)',
    trendRate: 2,
  },
  FortyFiveUp: {
    id: 'FortyFiveUp',
    symbol: '↗',
    name: 'Rising Slowly',
    description: 'Blood sugar is slowly increasing (+1 ≤ trendRate < +2)',
    trendRate: 1,
  },
  Flat: {
    id: 'Flat',
    symbol: '→',
    name: 'Level',
    description:
      'Blood sugar is stable or changing very slowly (-1 < trendRate < +1)',
    trendRate: 0,
  },
  FortyFiveDown: {
    id: 'FortyFiveDown',
    symbol: '↘',
    name: 'Falling Slowly',
    description: 'Blood sugar is slowly decreasing (-1 < trendRate ≤ 0)',
    trendRate: -1,
  },
  SingleDown: {
    id: 'SingleDown',
    symbol: '↓',
    name: 'Falling',
    description:
      'Blood sugar is decreasing at a moderate pace (-3 < trendRate ≤ -2)',
    trendRate: -2,
  },
  DoubleDown: {
    id: 'DoubleDown',
    symbol: '⇊',
    name: 'Falling Rapidly',
    description: 'Blood sugar is rapidly decreasing (-8 < trendRate ≤ -3)',
    trendRate: -3,
  },
  NotComputable: {
    id: 'NotComputable',
    symbol: '?',
    name: 'Not Computable',
    description: 'The algorithm is unable to compute a trend arrow',
    trendRate: 0,
  },
  RateOutOfRange: {
    id: 'RateOutOfRange',
    symbol: '!',
    name: 'Rate Out Of Range',
    description:
      'The calculated glucose rate falls outside the range for assigning trend arrows',
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
