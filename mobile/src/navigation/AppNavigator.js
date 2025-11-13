import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChildrenScreen from '../screens/ChildrenScreen';
import AddChildScreen from '../screens/AddChildScreen';
import SongGeneratorScreen from '../screens/SongGeneratorScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SongDetailScreen from '../screens/SongDetailScreen';

import { getCurrentUser, loginUser } from '../redux/slices/authSlice';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Generate') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Children') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Library' }} />
      <Tab.Screen
        name="Generate"
        component={SongGeneratorScreen}
        options={{
          title: 'Create',
          tabBarIconStyle: { marginTop: -5 },
        }}
      />
      <Tab.Screen name="Children" component={ChildrenScreen} options={{ title: 'Children' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);

  useEffect(() => {
    // Check if first launch
    async function checkFirstLaunch() {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
    }

    checkFirstLaunch();

    // Auto-login or restore session
    async function initAuth() {
      // Check for existing token first
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // User already logged in, restore session
        dispatch(getCurrentUser());
        setAutoLoginAttempted(true);
        return;
      }

      // Try auto-login with env credentials
      const autoEmail = process.env.EXPO_PUBLIC_AUTO_LOGIN_EMAIL;
      const autoPassword = process.env.EXPO_PUBLIC_AUTO_LOGIN_PASSWORD;

      if (autoEmail && autoPassword && autoEmail.trim() && autoPassword.trim()) {
        try {
          await dispatch(loginUser({
            email: autoEmail.trim(),
            password: autoPassword.trim()
          })).unwrap();
          console.log('Auto-login successful');
        } catch (error) {
          console.log('Auto-login failed:', error.message);
        }
      }
      setAutoLoginAttempted(true);
    }

    initAuth();
  }, [dispatch]);

  if (isFirstLaunch === null || loading || !autoLoginAttempted) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AddChild" component={AddChildScreen} />
            <Stack.Screen name="SongDetail" component={SongDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
