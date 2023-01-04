import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TeacherDashboard from '../Dashboard';
import Notifications from '../Notifications';
import StudentDetails from '../studentdetails/StudentDetails';
import StudentDetails2 from '../../parent/studentdetails/StudentDetails';
import Attendance from '../attendance/Attendance';
import AttendanceMain from '../attendance/AttendanceMain';
import Exam from '../exam/Exam';
import Events from '../events/Events';
import Notes from '../notes/Notes';
import TimeTable from '../TimeTable';
import Fee from '../fee/TeacherFee';
import FeeStructure from '../fee/TeacherFeeStructure';
import PayFee from '../fee/TeacherFeePay';
import NotificationCount from '../TeacherNotificationCount';
import TeacherAcademicYear from '../evaluation/TeacherAcademicYear';
import Evaluation from '../evaluation/Evaluation';
import EvaluatorQuestions from '../evaluation/EvaluatorQuestions';
import EvaluatorEditQuestions from '../evaluation/EvaluatorEditQuestion';
const Stack = createStackNavigator();
const TeacherStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="TeacherDashboard"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="TeacherNotifications" component={Notifications} />
      <Stack.Screen name="TeacherStudentDetails" component={StudentDetails} />
      <Stack.Screen name="TeacherStudentDetails2" component={StudentDetails2} />
      <Stack.Screen name="TeacherAttendance" component={Attendance} />
      <Stack.Screen name="TeacherAttendanceMain" component={AttendanceMain} />
      <Stack.Screen name="TeacherExam" component={Exam} />
      <Stack.Screen name="TeacherEvents" component={Events} />
      <Stack.Screen name="TeacherNotes" component={Notes} />
      <Stack.Screen name="TeacherTimeTable" component={TimeTable} />
      <Stack.Screen name="TeacherFee" component={Fee} />
      <Stack.Screen name="TeacherFeeStructure" component={FeeStructure} />
      <Stack.Screen name="TeacherPayFee" component={PayFee} />
      <Stack.Screen
        name="TeacherNotificationCount"
        component={NotificationCount}
      />
      <Stack.Screen
        name="TeacherAcademicYear"
        component={TeacherAcademicYear}
      />
      <Stack.Screen name="Evaluation" component={Evaluation} />
      <Stack.Screen
        name="EvaluatorEditQuestions"
        component={EvaluatorEditQuestions}
      />
      <Stack.Screen name="EvaluatorQuestions" component={EvaluatorQuestions} />
    </Stack.Navigator>
  );
};

export default TeacherStack;
