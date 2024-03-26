import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NearbyDestinationsScreen from './DestinationListScreens/DestinationList'; 
import SelectStartLocationScreen from './FinalizeGameScreens/StartLocationSetting';
import StartGameScreen from './FinalizeGameScreens/StartGameUI';
import GameMapScreen from './MainGameScreens/MainGameUI';
import LocationSelectionScreen from './InitialLocationRangeSelectionScreens/LocationSelection';
import RadiusSetScreen from './InitialLocationRangeSelectionScreens/RadiusSet';
import SearchInitialLocationScreen from './InitialLocationRangeSelectionScreens/SearchInitialLocation';
const Stack = createStackNavigator();

/**
 * Component defining the navigation stack for the game screens.
 * @returns {JSX.Element} - JSX element representing the GameNavigation component.
 */
function GameNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LocationSelectionScreen"
        component={LocationSelectionScreen}
        options={{ 
          headerShown: false, 
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen
        name="RadiusSetScreen"
        component={RadiusSetScreen}
        options={{ 
          headerShown: false, 
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen
        name="SearchLocation"
        component={SearchInitialLocationScreen}
        options={{ 
          headerShown: false, 
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen
        name="NearbyDestinations"
        component={NearbyDestinationsScreen}
        options={{
          headerShown: false, 
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SelectStartLocationScreen"
        component={SelectStartLocationScreen}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen
        name="StartGameScreen"
        component={StartGameScreen}
        options={{ 
          headerShown: false, 
          gestureEnabled: false 
        }}
      />
      <Stack.Screen
        name="GameMapScreen"
        component={GameMapScreen}
        options={{ 
          headerShown: false, 
          gestureEnabled: false 
        }}
      />
    </Stack.Navigator>
  );
}

export default GameNavigation;
