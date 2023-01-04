import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import EvaluatorDashboard from '../Dashboard';
import AcademicYear from '../AcademicYear';
import Departments from '../Departments';
import Evaluation from '../evaluation/Evaluation';
import EvaluatorQuestions from '../evaluation/EvaluatorQuestions';
import EvaluatorEditQuestions from '../evaluation/EvaluatorEditQuestions';
const Stack = createStackNavigator();
const NonTeachingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="EvaluatorDashboard"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="EvaluatorDashboard" component={EvaluatorDashboard} />
      <Stack.Screen name="AcademicYear" component={AcademicYear} />
      <Stack.Screen name="Departments" component={Departments} />
      <Stack.Screen name="Evaluation" component={Evaluation} />
      <Stack.Screen name="EvaluatorQuestions" component={EvaluatorQuestions} />
      <Stack.Screen
        name="EvaluatorEditQuestions"
        component={EvaluatorEditQuestions}
      />
    </Stack.Navigator>
  );
};

export default NonTeachingStack;
