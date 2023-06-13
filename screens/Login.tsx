import React, { useState, useEffect } from 'react';
import { Input, Stack, Button, Text, useToast, View, Box, Spinner, Heading } from 'native-base';
import { account } from '../services/appwrite-service';
import { ScreenRoutes } from '../constants';
import { IsValidInput } from '../shared'

const LoginScreen = ( { navigation } ) =>
{

  const toast = useToast();
  const [loading, setLodaing] = useState( false );

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
      setLodaing( true );
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

    }
    catch ( error )
    {
      toast.show( {
        title: "Login Failed",
        variant: "subtle",
      } )
      console.error( error );
    }
    finally
    {
      setLodaing( false );
    }

  };

  return !loading ?
    (
      <Stack space={4} w="100%" maxW="300px" mx="auto" my="auto">
        <Input variant={"rounded"} mx="3" placeholder="Email" w="100%" value={user.Email} onChangeText={( val ) => setUser( { ...user, Email: val } )} />
        <Input variant={"rounded"} mx="3" placeholder="Password" w="100%" value={user.Password} onChangeText={( val ) => setUser( { ...user, Password: val } )} secureTextEntry />
        <Button mx="3" w="100%" rounded="full" onPress={handleLogin} backgroundColor={"black"}><Text color={"white"}>Login</Text></Button>
        <Text mx="3">New User?</Text>
        <Button mx="3" w="100%" rounded="full" onPress={() => navigation.navigate( ScreenRoutes.SignUp )} backgroundColor={"white"} borderColor={"black"} borderWidth={1}><Text color={"black"}>SignUp</Text></Button>
      </Stack>
    ) :
    (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Box flex={1} justifyContent={"center"} alignItems={"center"} alignSelf={"center"}>
          <Spinner accessibilityLabel="logging in" style={{ margin: 10, padding: 10 }} color={"black"} />
          <Heading color="black" fontSize="md">
            logging in...
          </Heading>
        </Box>
      </View>
    );
};

export default LoginScreen;
