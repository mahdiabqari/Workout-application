import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultWorkouts = [
  { id: '1', name: 'Push-ups' },
  { id: '2', name: 'Squats' },
  { id: '3', name: 'Jumping Jacks' },
  { id: '4', name: 'Lunges' },
  { id: '5', name: 'Plank' },
];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState('');

  // Load workouts from AsyncStorage or use defaults
  useEffect(() => {
    const loadWorkouts = async () => {
      const storedWorkouts = await AsyncStorage.getItem('workouts');
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      } else {
        setWorkouts(defaultWorkouts); // Load default workouts if none are stored
        await AsyncStorage.setItem('workouts', JSON.stringify(defaultWorkouts));
      }
    };
    loadWorkouts();
  }, []);

  // Add new workout
  const addWorkout = async () => {
    if (!newWorkout.trim()) return;

    const updatedWorkouts = [...workouts, { id: Date.now().toString(), name: newWorkout.trim() }];
    setWorkouts(updatedWorkouts);
    setNewWorkout('');
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  // Remove a workout
  const removeWorkout = async (id) => {
    const updatedWorkouts = workouts.filter((workout) => workout.id !== id);
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Workouts</Text>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.workoutCard}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeWorkout(item.id)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Add a new workout"
        placeholderTextColor="#aaa"
        value={newWorkout}
        onChangeText={setNewWorkout}
      />
      <Button title="Add Workout" onPress={addWorkout} color="#61dafb" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#61dafb',
    marginBottom: 20,
  },
  workoutCard: {
    backgroundColor: '#282c34',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    color: '#ffffff',
    fontSize: 18,
  },
  removeButton: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#282c34',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});
