import * as React from 'react';
import MainContainer from './screens/MainContainer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/CustomComponents/Splash';
import LogInNavigation from './screens/LoginReg/LogInNavigator';

const Stack = createNativeStackNavigator();

function App(){
  return(
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false, gestureEnabled: false, }} 
            />
            <Stack.Screen
              name="LogInNav"
              component={LogInNavigation}
              options={{ headerShown: false, gestureEnabled: false }} 
            />
            <Stack.Screen
              name="Main"
              component={MainContainer}
              options={{ headerShown: false, gestureEnabled: false }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
    //<MainContainer/>
  )
}

export default App;




