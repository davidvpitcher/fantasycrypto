import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();

  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleSignup = async () => {
    try {
      if(password !== confirmPassword){
    
        console.log("Passwords do not match!");
        return;
      }

      let formData = new FormData();
      formData.append('uid', username);
      formData.append('pwd', password);
      formData.append('pwdrepeat', confirmPassword);

      const signupResponse = await axios({
        method: 'post',
        url: 'https://www.mortalitycore.com/includes/reactsignup.inc.php',
        data: formData,
        headers: {'Content-Type': 'multipart/form-data' }
      });
  
      if (signupResponse.data.success === 'User created') {

       
        const loginResponse = await axios.post('https://www.mortalitycore.com/api/v1/reactlogin.php', {
          username: username,
          password: password
        });
  
        if (loginResponse.data.status === 'success') {
          
  
          await AsyncStorage.setItem('jwt', loginResponse.data.jwt);
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('userId', loginResponse.data.userId.toString());
          navigation.navigate('Fantasy Crypto');
        }else {
     
 
          console.log(loginResponse.data.error);
        }
  
      } else {
   

        console.log(signupResponse.data.error);
      }
  
    } catch (error) {
      console.error(error);
    }
  }
  

  return (
    <View style={styles.container}>
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
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current.focus()}
      />
      <TextInput
        ref={confirmPasswordRef}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleSignup}
      />
      <Button title="Signup" onPress={handleSignup} />
    </View>
  );
}

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
});
