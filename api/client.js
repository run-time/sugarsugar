
import SugarSugar from './sugarsugar.js';
import * as constants from './constants.js';

export function initializeDexcomClient() {
  const username = process.env.DEXCOM_SHARE_USERNAME;
  const password = process.env.DEXCOM_SHARE_PASSWORD;
  const server = process.env.DEXCOM_SHARE_SERVER || 'US';
  const SERVER_INFO = { ...constants.SERVERS[server] };

  if (!username || !password) {
    throw new Error(
      'DEXCOM_SHARE_USERNAME and DEXCOM_SHARE_PASSWORD must be set as environment variables',
    );
  }

  if (!SERVER_INFO.code) {
    throw new Error(
      `Invalid DEXCOM_SHARE_SERVER: ${server}. Supported servers are: ${Object.keys(constants.SERVERS).join(', ')}`,
    );
  }

  return new SugarSugar(username, password, server);
}
