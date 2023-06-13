import React, { useState, useEffect } from 'react';
import { account } from '../services/appwrite-service';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, View, Icon, useToast, Box, Text, HStack, Spinner, Heading, Pressable } from 'native-base';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import WorkoutTrackerComponent from './HomeScreenTabs/WorkoutTrackerTab';
import MealTrackerComponent from './HomeScreenTabs/MealTrackerTab'
import { ScreenRoutes } from '../constants';
import { Platform, StatusBar } from 'react-native';

const Tab = createBottomTabNavigator();

const HomeScreen = ( { navigation } ) =>
{

  const toast = useToast();
  const [user, setUser] = useState( null );
  const [loading, setLoading] = useState( true ); // Added loading state

  useEffect( () =>
  {
    ( async () =>
    {
      try
      {
        const data = await account.get();
        if ( data )
        {
          toast.show( {
            title: "Login Successfull",
            variant: "solid",
            description: "Welcome back"
          } )
          setUser( { ...data } );
        }
      }
      catch ( error )
      {
        toast.show( {
          title: "No user found!",
          variant: "subtle",
        } )
        navigation.reset( {
          index: 0,
          routes: [{ name: ScreenRoutes.Login }],
        } );

      } finally
      {
        setLoading( false );
      }
    } )();

  }, [] )

  useEffect( () =>
  {
  }, [user] );

  const handleLogout = async () =>
  {
    try
    {
      await account.deleteSession( "current" );
      toast.show( {
        title: "Logout Successfull",
        variant: "solid",
        description: "See you soon"
      } )
      navigation.reset( {
        index: 0,
        routes: [{ name: ScreenRoutes.Login }]
      } )
    } catch ( error )
    {
      toast.show( {
        title: "Error while logging out",
        variant: "subtle",
        description: error.message
      } )
    }
  }

  return ( user && !loading ) ? (
    <View flex={1} >

      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="black"
        borderBottomRadius={10}
        pt={Platform.OS === 'android' ? StatusBar.currentHeight : 0}
      >
        <Pressable
          onPress={() => { navigation.navigate( ScreenRoutes.Profile, { userId: user.$id } ) }}
          borderRadius="full"
          width={10}
          height={10}
          marginLeft={4}
          bg={"white"}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="black" fontSize="md" fontWeight="bold">
            {user.name[0]}
          </Text>
        </Pressable>


        <Box flexDirection="row">
          <Button
            onPress={() => navigation.navigate( ScreenRoutes.History, { userId: user.$id } )}
            borderRadius="full"
            size="lg"
            style={{
              backgroundColor: "transparent"
            }}
          >
            <Icon as={MaterialIcons} name="history" color="white" size={5} />
          </Button>


          <Button
            onPress={handleLogout}
            borderRadius="full"
            size="lg"
            mr={4}
            p={5}
            style={{
              backgroundColor: "transparent"
            }}
          >
            <Icon as={MaterialIcons} name="logout" color="white" size={5} />
          </Button>
        </Box>
      </Box>


      <Tab.Navigator
        screenOptions={{
          headerShown: false
        }}>
        <Tab.Screen
          name="Workout"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ( { color, size } ) => (
              <Icon as={MaterialCommunityIcons} name="weight-lifter" color={color} size={size} />
            ),
            title: '',
          }}
          children={() => <WorkoutTrackerComponent user={user} />} />

        <Tab.Screen
          name="Meal"
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ( { color, size } ) => (
              <Icon as={MaterialCommunityIcons} name="food-apple" color={color} size={size} />
            ),
            title: '',
          }}
          component={MealTrackerComponent} />
      </Tab.Navigator>

    </View>
  ) : (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Box flex={1} justifyContent={"center"} alignItems={"center"} alignSelf={"center"}>
        <Spinner accessibilityLabel="Loading" style={{ margin: 10, padding: 10 }} color="black" />
        <Heading color="black" fontSize="md">
          loading...
        </Heading>
      </Box>
    </View>
  );
}


export default HomeScreen;
