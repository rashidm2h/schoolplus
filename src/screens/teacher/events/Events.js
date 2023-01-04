import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import PastEvents from './PastEvents';
import UpcomingEvents from './UpcomingEvents';
import Header from '../../../components/Header';
import TeacherNotificationCount from '../TeacherNotificationCount';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
        notificationCount={<TeacherNotificationCount />}
      />
      <Tab.Navigator
        tabBarOptions={{
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="Upcoming Events" component={UpcomingEvents} />
        <Tab.Screen name="Past Events" component={PastEvents} />
      </Tab.Navigator>
    </>
  );
}
