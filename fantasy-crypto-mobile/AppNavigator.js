import React from 'react'; // AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CryptoScreen from './screens/CryptoScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Fantasy Crypto Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Fantasy Crypto" component={CryptoScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
