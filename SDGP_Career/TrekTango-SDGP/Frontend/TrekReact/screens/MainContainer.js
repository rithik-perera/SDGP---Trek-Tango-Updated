import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

// Import screens 
import HomeNavigation from './HomeNavigation';
import ImageFeed from './ImageFeed';
import ProfilePage from './ProfilePage';
import GameNavigation from './GameScreens/GameNavigator'; // Import using destructuring

// Screen names
const homeName = 'Home';
const feedName = 'Feed';
const profileName = 'Profile';
const gameName = 'Game';

const Tab = createBottomTabNavigator();

function MainContainer() {
  return (
          <Tab.Navigator
        initialRouteName={homeName}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            let rn = route.name;

            if (rn === homeName) {
                iconName = 'home';
              } 
              else if (rn === gameName) {
                iconName = 'map-marked-alt';
              } else if (rn === feedName) {
                iconName = 'images';
              }  else if (rn === profileName) {
                    iconName = 'user-alt';
            }

            return <FontAwesome5 name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#010C33',
          tabBarInactiveTintColor: 'grey',
          headerShown: false,
          //tabBarShowLabel: false,
        })}
          
      >
        <Tab.Screen name={homeName} component={HomeNavigation} />
        <Tab.Screen name={gameName} component={GameNavigation} />
        <Tab.Screen name={feedName} component={ImageFeed} />
        <Tab.Screen name={profileName} component={ProfilePage} />
      </Tab.Navigator>
  );
}

export default MainContainer;
