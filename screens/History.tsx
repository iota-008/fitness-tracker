import React, { useEffect, useState } from 'react';
import { } from 'react-native';
import { appDatabase } from '../services/appwrite-service';
import { DbConstants } from '../constants';
import { Query } from 'appwrite';
import { DeleteDocumentFields } from '../shared';
import { Text, View, Container, List, Accordion, Box, VStack, Icon, FlatList, HStack, IconButton, Spinner, Heading } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Table, Row, Rows } from 'react-native-table-component';

const WorkoutHistoryPage = ( { route } ) =>
{
    const [workouts, setWorkouts] = useState( [] );
    const [dates, setDates] = useState( [] );
    const [loader, setLoader] = useState( false );

    useEffect( () =>
    {
        // Fetch the user's workout history data
        // Update the `workoutHistory` state with the fetched data

        ( async () =>
        {
            setLoader( true );
            try
            {
                const todaysWorkouts = await appDatabase.listDocuments(
                    DbConstants.WorkoutTrackerDatabaseId,
                    DbConstants.UserWorkoutsCollectionId,
                    [
                        Query.equal( 'UserId', route.params.userId ),
                        Query.orderDesc( '$createdAt' ),
                    ]
                );
                let documents = todaysWorkouts.documents;

                setWorkouts( [] );
                setDates( [] );

                const datesList = [], workoutsList = [];

                await Promise.all(
                    documents.map( async ( day ) =>
                    {
                        datesList.push( day )
                        await Promise.all(
                            day.WorkoutIds.map( async ( id ) =>
                            {
                                try
                                {
                                    const response = await appDatabase.getDocument(
                                        DbConstants.WorkoutTrackerDatabaseId,
                                        DbConstants.WorkoutDetailsCollectionId,
                                        id
                                    );
                                    let result = DeleteDocumentFields( response );
                                    workoutsList.push( result );
                                } catch ( error )
                                {
                                    console.error( error );
                                }
                            } )
                        );
                    } )
                );

                setDates( datesList )
                setWorkouts( workoutsList )

            } catch ( exception )
            {
                console.error( exception );

            } finally
            {
                setLoader( false );
            }

        } )();


    }, [] );


    const renderWorkouts = () =>
    {
        return <FlatList
            data={workouts}
            keyExtractor={( item, index ) => index.toString()}
            renderItem={( { item } ) => (
                <Box borderBottomWidth={1} _dark={{ borderColor: 'muted.50' }} borderColor="muted.800" pl={['0', '4']} pr={['0', '5']} py="2">
                    <HStack space={[2, 3]} justifyContent="space-between" margin={2}>
                        <Text _dark={{ color: 'warmGray.50' }} color="coolGray.800" bold>
                            {item.Name}
                        </Text>
                        <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }}>
                            {item.Duration} min
                        </Text>
                        <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }}>
                            {item.CaloriesBurned} cal
                        </Text>
                    </HStack>

                    <Accordion allowMultiple w="100%" mb={2} bg="white" borderRadius={5} borderWidth={1} overflow="hidden">
                        <Accordion.Item>
                            <Accordion.Summary _expanded={{ backgroundColor: 'muted.200' }} _hover={{ backgroundColor: 'muted.100' }}>
                                <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }} fontSize={12}>
                                    <Icon as={MaterialIcons} name="expand-more" />
                                </Text>
                            </Accordion.Summary>
                            <Accordion.Details>{renderContent( item )}</Accordion.Details>
                        </Accordion.Item>
                    </Accordion>
                </Box>
            )}
        />
    }

    // Render workouts for each date
    const renderContent = ( item ) =>
    {
        return (
            <VStack space={[2, 3]} justifyContent="space-between" margin={2}>
                <Box>
                    <Box flexDirection="row">
                        <Box flex={1}>
                            <Text fontSize={12} _dark={{ color: 'warmGray.50' }} color="coolGray.800" bold>
                                Reps
                            </Text>
                            {item.Repetitions.map( ( rep, index ) => (
                                <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }} key={index}>{rep}</Text>
                            ) )}
                        </Box>
                        <Box flex={1}>
                            <Text fontSize={12} _dark={{ color: 'warmGray.50' }} color="coolGray.800" bold>
                                Weights (kgs)
                            </Text>
                            {item.Weights.map( ( weight, index ) => (
                                <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }} key={index}>{weight}</Text>
                            ) )}
                        </Box>
                    </Box>
                </Box>
            </VStack>
        );
    };

    return !loader ? (

        <View flex={1} m={5}>
            <FlatList
                data={dates}
                keyExtractor={( item, index ) => index.toString()}
                renderItem={( { item } ) => (
                    <Box borderBottomWidth={1} _dark={{ borderColor: 'muted.50' }} borderColor="muted.800" pl={['0', '4']} pr={['0', '5']} py="2">
                        <HStack space={[2, 3]} justifyContent="space-between" margin={2}>
                            <Text _dark={{ color: 'warmGray.50' }} color="coolGray.800" bold>
                                {item.Date}
                            </Text>
                        </HStack>
                        <Accordion allowMultiple w="100%" mb={2} bg="white" borderRadius={5} borderWidth={1} overflow="hidden">
                            <Accordion.Item>
                                <Accordion.Summary _expanded={{ backgroundColor: 'muted.200' }} _hover={{ backgroundColor: 'muted.100' }}>
                                    <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }} fontSize={12}>
                                        <Icon as={MaterialIcons} name="expand-more" />
                                    </Text>
                                </Accordion.Summary>
                                <Accordion.Details>{renderWorkouts()}</Accordion.Details>
                            </Accordion.Item>
                        </Accordion>
                    </Box>
                )} />
        </View >

    ) :
        (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Box flex={1} justifyContent={"center"} alignItems={"center"} alignSelf={"center"}>
                    <Spinner accessibilityLabel="Loading posts" />
                    <Heading color="primary.500" fontSize="md">
                        Loading
                    </Heading>
                </Box>
            </View>
        );
};

export default WorkoutHistoryPage;