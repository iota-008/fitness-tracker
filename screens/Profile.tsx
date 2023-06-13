import React, { useEffect, useState } from 'react';
import { appDatabase } from '../services/appwrite-service';
import { DbConstants } from '../constants';
import { Query } from 'appwrite';
import { DeleteDocumentFields } from '../shared';
import { Text, View, List, Box, Spinner, Heading, Button, Input } from 'native-base';

const UserProfileScreen = ( { route } ) =>
{
    const [loader, setLoader] = useState( false );
    const [documentId, setDocumentId] = useState( '' );
    const [userDetails, setUserDetails] = useState( {
        Name: '',
        Age: '',
        Gender: '',
        Email: '',
        Height: '',
        Weight: '',
        Mobile: '',
    } );
    const [editableFields, setEditableFields] = useState( {
        Email: '',
        Mobile: '',
        Height: '',
        Weight: '',
    } );

    useEffect( () =>
    {
        fetchUserDetails();
    }, [] );

    const fetchUserDetails = async () =>
    {
        setLoader( true );
        try
        {
            const response = await appDatabase.listDocuments(
                DbConstants.WorkoutTrackerDatabaseId,
                DbConstants.UsersCollectionId,
                [Query.equal( 'UserId', route.params.userId )]
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
            <List space={2} backgroundColor="white" borderRadius={10} p="3">
                <List.Item>
                    <Text color="black" fontWeight="bold">
                        Name:
                    </Text>
                    <Text pl="1" color="black">{userDetails.Name}</Text>
                </List.Item>
                <List.Item>
                    <Text color="black" fontWeight="bold">
                        Age:
                    </Text>
                    <Text pl="1" color="black">{userDetails.Age}</Text>
                </List.Item>
                <List.Item>
                    <Text color="black" fontWeight="bold">
                        Gender:
                    </Text>
                    <Text pl="1" color="black">{userDetails.Gender}</Text>
                </List.Item>
                <List.Item>
                    <Text color="black" fontWeight="bold">
                        Email:
                    </Text>
                    <Text pl="1" color="black">{userDetails.Email}</Text>
                </List.Item>
                <List.Item >
                    <Text color="black" fontWeight="bold" mr="2">
                        Weight:
                    </Text>
                    <Input
                        value={editableFields.Weight.toString()}
                        onChangeText={( text ) => updateField( 'Weight', text )}
                        placeholder="Enter weight"
                        color="black"
                        ml={1}
                        variant="rounded"
                        w={{
                            base: "75%",
                            md: "25%"
                        }}
                    />
                </List.Item>
                <List.Item>
                    <Text color="black" fontWeight="bold" mr="2">
                        Height:
                    </Text>
                    <Input
                        value={editableFields.Height.toString()}
                        onChangeText={( text ) => updateField( 'Height', text )}
                        placeholder="Enter height"
                        color="black"
                        variant="rounded"
                        w={{
                            base: "75%",
                            md: "25%"
                        }}
                    />
                </List.Item>
                <List.Item>
                    <Text color="black" fontWeight="bold" mr="2">
                        Phone:
                    </Text>
                    <Input
                        value={editableFields?.Mobile?.toString()}
                        onChangeText={( text ) => updateField( 'Mobile', text )}
                        placeholder="Enter phone number"
                        color="black"
                        variant="rounded"
                        w={{
                            base: "75%",
                            md: "25%"
                        }}
                    />
                </List.Item>
            </List>

            <Button onPress={saveUpdates} mt={4} backgroundColor="black" color="black" borderRadius={10}>
                Save Changes
            </Button>
            
        </View>
    ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Box flex={1} justifyContent="center" alignItems="center" alignSelf="center">
                <Spinner accessibilityLabel="loading profile" style={{ margin: 10, padding: 10 }} color="black" />
                <Heading color="black" fontSize="md">
                    loading profile...
                </Heading>
            </Box>
        </View>
    );
};

export default UserProfileScreen;
