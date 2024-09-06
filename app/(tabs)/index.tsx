import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput } from 'react-native';
import axios from 'axios';
import Map from '../comps/Home/map'; // Adjust path as needed
import { useThemeColor } from '@/hooks/useThemeColor'; // Adjust path as needed

// Define types for the event data
interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  labels?: string[];
  start: string;
  end: string;
  geo?: {
    geometry?: {
      coordinates?: [number, number];
    };
    address?: {
      city?: string; // Add city
      district?: string; // Add district
      country_code?: string;
    };
  };
  timezone?: string;
  state?: string;
}

// Replace 'YOUR_API_KEY' with your actual PredictHQ API key
const API_KEY = 'ZL1n24qkOLnDFk1ORHSOu2dMNvPOX7MaXYVXWUeD'; // Hardcoded API key
const BASE_URL = 'https://api.predicthq.com/v1';

const Index: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null); // For pagination
  const [location, setLocation] = useState<string>(''); // Location input
  const [query, setQuery] = useState<string>(''); // Input for fetching events

  // Use theme colors
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#000000' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');


  // Function to fetch events
  const fetchEvents = async (url: string) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      // Filter out duplicate events and events not in the 'disasters' category
      setEvents(prevEvents => [
        ...prevEvents,
        ...response.data.results.filter((event: Event) =>
          !prevEvents.some(e => e.id === event.id) &&
          event.category === 'disasters'
        )
      ]);

      setNextUrl(response.data.next || null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch events based on location
  const fetchAllEvents = async () => {
    if (!query) return;

    setLoading(true); // Set loading to true when starting a new fetch
    setEvents([]); // Clear existing events

    let url = `${BASE_URL}/events?q=${encodeURIComponent(query)}&limit=10&sort=start&category=disasters`;
    while (url) {
      await fetchEvents(url);
      url = nextUrl || ""; // Update URL for the next page
    }
  };

  useEffect(() => {
    if (query) {
      fetchAllEvents();
    }
  }, [query]);

  const handleSearch = () => {
    setQuery(location); // Set query to trigger data fetch
  };

  const loadMoreEvents = () => {
    if (nextUrl) {
      setLoading(true);
      fetchEvents(nextUrl);
    }
  };

  if (loading && !events.length) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.input,
            { borderColor: textColor, color: textColor } // Apply text color and border color based on theme
          ]}
          placeholder="Enter location (e.g., Mumbai, India)"
          placeholderTextColor={textColor} // Apply placeholder color based on theme
          value={location}
          onChangeText={setLocation}
        />
       <Button title="Search" onPress={handleSearch} />
      </View>


      {events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.event, { backgroundColor: textColor }]}>
              <Text style={{ color: backgroundColor }}>{item.title}</Text>
              <Text style={{ color: backgroundColor }}>Date: {item.start}</Text>
              <Text style={{ color: backgroundColor }}>Category: {item.category || 'Not available'}</Text>
              {item.labels && item.labels.length > 0 && (
                <Text style={{ color: backgroundColor }}>Labels: {item.labels.join(', ')}</Text>
              )}
              {item.geo?.address?.city || item.geo?.address?.district ? (
                <Text style={{ color: backgroundColor }}>Location: {item.geo.address.city || item.geo.address.district}</Text>
              ) : (
                <Text style={{ color: backgroundColor }}>Location: Not available</Text>
              )}
              {item.timezone && <Text style={{ color: backgroundColor }}>Timezone: {item.timezone}</Text>}
              {item.state && <Text style={{ color: backgroundColor }}>Status: {item.state}</Text>}
            </View>
          )}
        />
      ) : (
        <Text style={{ color: textColor }}>No events found.</Text>
      )}
      {nextUrl && events.length >= 10 && (
        <Button title="Load More" onPress={loadMoreEvents} />
      )}

      <Map />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  event: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
});

export default Index;
