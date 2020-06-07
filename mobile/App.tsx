import React from 'react';
import {  StatusBar } from 'react-native';
import Routes from './src/routes';
import {AppLoading} from 'expo'
import {RobotoSlab_400Regular,RobotoSlab_500Medium} from '@expo-google-fonts/roboto-slab';
import {Ubuntu_500Medium,Ubuntu_700Bold, useFonts} from '@expo-google-fonts/ubuntu'

export default function App() {
  const [fontsLoaded] = useFonts({
    RobotoSlab_400Regular,
    RobotoSlab_500Medium,
    Ubuntu_500Medium,
    Ubuntu_700Bold
  })
  if(!fontsLoaded){
    return <AppLoading/>
  }
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content"/>
      <Routes/>
    </>
  );
}

