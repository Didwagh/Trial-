import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Map: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Map Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    width: '100%',
    height: '100%',
  },
});

export default Map;
