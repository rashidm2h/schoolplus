import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import NonTeachingDashboard from '../Dashboard';
import Events from '../events/Events';
import Notes from '../Notes';
import Notifications from '../NonTeachingNotifications';

const Stack = createStackNavigator();
const NonTeachingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="NonTeachingDashboard"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="NonTeachingDashboard"
        component={NonTeachingDashboard}
      />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="Notes" component={Notes} />
    </Stack.Navigator>
  );
};

export default NonTeachingStack;
