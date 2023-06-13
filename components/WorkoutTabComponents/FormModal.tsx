import React, { useState, useEffect, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Text, Button, View, Modal, ScrollView, Center, useToast, Input, Box, Spinner, Heading } from 'native-base';
import { appDatabase, storage } from '../../services/appwrite-service';
import { DbConstants } from '../../constants';
import { ID, Query } from 'appwrite';

const FormModal = ( { showModal, setShowModal, fetchUserWorkouts, user, currentDate } ) =>
{
    const toast = useToast();
    const [loading, setLoading] = useState( false );

    useEffect( () =>
    {
        ( async () =>
        {
            await fetchAvailableWorkouts();
        } )();
    }, [user] );

    const [selectedWorkout, setSelectedWorkout] = useState( null );
    const [workoutTime, setWorkoutTime] = useState( '' );
    const [setsCount, setSetsCount] = useState( '' );
    const [weightsUsed, setWeightsUsed] = useState( [] );
    const [repetitions, setRepetitions] = useState( [] );
    const [availableWorkouts, setAvailableWorkouts] = useState( [] );

    const handleWeightChange = useCallback( ( index, weight ) =>
    {
        setWeightsUsed( ( prevWeights ) =>
        {
            const updatedWeights = [...prevWeights];
            updatedWeights[index] = weight;
            return updatedWeights;
        } );
    }, [setWeightsUsed] );

    const handleRepetitionsChange = useCallback( ( index, rep ) =>
    {
        setRepetitions( ( prevRepetitions ) =>
        {
            const updatedRepetitions = [...prevRepetitions];
            updatedRepetitions[index] = rep;
            return updatedRepetitions;
        } );
    }, [setRepetitions] );

    const renderSetInputs = useCallback( () =>
    {
        const inputs = [];
        const sets = parseInt( setsCount );

        if ( !isNaN( sets ) && sets > 0 )
        {
            for ( let i = 0; i < sets; i++ )
            {
                inputs.push(
                    <View key={i} style={{ marginBottom: 8 }}>
                        <Text style={{ marginBottom: 4 }} bold>
                            Set {i + 1}
                        </Text>
                        <Input
                            placeholder="Weight Used"
                            value={weightsUsed[i] || ''}
                            onChangeText={( weight ) => handleWeightChange( i, weight )}
                            keyboardType="numeric"
                            variant="rounded"
                            w={{
                                base: '90%',
                                md: '10%',
                            }}
                            mb={1}
                        />
                        <Input
                            placeholder="Reps"
                            value={repetitions[i] || ''}
                            onChangeText={( rep ) => handleRepetitionsChange( i, rep )}
                            keyboardType="numeric"
                            variant="rounded"
                            w={{
                                base: '90%',
                                md: '10%',
                            }}
                            mb={2}
                        />
                    </View>
                );
            }
        }

        return inputs;
    }, [setsCount, handleWeightChange, handleRepetitionsChange, weightsUsed, repetitions] );


    const fetchAvailableWorkouts = useCallback( async () =>
    {
        try
        {
            const response = await fetch( "https://wger.de/api/v2/exercise/?language=2" );
            const data = await response.json();
            setAvailableWorkouts( data.results );
        } catch ( error )
        {
            console.error( 'Error fetching available workouts:', error );
        }
    }, [] );

    const handleSaveWorkout = useCallback( async () =>
    {
        try
        {
            setLoading( true );
            const selectedWorkoutData = availableWorkouts.find( ( workout ) => workout.id === selectedWorkout );

            const workout = {
                id: Date.now().toString(),
                Name: selectedWorkoutData.name,
                CaloriesBurned: calculateCaloriesBurned(),
                Duration: workoutTime,
                Sets: setsCount,
                Weights: weightsUsed,
                Repetitions: repetitions,
            };

            const workoutDetails = {
                UserId: user.$id,
                Date: currentDate,
                ...workout
            };
            delete workoutDetails.id;

            const addWorkoutDetailResponse = await appDatabase.createDocument( DbConstants.WorkoutTrackerDatabaseId, DbConstants.WorkoutDetailsCollectionId, ID.unique(), workoutDetails );

            const currentWorkouts = await appDatabase.listDocuments(
                DbConstants.WorkoutTrackerDatabaseId, DbConstants.UserWorkoutsCollectionId,
                [
                    Query.equal( 'UserId', user.$id ),
                    Query.equal( 'Date', currentDate )
                ]
            );

            if ( currentWorkouts.total === 0 )
            {
                var newWorkoutForTheDay = {
                    UserId: user.$id,
                    Date: currentDate,
                    WorkoutIds: [addWorkoutDetailResponse.$id]
                }
                appDatabase.createDocument( DbConstants.WorkoutTrackerDatabaseId, DbConstants.UserWorkoutsCollectionId, ID.unique(), newWorkoutForTheDay ).then(
                    () =>
                    {
                        toast.show( {
                            title: "Workout Added",
                            variant: "solid",
                        } )
                    },
                    ( error ) =>
                    {
                        console.error( error );
                    }
                )
            } else
            {
                var currentDocument = currentWorkouts.documents[0];
                const updatedDocument = { ...currentDocument };

                delete updatedDocument.$collectionId
                delete updatedDocument.$createdAt
                delete updatedDocument.$databaseId
                delete updatedDocument.$id
                delete updatedDocument.$permissions
                delete updatedDocument.$updatedAt

                updatedDocument.WorkoutIds.push( addWorkoutDetailResponse.$id );

                appDatabase.updateDocument( DbConstants.WorkoutTrackerDatabaseId, DbConstants.UserWorkoutsCollectionId, currentDocument.$id, updatedDocument ).then(
                    () =>
                    {
                        toast.show( {
                            title: "Workout Added",
                            variant: "solid",
                        } )
                    },
                    ( error ) =>
                    {
                        console.error( error );
                    }
                )
            }
        } catch ( error )
        {
            console.error( error );
        } finally
        {
            await fetchUserWorkouts();
            setSelectedWorkout( null );
            setWorkoutTime( '' );
            setSetsCount( '' );
            setWeightsUsed( [] );
            setRepetitions( [] );
            setShowModal( false );
            setLoading( false );
        }
    }, [user.$id, currentDate, availableWorkouts, selectedWorkout, workoutTime, setsCount, weightsUsed, repetitions] );

    const calculateCaloriesBurned = useCallback( () =>
    {
        return 50;
    }, [] );

    return !loading ? (
        <Center>
            <Modal isOpen={showModal} animationPreset='slide'>
                <Modal.Content borderRadius={20}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                        <View style={{ paddingHorizontal: 16 }}>
                            <Modal.Header alignItems={"center"} justifyContent={"center"}><Text fontSize={20} bold>Add Workout</Text></Modal.Header>
                            <Modal.Body>
                                <Picker
                                    selectedValue={selectedWorkout}
                                    onValueChange={( itemValue ) => setSelectedWorkout( itemValue )}
                                    style={{ marginBottom: 8 }}
                                >
                                    <Picker.Item label="Select Workout" value={null} />
                                    {availableWorkouts.map( ( workout ) => (
                                        <Picker.Item key={workout.id} label={workout.name} value={workout.id} />
                                    ) )}
                                </Picker>

                                <Input
                                    placeholder="Workout Time"
                                    value={workoutTime}
                                    onChangeText={setWorkoutTime}
                                    keyboardType="numeric"
                                    variant="rounded"
                                    w={{
                                        base: "90%",
                                        md: "10%"
                                    }}
                                    mb={2}
                                />

                                <Input
                                    placeholder="Sets Count"
                                    value={setsCount}
                                    onChangeText={setSetsCount}
                                    keyboardType="numeric"
                                    variant="rounded"
                                    w={{
                                        base: "90%",
                                        md: "10%"
                                    }}
                                    mb={2}
                                />

                                {renderSetInputs()}

                                <Button onPress={handleSaveWorkout} borderRadius="full" size="sm" margin={1} backgroundColor={"black"}>
                                    <Text color={"white"}>Save Workout</Text>
                                </Button>
                                <Button onPress={() => setShowModal( false )} borderRadius="full" size="sm" backgroundColor={"white"} borderColor={"black"} borderWidth={1}>
                                    <Text>Cancel</Text>
                                </Button>
                            </Modal.Body>
                        </View>
                    </ScrollView>
                </Modal.Content>
            </Modal>
        </Center>
    ) :
        (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Box flex={1} justifyContent={"center"} alignItems={"center"} alignSelf={"center"}>
                    <Spinner accessibilityLabel="saving workout" style={{ margin: 10, padding: 10 }} color={"black"} />
                    <Heading color="black" fontSize="md">
                        saving...
                    </Heading>
                </Box>
            </View>
        )
};

export default FormModal;
