import React, { useState, useEffect } from 'react';
import { Text, Input, Stack, Button, useToast, View, Box, Spinner, Heading } from 'native-base';
import { account, appDatabase } from '../services/appwrite-service';
import 'react-native-get-random-values';
import { ScreenRoutes, DbConstants } from '../constants';
import { ID } from 'appwrite'
import { IsValidInput } from '../shared/index';


const SignupScreen = ( { navigation } ) =>
{

  const toast = useToast();
  const [userId, setUserId] = useState( '' );
  const [loading, setLoading] = useState( false );

  useEffect( () =>
  {
    setUserId( ID.unique() );
  }, [] )


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
          } )

          navigation.reset( {
            index: 0,
            routes: [{ name: ScreenRoutes.Home }]
          } )
        },
        ( error ) =>
        {
          console.error( error )
        }
      )
    } else
    {
      console.log( "No user found" )
    }

  }, [] )


  const [user, setUser] = useState( {
    Name: '',
    Email: '',
    Password: '',
    Height: '',
    Weight: '',
    Mobile: '',
    UserId: userId
  } );

  const trimValues = ( userDetails: any ) =>
  {
    Object.keys( userDetails ).forEach( k => userDetails[k] = userDetails[k].trim() );
  }

  const handleSignup = ( e: any ) =>
  {
    if ( !IsValidInput( user ) )
    {
      toast.show( {
        variant: "subtle",
        description: `Invalid {key}`
      } )
      return;
    }

    e.preventDefault();
    try
    {
      setLoading( true )
      account.create( userId, user.Email, user.Password, user.Name )
        .then(
          () =>
          {
            delete user.Password;
            user.UserId = userId;
            trimValues( user );
            appDatabase.createDocument( DbConstants.WorkoutTrackerDatabaseId, DbConstants.UsersCollectionId, ID.unique(), user )
              .then(
                async () =>
                {
                  toast.show( {
                    title: "User Created!",
                    variant: "solid",
                    description: "Please SignIn"
                  } )
                },
                async () =>
                {
                  toast.show( {
                    title: "Failed to save user!",
                    variant: "subtle",
                  } )
                }
              );

            navigation.reset( {
              index: 0,
              routes: [{ name: ScreenRoutes.Login }]
            } )
          },
          () =>
          {
            toast.show( {
              title: "Failed to create user!",
              variant: "subtle",
            } )
          }

        );

    }
    catch ( error )
    {
      console.error( error );
    }
    finally
    {
      setLoading( false );
      setUser( { Name: '', Email: '', Password: '', Height: '', Weight: '', Mobile: '', UserId: '' } )
    }

  };

  return !loading ?
    (

      <Stack space={4} w="100%" maxW="300px" mx="auto" my="auto">
        <Input variant={"rounded"} mx="3" placeholder="Name" w="100%" value={user.Name} onChangeText={( val ) => setUser( { ...user, Name: val } )} />
        <Input variant={"rounded"} mx="3" placeholder="Email" w="100%" value={user.Email} onChangeText={( val ) => setUser( { ...user, Email: val } )} />
        <Input variant={"rounded"} mx="3" placeholder="Height(cm)" w="100%" value={user.Height} onChangeText={( val ) => setUser( { ...user, Height: val } )} />
        <Input variant={"rounded"} mx="3" placeholder="Weight(kg)" w="100%" value={user.Weight} onChangeText={( val ) => setUser( { ...user, Weight: val } )} />
        <Input variant={"rounded"} mx="3" placeholder="Mobile" w="100%" value={user.Mobile} onChangeText={( val ) => setUser( { ...user, Mobile: val } )} />
        <Input variant={"rounded"} mx="3" placeholder="Password" w="100%" value={user.Password} onChangeText={( val ) => setUser( { ...user, Password: val } )} secureTextEntry />
        <Button mx="3" w="100%" rounded="full" onPress={handleSignup} backgroundColor={"black"}><Text color={"white"}>SignUp</Text></Button>
        <Text mx="3">Already a User?</Text>
        <Button mx="3" w="100%" rounded="full" onPress={() => navigation.navigate( ScreenRoutes.Login )} backgroundColor={"white"} borderColor={"black"} borderWidth={1}><Text color={"black"}>Login</Text></Button>
      </Stack>
    ) :
    (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Box flex={1} justifyContent={"center"} alignItems={"center"} alignSelf={"center"}>
          <Spinner accessibilityLabel="creating account" style={{ margin: 10, padding: 10 }} color={"black"} />
          <Heading color="black" fontSize="md">
            creating account...
          </Heading>
        </Box>
      </View>
    );
};

export default SignupScreen;
