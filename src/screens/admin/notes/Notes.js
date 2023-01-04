import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SendNotes from './SendNotes';
import IndividualNotes from './IndividualNotes';
import WebNotes from './WebNotes';
import SmsReports from './SmsReports';
import TeacherNotes from './TeacherNotes';
import Header from '../../../components/Header';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      <Tab.Navigator
        tabBarOptions={{
          scrollEnabled: true,
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="SEND NOTES" component={SendNotes} />
        <Tab.Screen name="INDIVIDUAL NOTES" component={IndividualNotes} />
        <Tab.Screen name="WEB NOTES" component={WebNotes} />
        <Tab.Screen name="SMS REPORTS" component={SmsReports} />
        <Tab.Screen name="TEACHER NOTES" component={TeacherNotes} />
      </Tab.Navigator>
    </>
  );
}
