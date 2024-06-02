import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import xml2js from 'xml2js';
import moment from 'moment';

Chart.register(...registerables);

const App = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('public/weather_data.xml', {
          'Content-Type': 'application/xml; charset=utf-8',
        });
        const xml = response.data;
        const result = await xml2js.parseStringPromise(xml, { explicitArray: false });
        setWeatherData(result.WeatherData.City);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const filteredData = weatherData.find((city) => city.name === selectedCity)?.record || [];

  const chartData = filteredData.filter((record) => {
    const time = moment(record.time, 'YYYY-MM-DD HH:mm:ss');
    const start = startDate ? moment(startDate, 'YYYY-MM-DD') : null;
    const end = endDate ? moment(endDate, 'YYYY-MM-DD') : null;

    if (start && end) {
      return time.isBetween(start, end, null, '[]');
    } else if (start) {
      return time.isSameOrAfter(start);
    } else if (end) {
      return time.isSameOrBefore(end);
    }
    return true;
  });

  const data = {
    labels: chartData.map((record) => record.time),
    datasets: [
      {
        label: 'Temperature',
        data: chartData.map((record) => parseFloat(record.temperature)),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
      {
        label: 'Pressure',
        data: chartData.map((record) => parseFloat(record.pressure)),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
      },
      {
        label: 'Humidity',
        data: chartData.map((record) => parseFloat(record.humidity)),
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'YYYY-MM-DD',
          },
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
      <div>
        <div>
          <label htmlFor="city-select">Select City: </label>
          <select id="city-select" value={selectedCity} onChange={handleCityChange}>
            <option value="">All Cities</option>
            {weatherData.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="start-date">Start Date: </label>
          <input type="date" id="start-date" value={startDate} onChange={handleStartDateChange} />
        </div>
        <div>
          <label htmlFor="end-date">End Date: </label>
          <input type="date" id="end-date" value={endDate} onChange={handleEndDateChange} />
        </div>
        <div style={{ width: '800px', height: '400px' }}>
          <Line data={data} options={options} />
        </div>
      </div>
  );
};

export default App;