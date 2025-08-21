const Alexa = require('ask-sdk-core');
const https = require('https');

const alexaSays = {
  help: 'The SugarSugar skill tells you your latest blood glucose reading.',
  cancel: 'Goodbye. Remember to eat more steak and salad!',
  exit: 'Goodbye. Remember to eat more steak and salad!',
  error: "Sorry, I can't read the glucose data at this time.",
};

const endpointUrl = 'https://sugarsugar.vercel.app/glucose';

function fetchData(url, callback) {
  https
    .get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          callback(null, jsonData);
        } catch (error) {
          callback(error, null);
        }
      });
    })
    .on('error', (error) => {
      callback(error, null);
    });
}

const GetGlucoseIntent = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
    );
  },
  async handle(handlerInput) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      fetchData(endpointUrl, (error, jsonData) => {
        const glucoseValue = jsonData.value;
        const glucoseTrend = jsonData.trend.name.toLowerCase();
        const lastReadingTime = jsonData.read;
        const rawDifference = parseInt(jsonData.value_difference);
        const isHigher = rawDifference >= 1;
        const diff = Math.abs(rawDifference);

        const sayCurrentReading = `${glucoseValue} and ${glucoseTrend}.`;
        const sayDifference = `This is ${diff} ${isHigher ? 'higher' : 'lower'} than your previous reading.`;
        const sayTimeAgo = `Last checked ${lastReadingTime}.`;

        const sayLatestGlucoseReading = `${sayCurrentReading} ${sayDifference} ${sayTimeAgo}`;

        if (error) {
          resolve(
            handlerInput.responseBuilder.speak(alexaSays.error).getResponse(),
          );
        } else {
          resolve(
            handlerInput.responseBuilder
              .speak(sayLatestGlucoseReading)
              .getResponse(),
          );
        }
      });
    });
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(alexaSays.help).getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(alexaSays.cancel).getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(alexaSays.cancel).getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.stack}`);
    return handlerInput.responseBuilder.speak(alexaSays.error).getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    GetGlucoseIntent,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
