import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { } from 'react-native';
import { appDatabase } from '../services/appwrite-service';
import { DbConstants } from '../constants';
import { Query } from 'appwrite';
import { DeleteDocumentFields } from '../shared';
import { Text, View, Accordion, Box, VStack, Icon, FlatList, HStack, Spinner, Heading } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

const WorkoutHistoryPage = ( { route } ) =>
{
    const [workouts, setWorkouts] = useState( [] );
    const [dates, setDates] = useState( [] );
    const [loader, setLoader] = useState( false );

    const fetchWorkoutHistory = useCallback( async () =>
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

            const datesList = [];
            const workoutsList = [];

            await Promise.all(
                documents.map( async ( day ) =>
                {
                    datesList.push( day );
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

            setDates( datesList );
            setWorkouts( workoutsList );
        } catch ( exception )
        {
            console.error( exception );
        } finally
        {
            setLoader( false );
        }
    }, [route.params.userId] );

    useEffect( () =>
    {
        fetchWorkoutHistory();
    }, [fetchWorkoutHistory] );

    const renderWorkouts = useCallback(
        () => (
            <FlatList
                data={workouts}
                keyExtractor={( item, index ) => index.toString()}
                renderItem={( { item } ) => (
                    <Box
                        borderBottomWidth={1}
                        borderColor="muted.800"
                        pl={['0', '4']}
                        pr={['0', '5']}
                        py="2"
                        mb="1"
                        backgroundColor={"black"} borderRadius={10}
                    >
                        <HStack
                            space={[2, 3]}
                            justifyContent="space-between"
                            margin={2}
                        >
                            <Text
                                color="white"
                                bold
                            >
                                {item.Name}
                            </Text>
                            <Text color="white" >
                                {item.Duration} min
                            </Text>
                            <Text color="white" >
                                {item.CaloriesBurned} cal
                            </Text>
                        </HStack>

                        <Accordion
                            allowMultiple
                            w="95%"
                            ml="2"
                            mb={2}
                            bg="white"
                            borderRadius={5}
                            borderWidth={1}
                            overflow="hidden"
                        >
                            <Accordion.Item>
                                <Accordion.Summary
                                    _expanded={{ backgroundColor: 'muted.200' }}
                                    _hover={{ backgroundColor: 'muted.100' }}
                                >
                                    <Text
                                        color="white"
                                        fontSize={12}
                                    >
                                        <Icon as={MaterialIcons} name="expand-more" />
                                    </Text>
                                </Accordion.Summary>
                                <Accordion.Details>{renderContent( item )}</Accordion.Details>
                            </Accordion.Item>
                        </Accordion>
                    </Box>
                )}
            />
        ),
        [workouts]
    );

    const renderContent = useCallback(
        ( item ) => (
            <VStack space={[2, 3]} justifyContent="space-between">
                <Box>
                    <Box flexDirection="row">
                        <Box flex={1}>
                            <Text
                                fontSize={12}
                                color="black"
                                bold
                            >
                                Reps
                            </Text>
                            {item.Repetitions.map( ( rep, index ) => (
                                <Text
                                    color="black"
                                    key={index}
                                >
                                    {rep}
                                </Text>
                            ) )}
                        </Box>
                        <Box flex={1}>
                            <Text
                                fontSize={12}
                                color="black"
                                bold
                            >
                                Weights (kgs)
                            </Text>
                            {item.Weights.map( ( weight, index ) => (
                                <Text
                                    color="black"
                                    key={index}
                                >
                                    {weight}
                                </Text>
                            ) )}
                        </Box>
                    </Box>
                </Box>
            </VStack>
        ),
        []
    );

    const memoizedRenderWorkouts = useMemo( renderWorkouts, [renderWorkouts] );

    return !loader ? (
        <View flex={1} m={5}>
            <FlatList
                data={dates}
                keyExtractor={( item, index ) => index.toString()}
                renderItem={( { item } ) => (
                    <Box
                        borderBottomWidth={1}
                        borderColor="muted.800"
                        pl={['0', '4']}
                        pr={['0', '5']}
                        py="2"
                        m="3" backgroundColor={"black"} borderRadius={10}
                    >
                        <HStack
                            space={[2, 3]}
                            justifyContent="space-between"
                            margin={2}
                        >
                            <Text
                                color="white"
                                bold
                            >
                                {item.Date}
                            </Text>
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
                                    _expanded={{ backgroundColor: 'muted.200' }}
                                    _hover={{ backgroundColor: 'muted.100' }}
                                >
                                    <Text
                                        color="white"
                                        fontSize={12}
                                    >
                                        <Icon as={MaterialIcons} name="expand-more" />
                                    </Text>
                                </Accordion.Summary>
                                <Accordion.Details>{memoizedRenderWorkouts}</Accordion.Details>
                            </Accordion.Item>
                        </Accordion>
                    </Box>
                )}
            />
        </View>
    ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Box flex={1} justifyContent={'center'} alignItems={'center'} alignSelf={'center'}>
                <Spinner accessibilityLabel="getting past workouts" style={{ margin: 10, padding: 10 }} color={"black"} />
                <Heading color="black" fontSize="md">
                    getting past workouts...
                </Heading>
            </Box>
        </View>
    );
};

export default WorkoutHistoryPage;
