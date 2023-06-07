import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { appDatabase } from '../services/appwrite-service';
import { DbConstants } from '../constants';
import { Query } from 'appwrite';
import { DeleteDocumentFields } from '../shared';
import { Text, View, Container, List, Accordion, Box, VStack, Icon, FlatList, HStack, IconButton, Spinner, Heading, Button } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Table, Row, Rows } from 'react-native-table-component';

const UserProfileScreen = ( { route } ) =>
{
    const [loader, setLoader] = useState( false );
    const [documentId, setDocumentId] = useState( "" );
    const [userDetails, setUserDetails] = useState( {
        Name: "",
        Age: "",
        Gender: "",
        Email: "",
        Height: "",
        Weight: "",
        Mobile: "",
    } );
    const [editableFields, setEditableFields] = useState( {
        Email: "",
        Mobile: "",
        Height: "",
        Weight: "",
    } );

    useEffect( () =>
    {
        fetchUserDetails();
    }, [] );

    // useEffect( () =>
    // {
    //     console.log( userDetails );
    //     console.log( editableFields );
    // }, [userDetails, editableFields] );

    const fetchUserDetails = async () =>
    {
        setLoader( true );
        try
        {

            const response = await appDatabase.listDocuments(
                DbConstants.WorkoutTrackerDatabaseId,
                DbConstants.UsersCollectionId,
                [
                    Query.equal( 'UserId', route.params.userId ),
                ]
            );
            setDocumentId( response.documents[0].$id );
            const user = DeleteDocumentFields( response.documents[0] );
            setUserDetails( user );
            setEditableFields( {
                Email: user.Email,
                Mobile: user.Phone,
                Height: user.Height,
                Weight: user.Weight,
            } );
        } catch ( error )
        {
            console.error( error );
        } finally
        {

            setLoader( false );
        }
    };

    const updateField = ( field, value ) =>
    {
        setEditableFields( ( prevFields ) => ( {
            ...prevFields,
            [field]: value,
        } ) );
    };

    const saveUpdates = async () =>
    {
        setLoader( true );
        try
        {
            // Perform the update operation for the editable fields
            const updateData = {
                Weight: editableFields.Weight,
                Height: editableFields.Height,
                Mobile: editableFields.Mobile,
                Email: editableFields.Email,
            };
            await appDatabase.updateDocument(
                DbConstants.WorkoutTrackerDatabaseId,
                DbConstants.UsersCollectionId,
                documentId,
                updateData
            );
            // Refresh user details after update
            await fetchUserDetails();
        } catch ( error )
        {
            console.error( error );
        } finally
        {
            setLoader( false );
        }
    };

    return !loader ? (
        <View flex={1} m={5}>
            <List space={2}>
                <List.Item>
                    <Text fontWeight="bold">Name: </Text>
                    <Text>{userDetails.Name}</Text>
                </List.Item>
                <List.Item>
                    <Text fontWeight="bold">Age: </Text>
                    <Text>{userDetails.Age}</Text>
                </List.Item>
                <List.Item>
                    <Text fontWeight="bold">Gender: </Text>
                    <Text>{userDetails.Gender}</Text>
                </List.Item>
                <List.Item></List.Item>

                <List.Item>
                    <Text fontWeight="bold">Weight: </Text>
                    <TextInput
                        value={editableFields.Weight.toString()}
                        onChangeText={( text ) => updateField( 'Weight', text )}
                        placeholder="Enter weight"
                    />
                </List.Item>
                <List.Item>
                    <Text fontWeight="bold">Height: </Text>
                    <TextInput
                        value={editableFields.Height.toString()}
                        onChangeText={( text ) => updateField( 'Height', text )}
                        placeholder="Enter height"
                    />
                </List.Item>
                <List.Item>
                    <Text fontWeight="bold">Phone: </Text>
                    <TextInput
                        value={editableFields?.Mobile?.toString()}
                        onChangeText={( text ) => updateField( 'Mobile', text )}
                        placeholder="Enter phone number"
                    />
                </List.Item>
                <List.Item>
                    <Text fontWeight="bold">Email: </Text>
                    <TextInput
                        value={editableFields?.Email}
                        onChangeText={( text ) => updateField( 'Email', text )}
                        placeholder="Enter email"
                    />
                </List.Item>
                {/* <List.Item>
                    <Text fontWeight="bold">Password: </Text>
                    <TextInput
                        value={editableFields.password}
                        onChangeText={( text ) => updateField( 'password', text )}
                        placeholder="Enter password"
                    />
                </List.Item> */}
            </List>
            <Button onPress={saveUpdates} mt={4}>
                Save Changes
            </Button>
        </View>
    ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Box flex={1} justifyContent="center" alignItems="center" alignSelf="center">
                <Spinner accessibilityLabel="Loading posts" />
                <Heading color="primary.500" fontSize="md">
                    Loading
                </Heading>
            </Box>
        </View>
    );
};

export default UserProfileScreen;
