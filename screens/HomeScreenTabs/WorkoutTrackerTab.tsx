import React, { useState, useEffect, memo, useCallback } from 'react';
import { Text, View, IconButton, Box, Icon, Pressable } from 'native-base';
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
        var currentDate =
            date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
        setCurrentDate( currentDate );
    }, [] );

    useEffect( () =>
    {
        ( async () =>
        {
            await fetchUserWorkouts();
        } )();
    }, [currentDate] );

    const fetchUserWorkouts = useCallback( async () =>
    {
        try
        {
            const currentWorkouts = await appDatabase.listDocuments(
                DbConstants.WorkoutTrackerDatabaseId,
                DbConstants.UserWorkoutsCollectionId,
                [
                    Query.equal( 'UserId', user.$id ),
                    Query.equal( 'Date', currentDate ),
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
                        ( workout ) => workout.$id === workoutDetails.$id
                    );

                    if ( !workoutExists )
                    {
                        newWorkouts.push( workoutDetails );
                    }
                }
            }
            setWorkouts( ( prevWorkouts ) => [...prevWorkouts, ...newWorkouts] );
        } catch ( error )
        {
            console.error( error );
        }
    }, [currentDate, user.$id, workouts] );

    const handleAddWorkout = useCallback( () =>
    {
        setShowModal( true );
    }, [] );

    return (
        <View style={{ flex: 1 }}>
            <FormModal
                showModal={showModal}
                setShowModal={setShowModal}
                fetchUserWorkouts={fetchUserWorkouts}
                user={user}
                currentDate={currentDate}
            />
            <MemoizedDisplayWorkouts
                workouts={workouts}
                setWorkouts={setWorkouts}
                user={user}
                currentDate={currentDate}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ position: 'absolute', bottom: 1 }}>
                    <Pressable onPress={handleAddWorkout}>
                        {( {
                            isPressed
                        } ) =>
                        {
                            return <Icon as={Ionicons} name="add-circle" size={20} color="black" style={{
                                transform: [{
                                    scale: isPressed ? 0.96 : 1
                                }]
                            }} />
                        }}
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const areEqual = ( prevProps, nextProps ) =>
{
    // Check if the relevant props have changed
    return (
        prevProps.workouts === nextProps.workouts &&
        prevProps.setWorkouts === nextProps.setWorkouts &&
        prevProps.user === nextProps.user &&
        prevProps.currentDate === nextProps.currentDate
    );
};

const MemoizedDisplayWorkouts = memo( DisplayWorkouts, areEqual );

export default WorkoutTrackerComponent;
