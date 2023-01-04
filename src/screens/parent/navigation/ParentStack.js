import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ParentDashboard from '../Dashboard';
import StudentDetails from '../studentdetails/StudentDetails';
import ExamResults from '../examresults/ExamResults';
import Exam from '../exam/Exam';
import Events from '../events/Events';
import Notes from '../notes/Notes';
import Notifications from '../Notifications';
import TimeTable from '../TimeTable';
import Fee from '../fee/ParentFeeStructure';
import PayFee from '../fee/ParentFee';
import NotificationCount from '../notification/ParentNotificationCount';

const Stack = createStackNavigator();
const ParentStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ParentDashboard"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
      <Stack.Screen name="ParentStudentDetails" component={StudentDetails} />
      <Stack.Screen name="ParentExamResults" component={ExamResults} />
      <Stack.Screen name="ParentNotifications" component={Notifications} />
      <Stack.Screen name="ParentExam" component={Exam} />
      <Stack.Screen name="ParentEvents" component={Events} />
      <Stack.Screen name="ParentNotes" component={Notes} />
      <Stack.Screen name="ParentTimeTable" component={TimeTable} />
      <Stack.Screen name="ParentFee" component={Fee} />
      <Stack.Screen name="ParentPayFee" component={PayFee} />
      <Stack.Screen
        name="ParentNotificationCount"
        component={NotificationCount}
      />
    </Stack.Navigator>
  );
};

export default ParentStack;
