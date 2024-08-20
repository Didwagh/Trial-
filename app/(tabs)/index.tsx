import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput } from 'react-native';
import axios from 'axios';

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

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null); // For pagination
  const [location, setLocation] = useState<string>(''); // Location input
  const [query, setQuery] = useState<string>(''); // Input for fetching events

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
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter location (e.g., Mumbai, India)"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Search" onPress={handleSearch} />
      
      {events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.event}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>Date: {item.start}</Text>
              <Text>Category: {item.category || 'Not available'}</Text>
              {item.labels && item.labels.length > 0 && (
                <Text>Labels: {item.labels.join(', ')}</Text>
              )}
              {item.geo?.address?.city || item.geo?.address?.district ? (
                <Text>Location: {item.geo.address.city || item.geo.address.district}</Text>
              ) : (
                <Text>Location: Not available</Text>
              )}
              {item.timezone && <Text>Timezone: {item.timezone}</Text>}
              {item.state && <Text>Status: {item.state}</Text>}
            </View>
          )}
        />
      ) : (
        <Text>No events found.</Text>
      )}
      {nextUrl && events.length >= 10 && (
        <Button title="Load More" onPress={loadMoreEvents} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
});

export default App;
