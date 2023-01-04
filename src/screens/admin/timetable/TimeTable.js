import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import TeacherWise from './TeacherWise';
import ClassWise from './ClassWise';
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
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="TEACHER WISE" component={TeacherWise} />
        <Tab.Screen name="CLASS WISE" component={ClassWise} />
      </Tab.Navigator>
    </>
  );
}
