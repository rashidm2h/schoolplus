import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Header from '../../../components/Header';
import CommonExam from './CommonExam';
import InternalExam from './InternalExam';

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
        <Tab.Screen name="COMMON EXAM" component={CommonExam} />
        <Tab.Screen name="INTERNAL EXAM" component={InternalExam} />
      </Tab.Navigator>
    </>
  );
}
