const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

  if (intentName === 'GetFlightInfo') {
    try {
      const response = await axios.get('https://fids.flightradar.live/widgets/airport/FEZ/departures');
      const $ = cheerio.load(response.data);

      let flights = [];
      $('tr').each((i, elem) => {
        const flightNumber = $(elem).find('td').eq(0).text().trim();
        const destination = $(elem).find('td').eq(1).text().trim();
        const departureTime = $(elem).find('td').eq(2).text().trim();
        const status = $(elem).find('td').eq(3).text().trim();

        if (flightNumber) {
          flights.push({
            flightNumber,
            destination,
            departureTime,
            status
          });
        }
      });

      let replyText = "Here are the upcoming flights:\n";
      flights.forEach(flight => {
        replyText += `Flight: ${flight.flightNumber}, Destination: ${flight.destination}, Departure Time: ${flight.departureTime}, Status: ${flight.status}\n`;
      });

      res.json({ fulfillmentText: replyText });
    } catch (error) {
      console.error(error);
      res.json({ fulfillmentText: 'Sorry, I could not retrieve the flight information at the moment.' });
    }
  } else {
    res.json({ fulfillmentText: 'Sorry, I did not understand that request.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
