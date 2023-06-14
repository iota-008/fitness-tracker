import React, { useState, useEffect, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import { Text, Button, View, Modal, ScrollView, Center, useToast, Input, Box, Spinner, Heading } from 'native-base';
import { appDatabase, storage } from '../../services/appwrite-service';
import { DbConstants } from '../../constants';
import { ID, Query } from 'appwrite';
import { DeleteDocumentFields } from '../../shared';

const FormModal = ( { showModal, setShowModal, fetchUserWorkouts, user, currentDate } ) =>
{
    const toast = useToast();
    const [loading, setLoading] = useState( false );
    const [userDetails, setUserDetails] = useState( null );

    useEffect( () =>
    {
        ( async () =>
        {
            await fetchAvailableWorkouts();
            await fetchUserDetails();

        } )();
    }, [user] );

    const fetchUserDetails = async () =>
    {
        appDatabase.listDocuments( DbConstants.WorkoutTrackerDatabaseId, DbConstants.UsersCollectionId, [
            Query.equal( 'UserId', user.$id ),
        ] ).then(
            ( result ) =>
            {

                const userDetails = DeleteDocumentFields( result.documents[0] );
                setUserDetails( userDetails )
            },
            ( error ) =>
            {
                console.error( error );
            }
        )
    }

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
                const updatedDocument = DeleteDocumentFields( currentDocument );

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

    const calculateCaloriesBurned = () =>
    {
        const age_in_years = parseInt( userDetails.Age );
        const weight_in_kg = parseInt( userDetails.Weight );
        const gender = userDetails.Gender;
        const height_in_cm = parseFloat( userDetails.Height );
        const duration_in_minutes = parseInt( workoutTime );
        const reps = repetitions;
        const sets = setsCount;
        const weights = weightsUsed;
        let calories = 0;


        // Harris-Benedict Equation for Basal Metabolic Rate (BMR)
        const a_m = 88.362,
            b_m = 13.397,
            c_m = 4.799,
            d_m = 5.677;
        const a_f = 447.593,
            b_f = 9.247,
            c_f = 3.098,
            d_f = 4.330;
        const BMR =
            gender === 'MALE'
                ? a_m + b_m * weight_in_kg + c_m * height_in_cm - d_m * age_in_years
                : a_f + b_f * weight_in_kg + c_f * height_in_cm - d_f * age_in_years;

        for ( let i = 0; i < parseInt( sets ); i++ )
        {
            const MET_for_set = calculateMET( parseFloat( weights[i] ), parseInt( reps[i] ), weight_in_kg, age_in_years, height_in_cm );

            // Calculate calories burned per set using MET value, duration, and BMR
            const caloriesPerSet = Math.round( ( BMR * MET_for_set * duration_in_minutes ) / 60 );
            calories = calories + caloriesPerSet;

        }

        return calories / 10;
    };

    const calculateMET = ( weightsUsed: any, repetitions: number, bodyWeight: number, age: number, height: number ) =>
    {

        const weightMultiplier = 0.029;
        const ageMultiplier = 0.017;
        const heightMultiplier = 0.0128;
        const repMultiplier = 0.0087;

        const metPerSet = (
            ( weightsUsed / bodyWeight ) * weightMultiplier +
            ( age * ageMultiplier ) +
            ( height * heightMultiplier ) +
            ( repetitions * repMultiplier )
        );

        return metPerSet;
    };


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
