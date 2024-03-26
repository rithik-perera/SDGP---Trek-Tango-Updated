import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen'; // Import HomeScreen component
import ImageFeed from './ImageFeed';
import GameNavigation from './GameScreens/GameNavigator';
import GameMapScreen from './GameScreens/MainGameScreens/MainGameUI';
import LocationSelectionScreen from './GameScreens/InitialLocationRangeSelectionScreens/LocationSelection';

const HomeStack = createNativeStackNavigator();

function HomeNavigation() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Game"
        component={GameNavigation}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="GameMapScreen"
        component={GameMapScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="LocationSelection"
        component={LocationSelectionScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

33







export default HomeNavigation;
