import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import UpcomingEvents from './UpcomingEvents';
import PastEvents from './PastEvents';
import Header from '../../../components/Header';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('NonTeachingDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      <Tab.Navigator
        tabBarOptions={{
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="UPCOMING EVENTS" component={UpcomingEvents} />
        <Tab.Screen name="PAST EVENTS" component={PastEvents} />
      </Tab.Navigator>
    </>
  );
}
