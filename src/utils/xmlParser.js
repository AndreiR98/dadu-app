import { XMLParser } from 'fast-xml-parser';

export const parseXML = (xmlData) => {
    const parser = new XMLParser();
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
    };

    try {
        const jsonData = parser.parse(xmlData, options);
        const weatherData = jsonData.WeatherData;

        if (!weatherData || !weatherData.City) {
            throw new Error('Invalid XML structure: Missing WeatherData or City.');
        }

        const cities = Array.isArray(weatherData.City) ? weatherData.City : [weatherData.City];

        const parsedData = cities.map((city) => {
            const cityName = city['@_name'];
            const records = city.record.map((record) => ({
                time: record.time,
                temperature: parseFloat(record.temperature),
                pressure: parseFloat(record.pressure),
                humidity: parseFloat(record.humidity),
            }));

            return {
                cityName,
                records,
            };
        });

        return parsedData;
    } catch (error) {
        console.error('Error parsing XML:', error);
        throw error;
    }
};
