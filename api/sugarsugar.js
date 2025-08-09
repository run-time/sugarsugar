import {
  SERVERS,
  ROUTES,
  MINUTES,
  BENCHMARKS,
  TREND_ARROWS,
} from './constants.js';

class SugarSugar {
  /**
   * Fetch multiple glucose readings from Dexcom Share API.
   * @param {number} maxReadings - Maximum number of readings to fetch.
   * @param {number} minutes - How many minutes back to fetch readings for.
   * @returns {Promise<Array>} Array of formatted readings.
   */
  async getGlucoseReadings(maxReadings = 24, minutes = 120) {
    if (!this.sessionId) {
      await this.authenticate();
    }
    try {
      const url = `${this.baseUrl}${ROUTES.READ_LATEST}?sessionId=${this.sessionId}&minutes=${minutes}&maxCount=${maxReadings}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Dexcom Share/3.0.2.11',
        },
      });
      if (response.status === 500) {
        const error = await response.json();
        if (error.Code === 'SessionIdNotFound') {
          this.sessionId = null;
          return this.getGlucoseReadings(maxReadings, minutes);
        }
        throw new Error(`Server error: ${error.Message}`);
      }
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const readings = await response.json();
      if (!Array.isArray(readings) || readings.length === 0) {
        throw new Error('No readings available');
      }
      // Format all readings
      return readings.map((r) => this.formatReading(r));
    } catch (error) {
      if (error.message.includes('SessionIdNotFound')) {
        this.sessionId = null;
        return this.getGlucoseReadings(maxReadings, minutes);
      }
      throw error;
    }
  }
  constructor(username, password, region = 'US') {
    this.username = username;
    this.password = password;
    this.region = region.toUpperCase();
    this.baseUrl = SERVERS[this.region].baseUrl;
    this.applicationId = SERVERS[this.region].id;
    this.sessionId = null;
    this.accountId = null;
  }

  async authenticate() {
    try {
      if (!this.accountId) {
        console.log('Getting account ID...');
        const authUrl = `${this.baseUrl}${ROUTES.AUTHENTICATE}`;

        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Dexcom Share/3.0.2.11',
          },
          body: JSON.stringify({
            accountName: this.username,
            password: this.password,
            applicationId: this.applicationId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Account authentication failed: ${response.status}`);
        }

        this.accountId = (await response.text()).replace(/"/g, '');

        if (this.accountId === '00000000-0000-0000-0000-000000000000') {
          throw new Error('Invalid credentials');
        }
      }

      console.log('Getting session ID...');
      const loginUrl = `${this.baseUrl}${ROUTES.LOGIN}`;

      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Dexcom Share/3.0.2.11',
        },
        body: JSON.stringify({
          accountId: this.accountId,
          password: this.password,
          applicationId: this.applicationId,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error(`Session login failed: ${loginResponse.status}`);
      }

      this.sessionId = (await loginResponse.text()).replace(/"/g, '');

      if (this.sessionId === '00000000-0000-0000-0000-000000000000') {
        throw new Error('Login failed');
      }

      return this.sessionId;
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  async getLatestGlucose() {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      console.log('Fetching latest glucose reading...');
      const url = `${this.baseUrl}${ROUTES.READ_LATEST}?sessionId=${this.sessionId}&minutes=${MINUTES.LAST_DAY}&maxCount=2`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Dexcom Share/3.0.2.11',
        },
      });

      if (response.status === 500) {
        const error = await response.json();
        if (error.Code === 'SessionIdNotFound') {
          this.sessionId = null;
          return this.getLatestGlucose();
        }
        throw new Error(`Server error: ${error.Message}`);
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const readings = await response.json();
      if (!Array.isArray(readings) || readings.length === 0) {
        throw new Error('No readings available');
      }

      if (readings.length > 1) {
        readings[0].PreviousValue = readings[1].Value || null;
        readings[0].ValueDifference =
          readings[0].Value != null && readings[1].Value != null
            ? readings[0].Value - readings[1].Value
            : null;
        console.log(
          `Value difference between latest readings: ${readings[0].ValueDifference}`,
        );
      } else {
        readings[0].PreviousValue = null;
        readings[0].ValueDifference = null;
        console.log(
          'Only one reading available, setting previousValue and valueDifference to null',
        );
      }

      return this.formatReading(readings[0]);
    } catch (error) {
      if (error.message.includes('SessionIdNotFound')) {
        this.sessionId = null;
        return this.getLatestGlucose();
      }
      throw error;
    }
  }

  formatReading(reading) {
    console.log('Formatting reading:', reading);

    if (
      !reading ||
      !reading.WT ||
      !reading.ST ||
      !reading.DT ||
      !reading.Value ||
      !reading.Trend
    ) {
      throw new Error('Invalid reading format');
    }

    const trendInfo = TREND_ARROWS[reading.Trend] || TREND_ARROWS.NotComputable;
    const readingTime = new Date(parseInt(reading.WT.match(/\d+/)[0]));
    const timeAgo = this.getTimeAgo(readingTime);
    const minutesAgo = this.getMinutesAgo(readingTime);

    return {
      _value: reading.Value,
      _previous_value: reading.PreviousValue || null,
      _value_difference: reading.ValueDifference || null,
      _trend_direction: reading.Trend,
      _trend_info: trendInfo,
      _datetime: readingTime,
      _time_ago: timeAgo,
      _minutes_ago: minutesAgo,
      _status: this.getGlucoseStatus(reading.Value),
    };
  }

  getMinutesAgo(readingTime) {
    const now = new Date();
    const diffMs = now - readingTime;
    return Math.floor(diffMs / 60000);
  }

  getTimeAgo(readingTime) {
    const now = new Date();
    const diffMs = now - readingTime;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      if (remainingHours === 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      } else {
        const dayText = diffDays === 1 ? '1 day' : `${diffDays} days`;
        const hourText =
          remainingHours === 1 ? '1 hour' : `${remainingHours} hours`;
        return `${dayText} and ${hourText} ago`;
      }
    } else if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      if (remainingMinutes === 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else {
        const hourText = diffHours === 1 ? '1 hour' : `${diffHours} hours`;
        const minuteText =
          remainingMinutes === 1 ? '1 minute' : `${remainingMinutes} minutes`;
        return `${hourText} and ${minuteText} ago`;
      }
    } else if (diffMinutes > 0) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    } else {
      return 'just now';
    }
  }

  getGlucoseStatus(value) {
    if (value < BENCHMARKS.LOW) return 'LOW';
    if (value > BENCHMARKS.HIGH) return 'HIGH';
    return 'IN RANGE';
  }
}

export default SugarSugar;
