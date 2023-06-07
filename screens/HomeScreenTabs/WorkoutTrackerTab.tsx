import React, { useState, useEffect } from 'react';
import { Text, View, IconButton } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { appDatabase } from '../../services/appwrite-service';
import { DbConstants } from '../../constants';
import { Query } from 'appwrite';
import FormModal from '../../components/WorkoutTabComponents/FormModal';
import DisplayWorkouts from '../../components/WorkoutTabComponents/DisplayWorkouts';


const WorkoutTrackerComponent = ( { user } ) =>
{
    const [workouts, setWorkouts] = useState( [] );
    const [showModal, setShowModal] = useState( false );
    const [currentDate, setCurrentDate] = useState( '' );

    useEffect( () =>
    {
        var date = new Date();
        var currentDate = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
        setCurrentDate( currentDate );
    }, [] );


    useEffect( () =>
    {
        ( async () =>
        {
            await fetchUserWorkouts();
        } )();
    }, [currentDate] );


    const fetchUserWorkouts = async () =>
    {
        try
        {
            const currentWorkouts = await appDatabase.listDocuments(
                DbConstants.WorkoutTrackerDatabaseId,
                DbConstants.UserWorkoutsCollectionId,
                [
                    Query.equal( 'UserId', user.$id ),
                    Query.equal( 'Date', currentDate )
                ]
            );

            const newWorkouts = [];

            for ( const userWorkout of currentWorkouts.documents )
            {
                for ( const workoutId of userWorkout.WorkoutIds )
                {
                    const workoutDetails = await appDatabase.getDocument(
                        DbConstants.WorkoutTrackerDatabaseId,
                        DbConstants.WorkoutDetailsCollectionId,
                        workoutId
                    );

                    // Check if the workout already exists in the workouts state
                    const workoutExists = workouts.some(
                        ( workout ) => workout.$id == workoutDetails.$id
                    );

                    if ( !workoutExists )
                    {
                        newWorkouts.push( workoutDetails );
                    }
                }
            }
            setWorkouts( ( prevWorkouts ) => [...prevWorkouts, ...newWorkouts] );
        }
        catch ( error )
        {
            console.error( error );
        }

    };

    const handleAddWorkout = () =>
    {
        setShowModal( true );
    };

    return (
        <View style={{ flex: 1 }}>
            <FormModal showModal={showModal} setShowModal={setShowModal} fetchUserWorkouts={fetchUserWorkouts} user={user} currentDate={currentDate} />
            <DisplayWorkouts workouts={workouts} setWorkouts={setWorkouts} user={user} currentDate={currentDate} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <IconButton
                    onPress={handleAddWorkout}
                    icon={<Ionicons name="add-circle" size={80} color="black" />}
                    borderRadius="full"
                    style={{ width: 100, height: 100 }}
                />
            </View>
        </View>
    );
};

export default WorkoutTrackerComponent;
