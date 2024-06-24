import React, { useEffect, useState } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';

const SERVER_URL = "http://opendata.fmi.fi/wfs";
const STORED_QUERY_OBSERVATION = "fmi::observations::weather::simple";
const parameters = [
  't2m', 'ws_10min', 'wg_10min', 'wd_10min', 'rh', 'td', 'r_1h', 
  'ri_10min', 'snow_aws', 'p_sea', 'vis', 'n_man', 'wawa'
];

function WeatherData({ map, selectedParameter }) {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(SERVER_URL, {
          params: {
            service: 'WFS',
            version: '2.0.0',
            request: 'getFeature',
            storedquery_id: STORED_QUERY_OBSERVATION,
            parameters: parameters.join(','),
            bbox: '19.0,59.0,31.0,70.0', // Finland
            starttime: new Date(new Date().getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            endtime: new Date().toISOString(),
          }
        });

        // Parse the XML response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, "text/xml");
        const members = xmlDoc.getElementsByTagName("BsWfs:BsWfsElement");

        const parsedData = Array.from(members).map(member => {
          const pos = member.getElementsByTagName("gml:pos")[0].textContent.split(" ");
          const parameterName = member.getElementsByTagName("BsWfs:ParameterName")[0].textContent;
          const parameterValue = member.getElementsByTagName("BsWfs:ParameterValue")[0].textContent;
          const time = member.getElementsByTagName("BsWfs:Time")[0].textContent;

          return {
            location: {
              coordinates: [parseFloat(pos[0]), parseFloat(pos[1])]
            },
            time,
            parameterName,
            parameterValue
          };
        });

        console.log('Parsed Weather Data:', parsedData);

        setWeatherData(parsedData);

      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, [selectedParameter]);

  useEffect(() => {
    if (!map || weatherData.length === 0) return;

    // Remove existing weather markers
    document.querySelectorAll('.weather-label').forEach(marker => marker.remove());

    // Filter and display markers for selected parameter
    weatherData.forEach((data) => {
      if (data.parameterName === selectedParameter) {
        const { coordinates } = data.location;
        const value = data.parameterValue;

        // Create a div element for the marker
        const markerEl = document.createElement('div');
        markerEl.className = 'weather-label';
        markerEl.textContent = `${value}`;
        markerEl.style.fontSize = '12px';
        markerEl.style.fontWeight = 'bold';
        markerEl.style.color = 'black';
        markerEl.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        markerEl.style.border = '1px solid #ccc';
        markerEl.style.padding = '4px';
        markerEl.style.borderRadius = '4px';
        markerEl.style.textAlign = 'center';
        markerEl.style.width = 'auto';
        markerEl.style.whiteSpace = 'nowrap';

        // Add marker to the map
        new mapboxgl.Marker({
          element: markerEl
        })
        .setLngLat([coordinates[0], coordinates[1]])
        .addTo(map);
      }
    });

    // Clean up markers when weatherData changes
    return () => {
      document.querySelectorAll('.weather-label').forEach(marker => marker.remove());
    };
  }, [map, weatherData, selectedParameter]);

  return null;
}

export default WeatherData;
