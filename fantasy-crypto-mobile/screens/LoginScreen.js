import React, { useState, useRef } from 'react'; 
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {

  const [username, setUsername] = useState('tradebot5');
  const [password, setPassword] = useState('tradebot5');
  
  const navigation = useNavigation();

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://www.mortalitycore.com/api/v1/reactlogin.php', {
        username: username,
        password: password
      });

      if (response.data.status === 'success') {
        await AsyncStorage.setItem('jwt', response.data.jwt);
        await AsyncStorage.setItem('username', username); 
        await AsyncStorage.setItem('userId', response.data.userId.toString());
        navigation.navigate('Fantasy Crypto');
      }else {
        // Handle error here
      }

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View>
      <Text>  </Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current.focus()} 
      />
      <TextInput
        ref={passwordRef} 
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Signup" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}

export default LoginScreen;
