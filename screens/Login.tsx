import React, { useState, useEffect } from 'react';
import { Input, Stack, Button, Text, useToast } from 'native-base';
import { account } from '../services/appwrite-service';
import { ScreenRoutes } from '../constants';
import { logger } from "react-native-logs";
import { IsValidInput } from '../shared'

const LoginScreen = ( { navigation } ) =>
{

  const toast = useToast();
  var log = logger.createLogger();

  useEffect( () =>
  {
    const data = account.get();

    if ( data )
    {
      data.then(
        () =>
        {
          toast.show( {
            title: "Login Successful",
            variant: "solid",
            description: "Welcome back"
          } )
          navigation.reset( {
            index: 0,
            routes: [{ name: ScreenRoutes.Home }]
          } )
        },
        ( error ) =>
        {
          console.error( error );
        }
      )
    } else
    {
      console.log( "Login Failed" );
    }

  }, [] )

  const [user, setUser] = useState( {
    Email: '',
    Password: ''
  } );

  const handleLogin = async ( e ) =>
  {
    var field = IsValidInput( user );

    if ( field !== "" )
    {
      toast.show( {
        variant: "subtle",
        description: "Invalid Field " + field,
        duration: 3000
      } )
      return;
    }

    e.preventDefault();

    try
    {
      await account.createEmailSession( user.Email, user.Password );
      setUser( { Email: '', Password: '' } )

      toast.show( {
        title: "Login Successful",
        variant: "solid",
        description: "Welcome back"
      } )

      navigation.reset( {
        index: 0,
        routes: [{ name: ScreenRoutes.Home }]
      } )

    } catch ( error )
    {
      toast.show( {
        title: "Login Failed",
        variant: "subtle",
      } )
      console.error( error );
    }

  };

  return (
    <Stack space={4} w="100%" maxW="300px" mx="auto" my="auto">
      <Input mx="3" placeholder="Email" w="100%" value={user.Email} onChangeText={( val ) => setUser( { ...user, Email: val } )} />
      <Input mx="3" placeholder="Password" w="100%" value={user.Password} onChangeText={( val ) => setUser( { ...user, Password: val } )} secureTextEntry />
      <Button mx="3" w="100%" rounded="full" onPress={handleLogin}><Text>Login</Text></Button>
      <Text mx="3">New User?</Text>
      <Button mx="3" w="100%" rounded="full" onPress={() => navigation.navigate( ScreenRoutes.SignUp )}><Text>SignUp</Text></Button>
    </Stack>
  );
};

export default LoginScreen;
