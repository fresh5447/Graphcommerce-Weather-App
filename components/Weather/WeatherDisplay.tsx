import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterIcon from '@mui/icons-material/Water';
import AirIcon from '@mui/icons-material/Air';

interface WeatherDisplayProps {
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

export function WeatherDisplay({ lat, lon, timezone, current, timestamp }: WeatherDisplayProps) {
  return (
    <Box sx={{ width: '40%', mx: 'auto', mt: 4, p: 2, borderRadius: '4px' }}>
      <Typography variant="h5" gutterBottom align="center">
        Weather for Lattitude {lat} Longitude {lon} ({timezone})
      </Typography>
      <Typography variant="subtitle2" gutterBottom align="center" sx={{ fontStyle: 'italic' }}>
        Last updated: {timestamp.date} {timestamp.time}
      </Typography>
      <List component="nav" aria-label="weather details">
        <ListItem>
          <ListItemIcon>
            <WbSunnyIcon />
          </ListItemIcon>
          <ListItemText primary={`Temperature: ${current.temp}°F`} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <WaterIcon />
          </ListItemIcon>
          <ListItemText primary={`Humidity: ${current.humidity}%`} />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <AirIcon />
          </ListItemIcon>
          <ListItemText primary={`Wind Speed: ${current.windSpeed} m/s`} />
        </ListItem>
      </List>
    </Box>
  );
}