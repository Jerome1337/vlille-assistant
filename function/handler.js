const fetch = require('node-fetch');
const { dialogflow, SimpleResponse } = require('actions-on-google');

const app = dialogflow({ debug: true });

async function checkStations() {
  return fetch('https://opendata.lillemetropole.fr/api/v2/catalog/datasets/vlille-realtime/records')
    .then((res) => res.json())
    .then((json) => json.records[0].record.fields.nbvelosdispo)
    .catch((err) => console.log(err));
}

module.exports = async () => {
  app.intent("Vérifier la disponibilité des V'Lille", async (conv) => {
    const bikeNumber = await checkStations();

    conv.close(new SimpleResponse({
      text: `Il y a ${bikeNumber} velos.`,
      speech: `Il y a ${bikeNumber} velos dans la station la plus proche.`,
    }));
  });

  return app;
};
