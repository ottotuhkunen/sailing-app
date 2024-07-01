import axios from 'axios';
import mapboxgl from 'mapbox-gl';

const weatherUrl = 'https://opendata.fmi.fi/wfs?request=GetFeature&storedquery_id=fmi::observations::weather::multipointcoverage&bbox=19.1,59.7,29.0,70.1&timestep=10';

export const loadWeather = async (map, dataType) => {
  try {
    const response = await axios.get(weatherUrl);
    const data = new window.DOMParser().parseFromString(response.data, 'text/xml');
    const points = data.getElementsByTagName('gml:Point');
    const valuesList = data.getElementsByTagName('gml:doubleOrNilReasonTupleList')[0].textContent.trim().split(/\s+/);
    const observationsPerPoint = 13; // Number of values per observation point (as indicated by the example XML)

    // Map of indices for different data types in the tuple list
    const dataTypeIndices = {
      't2m': 0,        // temperature
      'ws_10min': 1,   // wind speed
      'wg_10min': 2,   // maximum wind
      'wd_10min': 3,   // wind direction
      // Add other data types as needed
    };

    // Get the index of the chosen data type
    const dataTypeIndex = dataTypeIndices[dataType];

    // Ensure the data type is valid
    if (dataTypeIndex === undefined) {
      console.error('Invalid data type selected');
      return;
    }

    // Iterate over each point (location)
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const coords = point.getElementsByTagName('gml:pos')[0].textContent.split(' ');

      // Extract the relevant value based on the selected data type
      const value = parseFloat(valuesList[i * observationsPerPoint + dataTypeIndex]);

      // Special handling for wind speed to set icon name and rotation
      let iconName = 'weather'; // Default icon
      let windDirection = 0; // Default wind direction
      if (dataType === 'ws_10min') { // If wind speed
        const windSpeed = value;
        windDirection = parseFloat(valuesList[i * observationsPerPoint + dataTypeIndices['wd_10min']]);
        if (windSpeed > 14) {
          iconName = 'windStrong';
        } else if (windSpeed > 7) {
          iconName = 'windModerate';
        } else {
          iconName = 'windCalm';
        }
      }

      // Create a container for the marker with icon and text
      const container = document.createElement('div');
      container.className = 'marker-container';

      // Create the text element
      const text = document.createElement('div');
      text.className = 'weather-text';
      text.innerText = value.toFixed(1); // Display value rounded to 1 decimal place
      container.appendChild(text);

      // Create the icon element
      const icon = document.createElement('div');
      icon.className = 'weather-marker';
      icon.style.backgroundImage = `url(${process.env.PUBLIC_URL}/src/icons/${iconName}.png)`;
      icon.style.backgroundSize = 'cover';
      icon.style.width = '31px';
      icon.style.transform = `rotate(${windDirection+180}deg)`; // Rotate the icon
      container.appendChild(icon);



      // Add marker to map
      new mapboxgl.Marker(container)
        .setLngLat([parseFloat(coords[1]), parseFloat(coords[0])])
        .addTo(map);
    }
  } catch (error) {
    console.error('Error loading weather data:', error);
  }
};