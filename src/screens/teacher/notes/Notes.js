import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SendNotes from './SendNotes';
import SentNotes from './SentNotes';
import ReceivedNotes from './ReceivedNotes';
import Header from '../../../components/Header';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <Tab.Navigator
        tabBarOptions={{
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="Received Notes" component={ReceivedNotes} />
        <Tab.Screen name="Send Notes" component={SendNotes} />
        <Tab.Screen name="Sent Notes" component={SentNotes} />
      </Tab.Navigator>
    </>
  );
}
