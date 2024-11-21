import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';





const App = () => {
  const [exercises, setExercises] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [newExercise, setNewExercise] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const [showWelcome, setShowWelcome] = useState(true);

  const handleContinue = () => {
    setShowWelcome(false);
  };


  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const storedExercises = await AsyncStorage.getItem('exercises');
    if (storedExercises) {
      setExercises(JSON.parse(storedExercises));
    }
  };

  const saveExercises = async (newExercises) => {
    setExercises(newExercises);
    await AsyncStorage.setItem('exercises', JSON.stringify(newExercises));
  };

  const addExercise = () => {
    if (!newExercise || !newTime || isNaN(newTime)) {
      alert('Invalid Input. Please enter a valid name and time.');
      return;
    }

    const newExerciseObj = {
      id: Date.now().toString(),
      name: newExercise,
      time: parseInt(newTime),
      completed: false,
    };

    const updatedExercises = [...exercises, newExerciseObj];
    saveExercises(updatedExercises);
    setNewExercise('');
    setNewTime('');
    setIsAdding(false);
  };

  const startExercise = (exercise) => {
    setCurrentExercise(exercise);
    setCountdown("Let's Go");
    setIsStarting(true);
  
    let timer = 3; // شمارش معکوس اولیه
    const interval = setInterval(() => {
      if (timer > 0) {
        setCountdown(timer); // نمایش 3-2-1
      } else {
        clearInterval(interval);
        startWorkout(exercise); // شروع ورزش
      }
      timer -= 1;
    }, 1000);
  };
  
  const startWorkout = (exercise) => {
    Animated.timing(progress, {
      toValue: 1,
      duration: exercise.time * 1000,
      useNativeDriver: false,
    }).start();
  
    let remainingTime = exercise.time;
    const interval = setInterval(() => {
      setCountdown(remainingTime); // نمایش زمان باقی‌مانده
      remainingTime -= 1;
  
      if (remainingTime < 0) {
        clearInterval(interval);
        finishExercise(exercise); // اتمام ورزش
      }
    }, 1000);
  };
  
  

  const finishExercise = (exercise) => {
    setIsFinished(true);
    const updatedExercises = exercises.map((ex) =>
      ex.id === exercise.id ? { ...ex, completed: true } : ex
    );
    saveExercises(updatedExercises);
  };

  const deleteExercise = (id) => {
    const updatedExercises = exercises.filter((exercise) => exercise.id !== id);
    saveExercises(updatedExercises);
  };

  const renderExercise = ({ item }) => (
    <View
      style={[
        styles.exerciseCard,
        item.completed && styles.exerciseCompleted,
      ]}
    >
      <Text style={styles.exerciseText}>{item.name}</Text>
      <Text style={styles.exerciseTime}>{item.time} seconds</Text>
      <View style={styles.buttonsContainer}>
        {!item.completed && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => startExercise(item)}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteExercise(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <View style={styles.container}>
        <Text style={styles.header}>Daily Workout</Text>
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(true)}
        >
          <Text style={styles.buttonText}>Add New Exercise</Text>
        </TouchableOpacity>

      {/* Add Exercise Modal */}
      <Modal visible={isAdding} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TextInput
              style={styles.input}
              placeholder="Exercise Name"
              value={newExercise}
              onChangeText={setNewExercise}
            />
            <TextInput
              style={styles.input}
              placeholder="Time (in seconds)"
              keyboardType="numeric"
              value={newTime}
              onChangeText={setNewTime}
            />
            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addExercise}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAdding(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Start Exercise Modal */}
      <Modal visible={isStarting} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            {currentExercise && (
              <Text style={styles.exerciseText}>{currentExercise.name}</Text>
            )}
            <Text style={styles.modalTitle}>
              {countdown === "Let's Go" ? "Let's Go!" : countdown}
            </Text>
            {countdown === "Let's Go" && (
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsStarting(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            {typeof countdown === "number" && (
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            )}
          </View>
        </View>
      </Modal>


      {/* Finish Exercise Modal */}
      <Modal visible={isFinished} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.exerciseText}>
              You completed {currentExercise?.name}!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setIsStarting(false);
                setIsFinished(false);
              }}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101022',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#101022',
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#00e6ff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#007acc',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#b3b3b3',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
    fontFamily: 'Roboto',
  },
  continueButton: {
    backgroundColor: '#00e6ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00e6ff',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: '#0099cc',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  exerciseCard: {
    backgroundColor: 'rgba(46, 46, 72, 0.9)', // افزایش شفافیت برای تاکید بیشتر
    padding: 25,
    marginVertical: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00d4ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    marginHorizontal: 15, // فاصله بیشتر از لبه‌ها
  },
  exerciseCompleted: {
    backgroundColor: 'rgba(1, 121, 111, 1)',
    borderWidth: 3,
    borderColor: '#00e6ff',
  },
  exerciseText: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#0066cc',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  exerciseTime: {
    fontSize: 20,
    color: '#b3b3b3',
    fontFamily: 'Roboto',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginHorizontal: 10,
  },
  startButton: {
    backgroundColor: '#00e6ff',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: '#ff3333',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  addButton: {
    backgroundColor: '#00e6ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#00cce6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // تغییر رنگ زمینه برای ایجاد تمرکز بیشتر
  },
  modalContent: {
    backgroundColor: 'rgba(46, 46, 72, 0.95)', 
    padding: 35,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 28,
    color: '#00e6ff',
    marginBottom: 25,
    fontWeight: 'bold',
    letterSpacing: 1.8,
    textShadowColor: '#0099cc',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  input: {
    backgroundColor: '#181828',
    color: '#ffffff',
    padding: 18,
    marginVertical: 12,
    borderRadius: 15,
    width: 260,
    borderWidth: 2,
    borderColor: '#00d4ff',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    fontSize: 22,
  },
  modalButton: {
    backgroundColor: '#00e6ff',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#00e6ff',
    borderRadius: 8,
    marginTop: 30,
    width: '60%', // درصد پیشرفت به صورت متغیر
    shadowColor: '#00e6ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
});





export default App;
