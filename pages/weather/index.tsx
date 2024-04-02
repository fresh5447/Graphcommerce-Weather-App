import { useState, useEffect } from 'react';
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { PageOptions } from '@graphcommerce/framer-next-pages'
import {CircularProgress, Typography, Box} from '@mui/material';

import {
  GetStaticProps,
  PageMeta,
  LayoutTitle,
  LayoutOverlayHeader,
} from '@graphcommerce/next-ui'

import {
  LayoutDocument,
  LayoutNavigation,
  LayoutNavigationProps,
  WeatherDisplay
} from '../../components'

import {
  graphqlSsrClient,
  graphqlSharedClient,
} from '../../lib/graphql/graphqlSsrClient'

interface WeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timestamp: {
    time: number;
    date: number;
  };
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
  };
}

interface CoordsPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

type Props = Record<string, unknown>
type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, Props>

function Weather() {
  
  const title = 'Otter Weather App'
  const [weatherData, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchWeather() {
      let latitude = 39.099724; // Kansas City latitude as fallback
      let longitude = -94.578331; // Kansas City longitude as fallback
  
      try {
        const getPosition = () => new Promise<CoordsPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (error) {
        console.log('Using fallback location: Kansas City, MO, USA');
      }
  
      try {
        const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
        if (!res.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await res.json();
        setWeather(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
  
    fetchWeather();
  }, []);

  if (error) return (
    <Typography variant="h5" align="center" marginTop={10}>
      Error: {error}
    </Typography>
    )

  if (!weatherData || !weatherData.lat || !weatherData.lon || !weatherData.timezone || !weatherData.current || !weatherData.timestamp) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
  }
  return (
    <>
      <LayoutOverlayHeader>
        <LayoutTitle size='small' component='span'>
          Current Weather
        </LayoutTitle>
      </LayoutOverlayHeader>
      <PageMeta title='Current Weather' />
      <WeatherDisplay {...weatherData} />
    </>
  );
};

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}

Weather.pageOptions = pageOptions

export default Weather

export const getStaticProps: GetPageStaticProps = async ({ locale }) => {
  const client = graphqlSharedClient(locale)
  const staticClient = graphqlSsrClient(locale)

  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: 'cache-first',
  })

  return {
    props: {
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}