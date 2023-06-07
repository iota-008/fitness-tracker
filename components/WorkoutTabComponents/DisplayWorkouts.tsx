import React, { useEffect } from 'react';
import { Box, HStack, VStack, Text, FlatList, Accordion, Icon, IconButton, useToast } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { appDatabase } from '../../services/appwrite-service';
import { DbConstants } from '../../constants';
import { Query } from 'appwrite';

const DisplayWorkouts = ( { workouts, setWorkouts, user, currentDate } ) =>
{

    const toast = useToast();

    useEffect( () =>
    {
    }, [workouts] )

    const handleDeleteWorkout = async ( id ) =>
    {
        setWorkouts( ( prevWorkouts ) => prevWorkouts.filter( ( workout ) => workout.id !== id ) );
        const todaysWorkouts = await appDatabase.listDocuments(
            DbConstants.WorkoutTrackerDatabaseId,
            DbConstants.UserWorkoutsCollectionId,
            [
                Query.equal( 'UserId', user.$id ),
                Query.equal( 'Date', currentDate )
            ]
        );
        let document = todaysWorkouts.documents[0];
        const updatedDocument = { ...document };

        delete updatedDocument.$collectionId
        delete updatedDocument.$createdAt
        delete updatedDocument.$databaseId
        delete updatedDocument.$id
        delete updatedDocument.$permissions
        delete updatedDocument.$updatedAt

        updatedDocument.WorkoutIds = updatedDocument.WorkoutIds.filter( ( workoutId ) => workoutId !== id );
        appDatabase.updateDocument( DbConstants.WorkoutTrackerDatabaseId, DbConstants.UserWorkoutsCollectionId, document.$id, updatedDocument )
            .then(
                () =>
                {
                    toast.show( {
                        title: "Workout Delete",
                        variant: "solid",
                    } )
                },
                ( error ) =>
                {
                    console.error( error );
                }
            )
        await appDatabase.deleteDocument( DbConstants.WorkoutTrackerDatabaseId, DbConstants.WorkoutDetailsCollectionId, id );

    };

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

    return (
        <FlatList
            data={workouts}
            keyExtractor={( item: any ) => item.$id}
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
                        <IconButton onPress={() => handleDeleteWorkout( item.$id )}
                            icon={<MaterialIcons name="delete-outline" size={20} color="red" />}
                            borderRadius="full"
                            padding={[0]}
                        />
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
    )
}

export default DisplayWorkouts