import 'react-native-gesture-handler';
import { NativeBaseProvider } from 'native-base'


//navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Screens
import LoginScreen from './screens/Login';
import SignupScreen from './screens/SignUp';
import HomeScreen from './screens/Home';
import WorkoutHistoryScreen from './screens/History';
import UserProfileScreen from './screens/Profile';

const Stack = createNativeStackNavigator();
export default function App()
{
  return (
    <NativeBaseProvider>

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={( { route } ) => ( {
            headerShown: route.name === 'History', // Set headerShown to true only for the "History" screen
          } )} >
          <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Signup' component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name='History' component={WorkoutHistoryScreen} />
          <Stack.Screen name='Profile' component={UserProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}