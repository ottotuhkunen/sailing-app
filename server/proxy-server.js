const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 4000;

app.use(cors());

const apiKey = 'ee14979c-1101-4a19-a882-50c633c4daf8'; // Replace with your actual API key
const baseUrl = 'https://avoin-paikkatieto.maanmittauslaitos.fi/geographic-names/features/v1/collections/placenames/items';
const placeType = '2010110';

function getAuthHeader(apiKey) {
  const base64ApiKey = Buffer.from(`${apiKey}:`).toString('base64');
  return `Basic ${base64ApiKey}`;
}

async function fetchAllGeoJson() {
  let allFeatures = [];

  let nextPage = `${baseUrl}?placeType=${placeType}`;

  while (nextPage) {
    try {
      const response = await axios.get(nextPage, {
        headers: {
          'Authorization': getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = response.data;

      if (data.features) {
        allFeatures = allFeatures.concat(data.features);

        // Check if there's a next page link
        nextPage = data.links.find(link => link.rel === 'next')?.href;
      } else {
        console.error('Error: No features found in response');
        break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      break;
    }
  }

  return allFeatures;
}

app.get('/api/placenames', async (req, res) => {
  try {
    const allFeatures = await fetchAllGeoJson();
    
    const geoJson = {
      type: 'FeatureCollection',
      features: allFeatures,
      timeStamp: new Date().toISOString(),
      links: [
        {
          href: `${baseUrl}?placeType=${placeType}`,
          rel: 'self',
          type: 'application/geo+json',
          title: 'This document'
        }
      ],
      numberReturned: allFeatures.length
    };

    res.json(geoJson);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
