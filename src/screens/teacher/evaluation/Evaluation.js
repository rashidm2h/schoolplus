import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Header from '../../../components/Header';
import PendingEvaluation from './PendingEvaluation';
import CompletedEvaluation from './CompletedEvaluation';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => {
          navigation.navigate('Notifications');
        }}
      />
      <Tab.Navigator
        tabBarOptions={{
          style: {backgroundColor: '#607D8B'},
          labelStyle: {color: 'white'},
          indicatorStyle: {backgroundColor: 'white'},
        }}>
        <Tab.Screen name="PENDING" component={PendingEvaluation} />
        <Tab.Screen name="COMPLETED" component={CompletedEvaluation} />
      </Tab.Navigator>
    </>
  );
}
