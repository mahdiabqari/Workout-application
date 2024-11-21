import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FitnessPro!</Text>
      <Text style={styles.subtitle}>Stay consistent and achieve your goals.</Text>
      <View style={styles.stats}>
        <Text style={styles.statsText}>Today's Progress:</Text>
        <Text style={styles.statsValue}>5 Workouts Completed</Text>
      </View>
      <Button title="Start a Quick Workout" onPress={() => {}} color="#61dafb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#61dafb',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  stats: {
    marginVertical: 20,
    alignItems: 'center',
  },
  statsText: {
    color: '#ffffff',
    fontSize: 18,
  },
  statsValue: {
    color: '#61dafb',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
