import type { NextApiRequest, NextApiResponse } from 'next';

interface CurrentWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
}

interface OpenWeatherResponse {
  lat: string | string[];
  lon: string | string[];
  timezone: string;
  current: CurrentWeather;
  timestamp: {
    time: string;
    date: string;
  }
}

interface ErrorResponse {
  message: string;
}


const getTimestamp = () => {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = now.toLocaleDateString('en-US');
  return {time: timeFormatted, date: dateFormatted}
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OpenWeatherResponse | ErrorResponse>
) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';

  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      throw new Error('Latitude and Longitude are required!')
    }

    const url = `${baseUrl}?lat=${lat}&lon=${lon}&exclude=hourly,daily&units=imperial&appid=${apiKey}`;
    const externalResponse = await fetch(url);

    const data = await externalResponse.json();

    if (!externalResponse.ok) {
      throw new Error(data.error || 'Failed to fetch weather data');
    }

    const { timezone, current } = data;
    const { temp, humidity, wind_speed: windSpeed } = current;
  
    const response: OpenWeatherResponse  = {
      lat,
      lon,
      timezone,
      timestamp: getTimestamp(),
      current: {
        temp,
        humidity,
        windSpeed,
      },
    };

    res.status(200).json(response);

  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ message: errorMessage, });
  }
}


