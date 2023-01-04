import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AdminDashboard from '../Dashboard';
import Notifications from '../Notifications';
import StudentDetails from '../Studentdetails';
import Attendance from '../Attendance';
import Events from '../events/Events';
import Notes from '../notes/Notes';
import TimeTable from '../timetable/TimeTable';
import StaffDetails from '../staffdetails/StaffDetails';
import StudentDetails2 from '../../parent/studentdetails/StudentDetails';
import Teachers2 from '../staffdetails/Teachers2';
import NonTeachers2 from '../staffdetails/NonTeachers2';
import SendIndividualNotes from '../notes/SendIndividualNotes';
import SwitchBranch from '../SwitchBranch';
import Exam from '../Exam';
import AcademicYear from '../chairman/AcademicYear';
import Departments from '../chairman/Departments';
import Evaluation from '../chairman/evaluation/Evaluation';
import PrincipalEvaluation from '../principal/evaluation/Evaluation';
import EvaluatorQuestions from '../principal/evaluation/EvaluatorQuestions';
import EvaluatorEditQuestions from '../principal/evaluation/EvaluatorEditQuestions';
import AdminFee from '../adminfee/AdminFee';
import AdminFeeDetails from '../adminfee/AdminFeeDetails';
const Stack = createStackNavigator();
const AdminStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="StudentDetails" component={StudentDetails} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="StaffDetails" component={StaffDetails} />
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="Notes" component={Notes} />
      <Stack.Screen name="TimeTable" component={TimeTable} />
      <Stack.Screen name="StudentDetails2" component={StudentDetails2} />
      <Stack.Screen name="Teachers2" component={Teachers2} />
      <Stack.Screen name="NonTeachers2" component={NonTeachers2} />
      <Stack.Screen name="Exam" component={Exam} />
      <Stack.Screen
        name="SendIndividualNotes"
        component={SendIndividualNotes}
      />
      {/* <Stack.Screen name="AdminSwitchBranch" component={SwitchBranch} /> */}
      <Stack.Screen name="AcademicYear" component={AcademicYear} />
      <Stack.Screen name="Departments" component={Departments} />
      <Stack.Screen name="Evaluation" component={Evaluation} />
      <Stack.Screen
        name="PrincipalEvaluation"
        component={PrincipalEvaluation}
      />
      <Stack.Screen name="EvaluatorQuestions" component={EvaluatorQuestions} />
      <Stack.Screen
        name="EvaluatorEditQuestions"
        component={EvaluatorEditQuestions}
      />
      <Stack.Screen name="AdminFee" component={AdminFee} />
      <Stack.Screen name="AdminFeeDetails" component={AdminFeeDetails} />
    </Stack.Navigator>
  );
};

export default AdminStack;
