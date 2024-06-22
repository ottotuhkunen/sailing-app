import React from 'react';

function WeatherSelector({ selectedParameter, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="weather-selector">
      <label htmlFor="weather-parameter">Select Weather Parameter:</label>
      <select
        id="weather-parameter"
        value={selectedParameter}
        onChange={handleChange}
      >
        <option value="t2m">Temperature</option>
        <option value="ws_10min">Average Wind Speed (10 min)</option>
        <option value="wg_10min">Maximum Wind Speed (10 min)</option>
        <option value="wd_10min">Wind Direction (10 min)</option>
        <option value="rh">Relative Humidity</option>
        <option value="td">Dew Point</option>
        <option value="r_1h">Rainfall (1 hour)</option>
        <option value="ri_10min">Rain Intensity (10 min)</option>
        <option value="snow_aws">Snow Depth</option>
        <option value="p_sea">Sea Level Pressure</option>
        <option value="vis">Visibility</option>
        <option value="n_man">Cloudiness</option>
        <option value="wawa">Weather Phenomena</option>
      </select>
    </div>
  );
}

export default WeatherSelector;
