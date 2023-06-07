import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text, Button, View, Modal, ScrollView, Center, useToast } from 'native-base';
import { appDatabase } from '../../services/appwrite-service';
import { DbConstants } from '../../constants';
import { ID, Query } from 'appwrite';

const FormModal = ( { showModal, setShowModal, fetchUserWorkouts, user, currentDate } ) =>
{
    const toast = useToast();
    useEffect( () =>
    {
        ( async () =>
        {
            await fetchAvailableWorkouts();
        } )();
    }, [user] )

    const [selectedWorkout, setSelectedWorkout] = useState( null );
    const [workoutTime, setWorkoutTime] = useState( '' );
    const [setsCount, setSetsCount] = useState( '' );
    const [weightsUsed, setWeightsUsed] = useState( [] );
    const [repetitions, setRepetitions] = useState( [] );
    const [availableWorkouts, setAvailableWorkouts] = useState( [] );

    const handleWeightChange = ( index, weight ) =>
    {
        setWeightsUsed( ( prevWeights ) =>
        {
            const updatedWeights = [...prevWeights];
            updatedWeights[index] = weight;
            return updatedWeights;
        } );
    };
    const handleRepetitionsChange = ( index, rep ) =>
    {
        setRepetitions( ( prevReps ) =>
        {
            const updatedReps = [...prevReps];
            updatedReps[index] = rep;
            return updatedReps;
        } );
    };
    const renderSetInputs = () =>
    {
        const inputs = [];
        for ( let i = 0; i < parseInt( setsCount ); i++ )
        {
            inputs.push(
                <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={{ marginBottom: 4 }}>Set {i + 1}</Text>
                    <TextInput
                        placeholder="Weight Used"
                        value={weightsUsed[i] || ''}
                        onChangeText={( weight ) => handleWeightChange( i, weight )}
                        style={{ padding: 8, borderWidth: 1, borderColor: '#ccc' }}
                        keyboardType="numeric"
                    />
                    <TextInput
                        placeholder="Reps"
                        value={repetitions[i] || ''}
                        onChangeText={( rep ) => handleRepetitionsChange( i, rep )}
                        style={{ marginTop: 4, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
                        keyboardType="numeric"
                    />
                </View>
            );
        }
        return inputs;
    };
    const fetchAvailableWorkouts = async () =>
    {
        try
        {
            // const response = await fetch( 'https://exercisedb.p.rapidapi.com/exercises', {
            //     method: 'GET',
            //     headers: {
            //         'X-RapidAPI-Key': 'ca68d54c02mshcf9e4535bc61e66p15ff2cjsn2316cd4aba32',
            //         'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
            //     },
            // } );
            const response = await fetch( "https://wger.de/api/v2/exercise/?language=2" );
            const data = await response.json();
            setAvailableWorkouts( data.results );
        } catch ( error )
        {
            console.error( 'Error fetching available workouts:', error );
        }
    };
    const handleSaveWorkout = async () =>
    {
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
                }
                ,
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

        await fetchUserWorkouts();
        setSelectedWorkout( null );
        setWorkoutTime( '' );
        setSetsCount( '' );
        setWeightsUsed( [] );
        setRepetitions( [] );
        setShowModal( false );
    };
    const calculateCaloriesBurned = () =>
    {
        return 50;
    };

    return (
        <Center>
            <Modal isOpen={showModal} animationPreset='slide' >
                <Modal.Content >
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                        <View style={{ paddingHorizontal: 16 }}>
                            <Modal.Header >Add Workout</Modal.Header>
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

                                <TextInput
                                    placeholder="Workout Time"
                                    value={workoutTime}
                                    onChangeText={setWorkoutTime}
                                    style={{ marginBottom: 8, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
                                    keyboardType="numeric"
                                />

                                <TextInput
                                    placeholder="Sets Count"
                                    value={setsCount}
                                    onChangeText={setSetsCount}
                                    style={{ marginBottom: 8, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
                                    keyboardType="numeric"
                                />

                                {renderSetInputs()}

                                <Button onPress={handleSaveWorkout} borderRadius="full" size="sm" margin={1}>
                                    <Text>Save Workout</Text>
                                </Button>
                                <Button onPress={() => setShowModal( false )} borderRadius="full" size="sm">
                                    <Text>Cancel</Text>
                                </Button>
                            </Modal.Body>
                        </View>
                    </ScrollView>
                </Modal.Content>
            </Modal>
        </Center>
    )
}

export default FormModal