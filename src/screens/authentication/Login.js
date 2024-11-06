import React, {useEffect, useState, useContext} from 'react';
import {StyleSheet, Alert, Platform, Image, View, Linking, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {DOMParser} from 'xmldom';
import OneSignal from 'react-native-onesignal';
import GLOBALS from '../../config/Globals';
import Logo from '../../images/logo.png';
import Progress from '../../components/ProgressIndicator';
import {widthPercentageToDP} from 'react-native-responsive-screen';

const Login = ({navigation}) => {
  let branch = '';
  let username = '';
  let token = '';
  const [loading, setloading] = useState(true);

  useEffect(() => {
    OneSignal.setAppId('e59855c0-e3c5-49cc-a270-89d13e896bee');
    OneSignal.setNotificationOpenedHandler(notification => {
      onOpened(notification);
    });
    onIds();
    // OneSignal.inFocusDisplaying(2);
  }, []);

  const onIds = async () => {
    const deviceState = await OneSignal.getDeviceState();
    if (deviceState != null) {
      token = deviceState.userId;
      fetchData(deviceState.userId);
    } else {
      token = 123456789;
      fetchData(123456789);
    }
  };

  const onOpened = openResult => {
    let data = openResult.notification.payload.additionalData;
    if (typeof data !== 'undefined') {
      let role = data.roleId;
      let studentId = data.StudentId;
      let brnch = data.branchId;
      let path = '';
      switch (role) {
        case 'ROL_004':
          path = 'Parent_Notification';
          break;
        case 'ROL_005':
          path = 'Teacher_Notification';
          break;
        case 'ROL_006':
          path = 'NTNotifications';
          break;
        case 'ROL_007':
          path = 'AdminNotifications';
          break;

        default:
          path = '';
          break;
      }
      if (path !== '') {
        navigation.navigate(path, {
          studentId: studentId,
          branch: brnch,
          value: 'notification',
        });
      }
    }
  };

  const fetchData = tokens => {
    const fcmToken = tokens;
    AsyncStorage.getItem('domain').then(domain => {
      GLOBALS.PARENT_URL = `${GLOBALS.BEFORE}${domain}${GLOBALS.AFT_PARENT}`;
      GLOBALS.TEACHER_URL = `${GLOBALS.BEFORE}${domain}${GLOBALS.AFT_TEACHER}`;
      appversionCheck();
      AsyncStorage.getItem('schoolBranchName').then(async v => {
        branch = v;
        const pin = await AsyncStorage.getItem('pin')
        AsyncStorage.getItem('acess_token').then(value => {
          username = value;
          if (
            v !== null &&
            v !== undefined &&
            fcmToken !== null &&
            fcmToken !== undefined &&
            value !== null &&
            value !== undefined
          ) {
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=Login`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <Login xmlns="http://www.m2hinfotech.com//">
       <mobile>${username}</mobile>
                    <sessionId>${Platform.OS}</sessionId>
                    <deviceId>${fcmToken}</deviceId>
                    <pinNumber>${pin}</pinNumber>
    </Login>
  </soap12:Body>
</soap12:Envelope>`,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/soap+xml; charset=utf-8',
              },
            })
              .then(r => r.text())
              .then(r => {
                setloading(false);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(r);
                const ccc =
                JSON.parse(xmlDoc.getElementsByTagName('LoginResult')[0].childNodes[0]
                  .nodeValue)[0]?.UserRole;
                if (ccc === 'failure') {
                  Alert.alert(
                    'Signin Failed!',
                    'Please make sure your phone number is registered with your school!',
                    [
                      {
                        text: 'OK',
                      },
                      {
                        text: 'Login with another number',
                        onPress: () => {
                          navigation.navigate('Phone');
                        },
                      },
                    ],
                    {cancelable: false},
                  );
                } else {
                  try {
                    AsyncStorage.setItem('role', ccc);
                  } catch (error) {
                    console.log('somthing went wrong');
                  }
                  switch (ccc) {
                    case 'T,H':
                      AsyncStorage.setItem('Dashboard', 'TH');
                      navigation.navigate('TeacherHome');
                      break;
                    case 'PT,H':
                      AsyncStorage.setItem('Dashboard', 'TH');
                      navigation.navigate('TeacherHome');
                      break;
                    case 'PPT,H':
                      AsyncStorage.setItem('Dashboard', 'TH');
                      navigation.navigate('TeacherHome');
                      break;
                    case 'A':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminHome');
                      break;
                    case 'A,E':
                      AsyncStorage.setItem('Dashboard', 'EH');
                      navigation.navigate('EvaluatorHome');
                      break;
                    case 'A,C':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminHome');
                      break;
                    case 'A,P':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminHome');
                      break;
                    case 'AA,P':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminSwitchBranch');
                      break;
                    case 'AA,C':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminSwitchBranch');
                      break;
                    case 'AA,E':
                      AsyncStorage.setItem('Dashboard', 'EH');
                      navigation.navigate('EvaluatorHome');
                      break;
                    case 'AA':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminSwitchBranch');
                      break;
                    case 'AP':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminHome');
                      break;
                    case 'APP':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminHome');
                      break;
                    case 'AT':
                      AsyncStorage.setItem('Dashboard', 'AH');
                      navigation.navigate('AdminHome');
                      break;
                    case 'P':
                      AsyncStorage.setItem('Dashboard', 'PH');
                      navigation.navigate('ParentHome');
                      break;
                    case 'T':
                      AsyncStorage.setItem('Dashboard', 'TH');
                      navigation.navigate('TeacherHome');
                      break;
                    case 'PT':
                      AsyncStorage.setItem('Dashboard', 'TH');
                      navigation.navigate('TeacherHome');
                      break;
                    case 'PPT':
                      AsyncStorage.setItem('Dashboard', 'TH');
                      navigation.navigate('TeacherHome');
                      break;
                    case 'PP':
                      AsyncStorage.setItem('Dashboard', 'PH');
                      navigation.navigate('SwitchStudent');
                      break;
                    case 'S':
                      AsyncStorage.setItem('Dashboard', 'NTS');
                      navigation.navigate('NonTeachingHome');
                      break;
                    case 'SP':
                      AsyncStorage.setItem('Dashboard', 'NTS');
                      navigation.navigate('NonTeachingHome');
                      break;
                    case 'SPP':
                      AsyncStorage.setItem('Dashboard', 'NTS');
                      navigation.navigate('NonTeachingHome');
                      break;
                    case 'failure':
                      Alert.alert(
                        'Signin Failed!',
                        'Please make sure your phone number is registered with your school!',
                        [
                          {
                            text: 'OK',
                            onPress: () => console.log('pressed ok'),
                          },
                          {
                            text: 'Login with another number',
                            onPress: () => {
                              navigation.navigate('Phone');
                            },
                          },
                        ],
                        {cancelable: false},
                      );
                      break;
                    case 'NC':
                      Alert.alert(
                        'Number Changed!',
                        'Please login with your newly registered number. Contact School Admin if there is any issue.',
                        [
                          {
                            text: 'OK',
                            onPress: () => navigation.navigate('Phone'),
                          },
                        ],
                        {cancelable: false},
                      );
                      break;
                    default:
                      Alert.alert(
                        'Unexpected Error!',
                        'Some unexpected error has been occured! Please Try again!',
                      );
                  }
                }
              })
              .catch(error => {
                setloading(false);
                console.log(error);
              });
          }
        });
      });
    });
  };

  const appversionCheck = () => {
    fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetMobileVersion`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <GetMobileVersion xmlns="http://www.m2hinfotech.com//" />
        </soap12:Body>
      </soap12:Envelope>
   `,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/xml; charset=utf-8',
      },
    })
      .then(response => response.text())
      .then(response => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response);
        const v = xmlDoc.getElementsByTagName('GetMobileVersionResult')[0]
          .childNodes[0].nodeValue;
        if (v === 'failure') {
        } else {
          const rslt = JSON.parse(v);
          updateAlert(rslt);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const updateAlert = result => {
    const schoolplusAndroid = result[0].Android;
    const schoolplusIos = result[0].IOS;
    if (Platform.OS === 'android') {
      // Android App
      compareVersion(schoolplusAndroid);
    } else {
      // IOS App
      compareVersion(schoolplusIos);
    }
  };

  const showForcedAlert = () => {
    Alert.alert(
      'UPDATE',
      'A new Update is available for SchoolPlus App',
      [{text: 'Update', onPress: () => linktoStore()}],
      {cancelable: false},
    );
  };

  const showTempAlert = () => {
    Alert.alert(
      'UPDATE',
      'A new Update is available for SchoolPlus App',
      [
        {
          text: 'Not Now',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Update', onPress: () => linktoStore()},
      ],
      {cancelable: true},
    );
  };

  const linktoStore = () => {
    const storeID =
      Platform.OS === 'ios'
        ? 'https://itunes.apple.com/us/app/school-plus-app/id1378190576?ls=1&mt=8'
        : 'https://play.google.com/store/apps/details?id=com.m2hinfotech.eschool&hl=en';
    Linking.openURL(storeID);
  };

  const compareVersion = updatedVersion => {
    const currentVersion = DeviceInfo.getVersion();
    const splitCurrent = currentVersion.toString().split('.');
    const splitUpdated = updatedVersion.toString().split('.');

    const firstCurrent = parseInt(splitCurrent[0]);
    const firstUpdated = parseInt(splitUpdated[0]);
    const secondCurrent = parseInt(splitCurrent[1]);
    const secondUpdated = parseInt(splitUpdated[1]);
    const thirdCurrent = parseInt(splitCurrent[2]);
    const thirdUpdated = parseInt(splitUpdated[2]);

    if (firstCurrent < firstUpdated) {
      showForcedAlert();
    } else if (firstCurrent === firstUpdated) {
      if (secondCurrent < secondUpdated) {
        showForcedAlert();
      } else if (secondCurrent === secondUpdated) {
        if (thirdCurrent < thirdUpdated) {
          showTempAlert();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={Logo} />
      {loading ? <Progress /> :null}
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17BED0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: widthPercentageToDP('35%'),
    height: widthPercentageToDP('50%'),
  },
});
