/**
 * DatabaseTestScreen.js
 * Visual test screen for database operations
 * Use this screen to verify all database functionality works correctly
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Database from '../services/database';
import ChildRepository from '../services/database/ChildRepository';
import SongRepository from '../services/database/SongRepository';

const DatabaseTestScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0 });

  const addResult = (testName, passed, details = '') => {
    setTestResults(prev => [
      ...prev,
      {
        name: testName,
        passed,
        details,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    setSummary(prev => ({
      total: prev.total + 1,
      passed: prev.passed + (passed ? 1 : 0),
      failed: prev.failed + (passed ? 0 : 1)
    }));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary({ total: 0, passed: 0, failed: 0 });

    try {
      // Test 1: Database Initialization
      try {
        await Database.initialize();
        const info = Database.getInfo();
        addResult('Database Initialization', true, `Name: ${info.name}, Status: ${info.initialized}`);
      } catch (error) {
        addResult('Database Initialization', false, error.message);
        setIsRunning(false);
        return;
      }

      // Test 2: Create Child
      let testChild;
      try {
        testChild = await ChildRepository.create({
          name: 'Test Child Emma',
          age: 4,
          gender: 'female',
          interests: ['music', 'animals', 'dancing']
        });
        addResult('Create Child', true, `Created: ${testChild.name} (${testChild.id})`);
      } catch (error) {
        addResult('Create Child', false, error.message);
      }

      // Test 3: Find Child by ID
      if (testChild) {
        try {
          const found = await ChildRepository.findById(testChild.id);
          addResult('Find Child by ID', found !== null, `Found: ${found?.name}`);
        } catch (error) {
          addResult('Find Child by ID', false, error.message);
        }
      }

      // Test 4: Find All Children
      try {
        const children = await ChildRepository.findAll();
        addResult('Find All Children', true, `Found ${children.length} children`);
      } catch (error) {
        addResult('Find All Children', false, error.message);
      }

      // Test 5: Update Child
      if (testChild) {
        try {
          const updated = await ChildRepository.update(testChild.id, {
            age: 5,
            interests: ['music', 'animals', 'dancing', 'reading']
          });
          addResult('Update Child', updated.age === 5, `Updated age to ${updated.age}`);
        } catch (error) {
          addResult('Update Child', false, error.message);
        }
      }

      // Test 6: Search Children
      try {
        const results = await ChildRepository.search('Emma');
        addResult('Search Children', results.length > 0, `Found ${results.length} matches`);
      } catch (error) {
        addResult('Search Children', false, error.message);
      }

      // Test 7: Create Song
      let testSong;
      if (testChild) {
        try {
          testSong = await SongRepository.create({
            title: "Emma's Test Lullaby",
            child_ids: [testChild.id],
            category: 'lullaby',
            style: 'gentle',
            lyrics: 'Sleep tight little one, dreams will come...',
            generation_status: 'completed'
          });
          addResult('Create Song', true, `Created: ${testSong.title} (${testSong.id})`);
        } catch (error) {
          addResult('Create Song', false, error.message);
        }
      }

      // Test 8: Find Song by ID
      if (testSong) {
        try {
          const found = await SongRepository.findById(testSong.id);
          addResult('Find Song by ID', found !== null, `Found: ${found?.title}`);
        } catch (error) {
          addResult('Find Song by ID', false, error.message);
        }
      }

      // Test 9: Find Songs by Child ID
      if (testChild && testSong) {
        try {
          const songs = await SongRepository.findByChildId(testChild.id);
          addResult('Find Songs by Child', songs.length > 0, `Found ${songs.length} songs`);
        } catch (error) {
          addResult('Find Songs by Child', false, error.message);
        }
      }

      // Test 10: Toggle Favorite
      if (testSong) {
        try {
          const updated = await SongRepository.toggleFavorite(testSong.id);
          addResult('Toggle Favorite', updated.is_favorite === true, 'Marked as favorite');
        } catch (error) {
          addResult('Toggle Favorite', false, error.message);
        }
      }

      // Test 11: Find Favorites
      try {
        const favorites = await SongRepository.findFavorites();
        addResult('Find Favorites', true, `Found ${favorites.length} favorites`);
      } catch (error) {
        addResult('Find Favorites', false, error.message);
      }

      // Test 12: Mark as Downloaded
      if (testSong) {
        try {
          const updated = await SongRepository.markAsDownloaded(
            testSong.id,
            '/local/path/to/song.mp3',
            '/local/path/to/image.jpg',
            5242880
          );
          addResult('Mark as Downloaded', updated.is_downloaded === true, 'Marked as downloaded');
        } catch (error) {
          addResult('Mark as Downloaded', false, error.message);
        }
      }

      // Test 13: Find Downloaded Songs
      try {
        const downloaded = await SongRepository.findDownloaded();
        addResult('Find Downloaded', true, `Found ${downloaded.length} downloaded songs`);
      } catch (error) {
        addResult('Find Downloaded', false, error.message);
      }

      // Test 14: Increment Play Count
      if (testSong) {
        try {
          const updated = await SongRepository.incrementPlayCount(testSong.id);
          addResult('Increment Play Count', updated.play_count > 0, `Play count: ${updated.play_count}`);
        } catch (error) {
          addResult('Increment Play Count', false, error.message);
        }
      }

      // Test 15: Get Statistics
      try {
        const stats = await SongRepository.getStats();
        addResult('Get Statistics', true, `Total: ${stats.total}, Favorites: ${stats.favorites}`);
      } catch (error) {
        addResult('Get Statistics', false, error.message);
      }

      // Test 16: Search Songs
      try {
        const results = await SongRepository.search('Lullaby');
        addResult('Search Songs', true, `Found ${results.length} matches`);
      } catch (error) {
        addResult('Search Songs', false, error.message);
      }

      // Test 17: Child Count
      try {
        const count = await ChildRepository.count();
        addResult('Child Count', true, `Total children: ${count}`);
      } catch (error) {
        addResult('Child Count', false, error.message);
      }

      // Test 18: Song Count
      try {
        const count = await SongRepository.count();
        addResult('Song Count', true, `Total songs: ${count}`);
      } catch (error) {
        addResult('Song Count', false, error.message);
      }

      // Cleanup: Delete test data
      if (testSong) {
        try {
          await SongRepository.delete(testSong.id);
          addResult('Delete Song', true, 'Song deleted successfully');
        } catch (error) {
          addResult('Delete Song', false, error.message);
        }
      }

      if (testChild) {
        try {
          await ChildRepository.delete(testChild.id);
          addResult('Delete Child', true, 'Child deleted successfully');
        } catch (error) {
          addResult('Delete Child', false, error.message);
        }
      }

    } catch (error) {
      Alert.alert('Test Error', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Database',
      'This will delete ALL data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await Database.reset();
              Alert.alert('Success', 'Database reset complete');
              setTestResults([]);
              setSummary({ total: 0, passed: 0, failed: 0 });
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Test Suite</Text>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{summary.total}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>Passed</Text>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{summary.passed}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: '#F44336' }]}>Failed</Text>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>{summary.failed}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.runButton, isRunning && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Run All Tests</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Reset Database</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      <ScrollView style={styles.results}>
        {testResults.map((result, index) => (
          <View
            key={index}
            style={[
              styles.resultItem,
              result.passed ? styles.resultPass : styles.resultFail
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultName}>
                {result.passed ? '✅' : '❌'} {result.name}
              </Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            {result.details ? (
              <Text style={styles.resultDetails}>{result.details}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2
  },
  runButton: {
    backgroundColor: '#2196F3'
  },
  resetButton: {
    backgroundColor: '#F44336'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  results: {
    flex: 1
  },
  resultItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    borderLeftWidth: 4
  },
  resultPass: {
    borderLeftColor: '#4CAF50'
  },
  resultFail: {
    borderLeftColor: '#F44336'
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
  },
  resultTime: {
    fontSize: 12,
    color: '#999'
  },
  resultDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  }
});

export default DatabaseTestScreen;
