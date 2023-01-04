import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ViewExam from './ViewExam';
import ViewResult from './ViewResult';
import PublishResult from './PublishResult';
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
        <Tab.Screen name="View Result" component={ViewResult} />
        <Tab.Screen name="View Exam" component={ViewExam} />
        <Tab.Screen name="Publish Result" component={PublishResult} />
      </Tab.Navigator>
    </>
  );
}
