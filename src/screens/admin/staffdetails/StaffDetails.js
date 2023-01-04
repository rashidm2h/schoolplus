import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Teachers1 from './Teachers1';
import NonTeachers1 from './NonTeachers1';
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
        <Tab.Screen name="TEACHERS" component={Teachers1} />
        <Tab.Screen name="NON TEACHERS" component={NonTeachers1} />
      </Tab.Navigator>
    </>
  );
}
