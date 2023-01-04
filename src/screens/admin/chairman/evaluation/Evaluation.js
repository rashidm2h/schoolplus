import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import EvaluatorList1 from './EvaluatorList1';
import EvaluatorList2 from './EvaluatorList2';
import Header from '../../../../components/Header';

const Tab = createMaterialTopTabNavigator();

export default function App({navigation}) {
  return (
    <>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
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
        <Tab.Screen name="Pending" component={EvaluatorList1} />
        <Tab.Screen name="Completed" component={EvaluatorList2} />
      </Tab.Navigator>
    </>
  );
}
