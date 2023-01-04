import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PersonalDetails from './PersonalDetails';
import ParentDetails from './ParentDetails';
import Attendance from './Attendance';
import Header from '../../../components/Header';

const Tab = createMaterialTopTabNavigator();

export default function App({route, navigation}) {
  console.log(route, 'route');
  return (
    <>
      <Header
        homePress={() =>
          navigation.navigate(
            route.params !== undefined
              ? route.params.screen !== undefined
                ? route.params.screen
                : 'ParentDashboard'
              : 'ParentDashboard',
          )
        }
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      <Tab.Navigator
        tabBarOptions={{
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="PERSONAL DETAILS" component={PersonalDetails} />
        <Tab.Screen name="PARENT DETAILS" component={ParentDetails} />
        <Tab.Screen name="ATTENDANCE" component={Attendance} />
      </Tab.Navigator>
    </>
  );
}
