const fetch = require('node-fetch');

async function checkStations() {
  return await fetch('https://opendata.lillemetropole.fr/api/v2/catalog/datasets/vlille-realtime/records')
    .then((res) => res.json())
    .then((json) => json.records[0].record.fields.nbvelosdispo)
    .catch((err) => console.log(err));
}

module.exports = (context, callback) => {
  const input = JSON.parse(context);
  const responseObject = {
    fulfillmentText: "This is a text response",
    fulfillmentMessages: [],
    source: "V'lille assistant",
    payload: {
      google: {
        expectUserResponse: true,
        richResponse: {
          items: [
            {
              simpleResponse: {}
            }
          ]
        }
      }
    }
  }

  if (input && input.queryResult) {
    switch (input.queryResult.intent.displayName) {
      case 'welcome':
        responseObject.payload.google.richResponse.items[0].simpleResponse.textToSpeech = "Bonjour, que voulez-vous demander à l'assistant V'lille ?";
        break;
      case "disponibility":
        const bikes = checkStations();
        responseObject.payload.google.richResponse.items[0].simpleResponse.textToSpeech = `Il y a ${bikes} vélos disponible.`;
        break;
      case 'input.unknown':
      case 'default':
      default:
        responseObject.payload.google.richResponse.items[0].simpleResponse.textToSpeech = 'Raté ! Je ne comprend pas ce que vous dites.';
    }

    responseObject.fulfillmentText = responseObject.payload.google.richResponse.items[0].simpleResponse.textToSpeech;
  } else {
    responseObject.payload.google.richResponse.items[0].simpleResponse.textToSpeech = 'Unable to parse the input. Function may be out of date';
  }

  callback(undefined, responseObject);
};
