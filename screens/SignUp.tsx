import React, { useState, useEffect } from 'react';
import { Text, Input, Stack, Button, useToast, View, Box, Spinner, Heading, Radio, VStack, HStack, KeyboardAvoidingView } from 'native-base';
import { account, appDatabase } from '../services/appwrite-service';
import 'react-native-get-random-values';
import { ScreenRoutes, DbConstants } from '../constants';
import { ID } from 'appwrite'
import { IsValidInput } from '../shared/index';
import { ScrollView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';

const SignupScreen = ( { navigation } ) =>
{

  const toast = useToast();
  const [userId, setUserId] = useState( null );
  const [loading, setLoading] = useState( false );

  useEffect( () =>
  {
    const id = uuid.v4();
    setUserId( id.toString() );
  }, [] )


  useEffect( () =>
  {
    try
    {
      const data = account.get();
      if ( data )
      {
        data.then(
          () =>
          {
            // toast.show( {
            //   title: "Login Successfull",
            //   variant: "solid",
            // } )

            navigation.reset( {
              index: 0,
              routes: [{ name: ScreenRoutes.Home }]
            } )
          },
          ( error ) =>
          {
            // console.error( error )
          }
        )
      } else
      {
        console.error( "No user found" )
      }
    } catch ( ex )
    {
      console.error( ex );
    } finally
    {
      setTimeout( () =>
      {
        toast.closeAll();
      }, 1000 )
    }
  }, [] )


  const [user, setUser] = useState( {
    Name: '',
    Email: '',
    Password: '',
    Height: '',
    Weight: '',
    Mobile: '',
    Age: '',
    Gender: '',
    UserId: userId
  } );

  const trimValues = ( userDetails: any ) =>
  {
    Object.keys( userDetails ).forEach( k => userDetails[k] = userDetails[k].trim() );
  }

  const handleSignup = ( e: any ) =>
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
          ( error ) =>
          {
            console.error( error )
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
      setUser( { Name: '', Email: '', Password: '', Height: '', Weight: '', Mobile: '', UserId: '', Age: '', Gender: '' } )
    }

  };

  return !loading ?
    (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : -200}
        paddingTop={50}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Stack space={4} w="100%" maxW="300px" mx="auto" my="auto" borderWidth={2} borderColor={'white'} padding={5} borderRadius={20} backgroundColor={'white'} alignItems={'center'}>
            <Input key="name" variant={"rounded"} mx="3" placeholder="Name" w="100%" value={user.Name} onChangeText={( val ) => setUser( { ...user, Name: val } )} />
            <Input key="email" variant={"rounded"} mx="3" placeholder="Email" w="100%" value={user.Email} onChangeText={( val ) => setUser( { ...user, Email: val } )} />
            <Input key="age" variant={"rounded"} mx="3" placeholder="Age" w="100%" value={user.Age} onChangeText={( val ) => setUser( { ...user, Age: val } )} />
            {/* <Input variant={"rounded"} mx="3" placeholder="Gender" w="100%" value={user.Gender} onChangeText={( val ) => setUser( { ...user, Gender: val } )} /> */}
            <HStack mx="4" w="100%">
              <Text>Gender</Text>
              <Radio.Group
                size={"sm"}
                name="myRadioGroup"
                value={user.Gender}
                onChange={( nextValue ) =>
                {
                  setUser( ( prevUser ) => ( { ...prevUser, Gender: nextValue } ) );
                }}
              >
                <HStack>
                  <Radio value="MALE" ml="3" size={"sm"}>
                    MALE
                  </Radio>
                  <Radio value="FEMALE" ml="3" size={"sm"}>
                    FEMALE
                  </Radio>
                </HStack>
              </Radio.Group>
            </HStack>

            <Input key="height" variant={"rounded"} mx="3" placeholder="Height(cm)" w="100%" value={user.Height} onChangeText={( val ) => setUser( { ...user, Height: val } )} />
            <Input key="weight" variant={"rounded"} mx="3" placeholder="Weight(kg)" w="100%" value={user.Weight} onChangeText={( val ) => setUser( { ...user, Weight: val } )} />
            <Input key="mobile" variant={"rounded"} mx="3" placeholder="Mobile" w="100%" value={user.Mobile} onChangeText={( val ) => setUser( { ...user, Mobile: val } )} />
            <Input key="password" variant={"rounded"} mx="3" placeholder="Password" w="100%" value={user.Password} onChangeText={( val ) => setUser( { ...user, Password: val } )} secureTextEntry />
            <Button mx="3" w="100%" rounded="full" onPress={handleSignup} backgroundColor={"black"}><Text color={"white"}>SignUp</Text></Button>
            <Text mx="3">Already a User?</Text>
            <Button mx="3" w="100%" rounded="full" onPress={() => navigation.navigate( ScreenRoutes.Login )} backgroundColor={"white"} borderColor={"black"} borderWidth={1}><Text color={"black"}>Login</Text></Button>
          </Stack >
        </ScrollView>
      </KeyboardAvoidingView>
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
