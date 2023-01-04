import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ReceivedNotes from './ReceivedNotes';
import SendNotes from './SendNotes';
import Header from '../../../components/Header';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      <Tab.Navigator
        tabBarOptions={{
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="RECEIVED NOTES" component={ReceivedNotes} />
        <Tab.Screen name="SEND NOTES" component={SendNotes} />
      </Tab.Navigator>
    </>
  );
}
