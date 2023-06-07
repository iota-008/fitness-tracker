import React, { useState } from 'react';
import { View, Text, Button, FlatList, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';

const MealTrackerComponent = () =>
{
    const [meals, setMeals] = useState( [] );
    const [showModal, setShowModal] = useState( false );
    const [newMeal, setNewMeal] = useState( '' );
    const [caloriesConsumed, setCaloriesConsumed] = useState( '' );

    const handleAddMeal = () =>
    {
        const meal = {
            id: Date.now().toString(),
            name: newMeal,
            caloriesConsumed,
        };

        setMeals( ( prevMeals ) => [...prevMeals, meal] );
        setNewMeal( '' );
        setCaloriesConsumed( '' );
        setShowModal( false );
    };

    const handleDeleteMeal = ( id ) =>
    {
        setMeals( ( prevMeals ) => prevMeals.filter( ( meal ) => meal.id !== id ) );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* <Modal visible={showModal} animationType="slide">
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View style={{ paddingHorizontal: 16 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Add Meal</Text>

                        <TextInput
                            placeholder="Meal Name"
                            value={newMeal}
                            onChangeText={setNewMeal}
                            style={{ marginBottom: 8, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
                        />
                        <TextInput
                            placeholder="Calories Consumed"
                            value={caloriesConsumed}
                            onChangeText={setCaloriesConsumed}
                            style={{ marginBottom: 8, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
                            keyboardType="numeric"
                        />

                        <Button title="Add Meal" onPress={handleAddMeal} />
                        <Button title="Cancel" onPress={() => setShowModal( false )} />
                    </View>
                </ScrollView>
            </Modal>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: '#f4511e',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 16,
                    }}
                    onPress={() => setShowModal( true )}
                >
                    <Text style={{ fontSize: 24, color: '#fff' }}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Meals</Text>

                <FlatList
                    data={meals}
                    keyExtractor={( item ) => item.id}
                    renderItem={( { item } ) => (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
                            <View>
                                <Text style={{ fontSize: 16 }}>{item.name}</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>{item.caloriesConsumed} calories</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteMeal( item.id )}>
                                <Text style={{ color: 'red' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View> */}
        </View>
    );
};

export default MealTrackerComponent;
