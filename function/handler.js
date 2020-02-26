const fetch = require('node-fetch');

async function checkStations() {
  return fetch('https://opendata.lillemetropole.fr/api/v2/catalog/datasets/vlille-realtime/records')
    .then((res) => res.json())
    .then((json) => json.records[0].record.fields.nbvelosdispo)
    .catch(() => {
      throw new Error('Error will fetching MEL V\'lille data.');
    });
}

module.exports = (context, callback) => {
  const input = JSON.parse(context);
  const responseObject = {
    fulfillmentText: 'This is a text response',
    fulfillmentMessages: [],
    source: "V'lille assistant",
    payload: {
      google: {
        expectUserResponse: true,
        richResponse: {
          items: [
            {
              simpleResponse: {},
            },
          ],
        },
      },
    },
  };

  let { textToSpeech } = responseObject.payload.google.richResponse.items[0].simpleResponse;

  if (input && input.queryResult) {
    switch (input.queryResult.intent.displayName) {
      case 'welcome':
        textToSpeech = "Bonjour, que voulez-vous demander à l'assistant V'lille ?";
        break;
      case 'disponibility':
        textToSpeech = `Il y a ${checkStations()} vélos disponible.`;
        break;
      case 'input.unknown':
      case 'default':
      default:
        textToSpeech = 'Raté ! Je ne comprend pas ce que vous dites.';
    }
  } else {
    textToSpeech = 'Unable to parse the input. Function may be out of date';
  }

  responseObject.fulfillmentText = textToSpeech;

  callback(undefined, responseObject);
};
