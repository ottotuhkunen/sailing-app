/*
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const weatherFmisids = [
  100947, 100949, 101851, 101846, 101783, 101784, 101794, 101785, 101775,
  101673, 101661, 101660, 101675, 101464, 101479, 101481, 101256, 101268,
  101267, 101061, 101059, 100919, 100928, 100909, 151048, 151029, 100921,
  100908
];

export const fetchWeatherData = async () => {
  const { startTime, endTime } = getTimes(); // Get start and end times

  // Define the bounding box for the API request
  const bbox = '22,64,24,68'; // Example bbox coordinates (adjust as needed)
  const parameters = 'ws_10min'; // Example parameter (wind speed)
  const crs = 'EPSG::4326'; // Example CRS (coordinate reference system)

  const apiUrl = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::timevaluepair&bbox=${bbox}&parameters=${parameters}&crs=${crs}&starttime=${startTime}&endtime=${endTime}&timestep=60`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    const observations = parseWeatherData(data);
    return observations;
  } catch (error) {
    console.error('Fetch API error -', error);
    return null;
  }
};

// Get the current time in ISO format (for data fetching)
const getTimes = () => {
  const now = new Date();
  const startTime = new Date(now);
  startTime.setMinutes(now.getMinutes() - 15); // startTime 15 mins ago
  startTime.setSeconds(0, 0);

  // Round the current time to the nearest even minute, minus 1 minute
  const roundedMinutes = now.getMinutes() - (now.getMinutes() % 2) - 1;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0, 0);

  return {
    startTime: startTime.toISOString(),
    endTime: now.toISOString()
  };
};

// Parse weather data from XML to JSON
const parseWeatherData = (xmlText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const members = xmlDoc.getElementsByTagName('wfs:member');
  const observations = [];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const time = member.getElementsByTagName('BsWfs:Time')[0]?.textContent;
    const parameterName = member.getElementsByTagName('BsWfs:ParameterName')[0]?.textContent;
    const parameterValue = member.getElementsByTagName('BsWfs:ParameterValue')[0]?.textContent;
    const pos = member.getElementsByTagName('gml:pos')[0]?.textContent?.split(' ');
    const lon = parseFloat(pos[1]);
    const lat = parseFloat(pos[0]);

    if (parameterName === 'ws_10min') {
      const windSpeed = parseFloat(parameterValue);
      const windDirection = parseFloat(member.getElementsByTagName('BsWfs:ParameterValue')[1]?.textContent);
      const windGust = parseFloat(member.getElementsByTagName('BsWfs:ParameterValue')[2]?.textContent);
      
      observations.push({ time, lon, lat, windSpeed, windDirection, windGust });
    }
  }

  return observations;
};
*/