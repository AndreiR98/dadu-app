import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const WeatherGraph = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        setStartDate(currentDate);
        setEndDate(currentDate);
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:1337/api/weather', {
                startDate: startDate,
                endDate: endDate,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const jsonData = response.data;

            // Calculate hourly averages for each city
            const formattedData = jsonData.cities.map(city => {
                const hourlyAverages = {};

                city.records.forEach(record => {
                    const hour = new Date(record.time).getHours();

                    if (!hourlyAverages[hour]) {
                        hourlyAverages[hour] = {
                            count: 0,
                            totalTemperature: 0,
                            totalPressure: 0,
                            totalHumidity: 0,
                        };
                    }

                    hourlyAverages[hour].count++;
                    hourlyAverages[hour].totalTemperature += record.temperature;
                    hourlyAverages[hour].totalPressure += record.pressure;
                    hourlyAverages[hour].totalHumidity += record.humidity;
                });

                // Calculate averages and format data for each hour
                const averagedRecords = [];
                for (const hour in hourlyAverages) {
                    if (hourlyAverages.hasOwnProperty(hour)) {
                        const avgTemperature = (hourlyAverages[hour].totalTemperature / hourlyAverages[hour].count).toFixed(2);
                        const avgPressure = (hourlyAverages[hour].totalPressure / hourlyAverages[hour].count).toFixed(2);
                        const avgHumidity = (hourlyAverages[hour].totalHumidity / hourlyAverages[hour].count).toFixed(2);

                        averagedRecords.push({
                            time: hour,
                            temperature: parseFloat(avgTemperature),
                            pressure: parseFloat(avgPressure),
                            humidity: parseFloat(avgHumidity),
                        });
                    }
                }

                return {
                    name: city.name,
                    records: averagedRecords.sort((a, b) => a.time - b.time),
                };
            });

            setWeatherData(formattedData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
                <button type="submit">Fetch Data</button>
            </form>

            {weatherData.map(city => (
                <div key={city.name} style={{ marginBottom: '90px', textAlign: 'center' }}>
                    <h2>{city.name} - Temperature</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={city.records}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" type="number" domain={[0, 23]} tickCount={24} />
                            <YAxis domain={['auto', 'auto']} unit="°C" />
                            <Legend />
                            <Line type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature" dot />
                        </LineChart>
                    </ResponsiveContainer>

                    <h2>{city.name} - Pressure</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={city.records}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" type="number" domain={[0, 23]} tickCount={24} />
                            <YAxis domain={['auto', 'auto']} unit="hPa" />
                            <Legend />
                            <Line type="monotone" dataKey="pressure" stroke="#82ca9d" name="Pressure" dot />
                        </LineChart>
                    </ResponsiveContainer>

                    <h2>{city.name} - Humidity</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={city.records}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" type="number" domain={[0, 23]} tickCount={24} />
                            <YAxis domain={['auto', 'auto']} unit="%" />
                            <Legend />
                            <Line type="monotone" dataKey="humidity" stroke="#ffc658" name="Humidity" dot />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </div>
    );
};

export default WeatherGraph;
