import 'react-native-gesture-handler';
import React from 'react';
import {View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from './src/config/Context';
import Login from './src/screens/authentication/Login';
import SchoolCode from './src/screens/authentication/SchoolCode';
import Phone from './src/screens/authentication/Phone';
import OTP from './src/screens/authentication/Otp';
import ParentDrawer from './src/screens/parent/navigation/Drawer';
import ParentStack from './src/screens/parent/navigation/ParentStack';
import TeacherDrawer from './src/screens/teacher/navigation/Drawer';
import TeacherStack from './src/screens/teacher/navigation/TeacherStack';
import AdminStack from './src/screens/admin/navigation/AdminStack';
import AdminDrawer from './src/screens/admin/navigation/Drawer';
import NonTeachingStack from './src/screens/nonteaching/navigation/NonTeachingStack';
import NonTeachingDrawer from './src/screens/nonteaching/navigation/Drawer';
import SwitchStudent from './src/components/SwitchStudent';
import EvaluatorHome from './src/screens/evaluator/navigation/EvaluatorStack';
import {SafeAreaView} from 'react-native';
import SwitchBranch from './src/screens/admin/SwitchBranch';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('acess_token');
      } catch (e) {
        // Restoring token failed
      }
      dispatch({type: 'RESTORE_TOKEN', token: userToken});
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async uid => {
        dispatch({type: 'SIGN_IN', token: uid});
      },
      signOut: () => dispatch({type: 'SIGN_OUT'}),
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#13C0CE'}}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            {state.isLoading ? (
              <Stack.Screen name="Login" component={Login} />
            ) : state.userToken == null ? (
              <>
                <Stack.Screen name="SchoolCode" component={SchoolCode} />
                <Stack.Screen name="Phone" component={Phone} />
                <Stack.Screen name="OTP" component={OTP} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Phone" component={Phone} />
                <Stack.Screen name="OTP" component={OTP} />
                <Stack.Screen name="TeacherHome" component={TeacherHome} />
                <Stack.Screen name="ParentHome" component={ParentHome} />
                <Stack.Screen name="AdminHome" component={AdminHome} />
                <Stack.Screen
                  name="NonTeachingHome"
                  component={NonTeachingHome}
                />
                <Stack.Screen name="EvaluatorHome" component={EvaluatorHome} />
                <Stack.Screen name="SwitchStudent" component={SwitchStudent} />
                <Stack.Screen
                  name="AdminSwitchBranch"
                  component={SwitchBranch}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthContext.Provider>

    // <View>
    //   <Text>jinsiya</Text>
    // </View>
  );
};

const TeacherHome = () => {
  return (
    <Drawer.Navigator
      gestureEnabled
      headerShown
      drawerContent={props => <TeacherDrawer {...props} />}>
      <Drawer.Screen name="TeacherStack" component={TeacherStack} />
    </Drawer.Navigator>
  );
};

const ParentHome = () => {
  return (
    <Drawer.Navigator
      gestureEnabled
      headerShown
      drawerContent={props => <ParentDrawer {...props} />}>
      <Drawer.Screen name="ParentStack" component={ParentStack} />
    </Drawer.Navigator>
  );
};

const AdminHome = () => {
  return (
    <Drawer.Navigator
      gestureEnabled
      headerShown
      drawerContent={props => <AdminDrawer {...props} />}>
      <Drawer.Screen name="AdminStack" component={AdminStack} />
    </Drawer.Navigator>
  );
};

const NonTeachingHome = () => {
  return (
    <Drawer.Navigator
      initialRouteName="NonTeachingDashboard"
      gestureEnabled
      headerShown
      drawerContent={props => <NonTeachingDrawer {...props} />}>
      <Drawer.Screen name="NonTeachingDashboard" component={NonTeachingStack} />
    </Drawer.Navigator>
  );
};

export default App;
