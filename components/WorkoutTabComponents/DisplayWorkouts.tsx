import React, { useCallback, useEffect, useState } from 'react';
import { Box, HStack, VStack, Text, FlatList, Accordion, Icon, IconButton, useToast, Container, View, Spinner, Heading } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { appDatabase } from '../../services/appwrite-service';
import { DbConstants } from '../../constants';
import { Query } from 'appwrite';
import { DeleteDocumentFields } from '../../shared';

const DisplayWorkouts = ( { workouts, setWorkouts, user, currentDate } ) =>
{
    const toast = useToast();
    const [loading, setLoading] = useState( false );

    useEffect( () => { }, [workouts] );

    const handleDeleteWorkout = useCallback(
        async ( id ) =>
        {
            try
            {
                setLoading( true );

                // Remove the workout from the list
                setWorkouts( ( prevWorkouts ) =>
                    prevWorkouts.filter( ( workout ) => workout.$id !== id )
                );

                const todaysWorkouts = await appDatabase.listDocuments(
                    DbConstants.WorkoutTrackerDatabaseId,
                    DbConstants.UserWorkoutsCollectionId,
                    [
                        Query.equal( 'UserId', user.$id ),
                        Query.equal( 'Date', currentDate ),
                    ]
                );
                let document = todaysWorkouts.documents[0];

                const updatedDocument = DeleteDocumentFields( document );

                updatedDocument.WorkoutIds = updatedDocument.WorkoutIds.filter(
                    ( workoutId ) => workoutId !== id
                );

                // Update the document in the database
                appDatabase
                    .updateDocument(
                        DbConstants.WorkoutTrackerDatabaseId,
                        DbConstants.UserWorkoutsCollectionId,
                        document.$id,
                        updatedDocument
                    )
                    .then(
                        () =>
                        {
                            toast.show( {
                                title: 'Workout Delete',
                                variant: 'solid',
                            } );
                        },
                        ( error ) =>
                        {
                            console.error( error );
                        }
                    );

                // Delete the workout document
                await appDatabase.deleteDocument(
                    DbConstants.WorkoutTrackerDatabaseId,
                    DbConstants.WorkoutDetailsCollectionId,
                    id
                );
            } catch ( ex )
            {
                console.error( ex );
            } finally
            {
                setLoading( false );
                setTimeout( () =>
                {
                    toast.closeAll();
                }, 1000 )
            }
        },
        [currentDate, setWorkouts, user.$id]
    );

    const renderContent = useCallback( ( item ) =>
    {
        return (
            <VStack space={[2, 3]} justifyContent="space-between" margin={2}>
                <Box>
                    <Box flexDirection="row">
                        <Box flex={1}>
                            <Text
                                fontSize={12}
                                _dark={{ color: 'warmGray.50' }}
                                color="coolGray.800"
                                bold
                            >
                                Reps
                            </Text>
                            {item.Repetitions.map( ( rep, index ) => (
                                <Text color="coolGray.600" key={index}>
                                    {rep}
                                </Text>
                            ) )}
                        </Box>
                        <Box flex={1}>
                            <Text
                                fontSize={12}
                                _dark={{ color: 'warmGray.50' }}
                                color="coolGray.800"
                                bold
                            >
                                Weights (kgs)
                            </Text>
                            {item.Weights.map( ( weight, index ) => (
                                <Text color="coolGray.600" key={index}>
                                    {weight}
                                </Text>
                            ) )}
                        </Box>
                    </Box>
                </Box>
            </VStack>
        );
    }, [] );

    return (
        <View>
            <FlatList
                data={workouts}
                keyExtractor={( item: any ) => item.$id}
                renderItem={( { item } ) => (
                    <Box
                        borderBottomWidth={1}
                        borderColor="muted.800"
                        pl={['0', '4']}
                        pr={['0', '5']}
                        py="2"
                        m="3"
                        backgroundColor={'black'}
                        borderRadius={10}
                    >
                        <HStack
                            space={[2, 3]}
                            justifyContent="space-between"
                            margin={2}
                        >
                            <Text color="white" bold>
                                {item.Name}
                            </Text>
                            <Text color="white">{item.Duration} min</Text>
                            <Text color="white">{item.CaloriesBurned} cal</Text>
                            <IconButton
                                onPress={() => handleDeleteWorkout( item.$id )}
                                icon={<MaterialIcons name="delete-outline" size={20} color="red" />}
                                borderRadius="full"
                                padding={[0]}
                            />
                        </HStack>

                        <Accordion
                            allowMultiple
                            w="95%"
                            ml="2"
                            bg="white"
                            borderRadius={5}
                            borderWidth={1}
                            overflow="hidden"
                        >
                            <Accordion.Item>
                                <Accordion.Summary
                                    _expanded={{ backgroundColor: 'muted.300' }}
                                    _hover={{ backgroundColor: 'muted.100' }}
                                    borderBottomRadius={5}
                                >
                                    <Text color="coolGray.600" fontSize={12}>
                                        <Icon as={MaterialIcons} name="expand-more" />
                                    </Text>
                                </Accordion.Summary>
                                <Accordion.Details>{renderContent( item )}</Accordion.Details>
                            </Accordion.Item>
                        </Accordion>
                    </Box>
                )}
            />

            {loading && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Box flex={1} justifyContent="center" alignItems="center" alignSelf="center" mt={3}>
                        <Spinner accessibilityLabel="deleting" style={{ margin: 10, padding: 10 }} color={'black'} />
                        <Heading color="black" fontSize="md">
                            deleting...
                        </Heading>
                    </Box>
                </View>
            )}
        </View>
    );
};

export default DisplayWorkouts;
