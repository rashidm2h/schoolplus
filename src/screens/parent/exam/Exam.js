import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import UpcomingExams from './UpcomingExams';
import PastExams from './PastExams';
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
        <Tab.Screen name="UPCOMING EXAMS" component={UpcomingExams} />
        <Tab.Screen name="PAST EXAMS" component={PastExams} />
      </Tab.Navigator>
    </>
  );
}
