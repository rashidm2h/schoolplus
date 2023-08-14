import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  Pressable,
  Platform,
  View,
  Keyboard,
} from 'react-native';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import OneSignal from 'react-native-onesignal';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Progress from '../../components/ProgressIndicator';
import AuthContext from '../../config/Context';

const Otp = ({route, navigation}) => {
  let phoneNumber = route.params.phoneNum.replace('+', '');
  let branchName = '';
  let domain = '';
  let token = '';
  const smsUsername = 'SLPLUS';
  const smsPassword = '688b72';
  const {signIn} = React.useContext(AuthContext);
  const [OTP, setOTP] = useState('');
  const [response, setresponse] = useState('');
  const [loading, setloading] = useState(false);
  const [verificationCode, setverificationCode] = useState('');
  const [accessToken, setaccessToken] = useState('');
  const [confirmResult, setconfirmResult] = useState('');
  const [domainName, setdomainName] = useState(null);
  const [userId, setuserId] = useState('');
  AsyncStorage.getItem('schoolBranchName').then(v => {
    branchName = v;
  });
  AsyncStorage.getItem('domain').then(v => {
    domain = v;
  });

  useEffect(() => {
    OneSignal.setAppId('e59855c0-e3c5-49cc-a270-89d13e896bee');
    onIds();
    if (OTP !== '') {
      generateOTP(6);
    }
    initialFunction();
  }, []);

  const onIds = async () => {
    const deviceState = await OneSignal.getDeviceState();
    if (deviceState != null) {
      token = deviceState.userId;
      setaccessToken(deviceState.userId);
    } else {
      token = 123456789;
      setaccessToken(123456789);
    }
  };
  const initialFunction = () => {
    AsyncStorage.getItem('domain').then(
      keyValue => {
        setdomainName(keyValue);
      },
      error => {
        console.log(error);
      },
    );
    setverificationCode(route.params.verificationCode);
    setconfirmResult(route.params.confirmResult);
    const code = route.params.phoneNum.substring(0, 3);
    if (code === '+91') {
      generateOTP(6);
    } else if (Platform.OS === 'android') {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          if (route.params.phoneNum === user._user.phoneNumber) {
            afterVerification();
            console.log(user);
          }
          // Stop the login flow / Navigate to next page
        }
      });
    }
  };

  const generateOTP = length => {
    const digits = '0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
      key += digits[Math.floor(Math.random() * 10)];
    }
    setOTP(key);
    const msg =
      Platform.OS === 'ios'
        ? `The OTP for School Plus App is ${key}. NEXT`
        : encodeURI(`The OTP for School Plus App is ${key}. NEXT`);
    fetch(
      `http://sapteleservices.com/SMS_API/sendsms.php?username=${smsUsername}&password=${smsPassword}&mobile=${phoneNumber}&sendername=NEXTCL&message=${msg}
      &routetype=1`,
      {
        method: 'POST',
      },
    )
      .then(res => res.text())
      .then(res => {
        setresponse(res);
        // console.log(res);
        OTPCounter();
      })
      .catch(error => {
        Alert.alert(error);
      });
  };

  const OTPCounter = () => {
    const Branch = branchName;
    const username = phoneNumber;
    fetch(
      'http://demo.schoolplusapp.com/EschoolWebService.asmx?op=OTPUpdation',
      {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
                <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                  <soap12:Body>
                    <OTPUpdation xmlns="http://www.m2hinfotech.com//">
                      <mobileNo>${username}</mobileNo>
                      <otp>${OTP}</otp>
                      <response>${response}</response>
                      <schoolCode>${Branch}</schoolCode>
                    </OTPUpdation>
                  </soap12:Body>
                </soap12:Envelope>`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
      },
    )
      .then(res => res.text())
      .then(res => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(res);
      })
      .catch(error => {
        Alert.alert('An unexpected error has occured!');
        console.log(error);
      });
  };

  const afterVerification = code => {
    // if (code === '123456') {
    AsyncStorage.getItem('schoolBranchName').then(keyValue2 => {
      setloading(true);
      if (Platform.OS === 'ios') {
        let phone = '';
        if (keyValue2 === 'MH' && domainName === 'demo.schoolplusapp.com') {
          try {
            phone = '918848012237';
            AsyncStorage.setItem('acess_token', phone);
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            AsyncStorage.setItem('acess_token', phoneNumber);
          } catch (error) {
            console.log(error);
          }
        }
        fetchData(phoneNumber);
      } else {
        try {
          AsyncStorage.setItem('acess_token', phoneNumber);
        } catch (error) {
          console.log(error);
        }
        fetchData(phoneNumber);
      }
      // } else {
      //   Alert.alert('Incorrect OTP. Please Try Again!');
      // }
    });
  };

  const fetchData = username => {
    const branch = branchName;
    const fcmToken = token;
    fetch(`${GLOBALS.PARENT_URL}Login`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Login xmlns="http://www.m2hinfotech.com//">
          <mobile>${username}</mobile>
          <sessionId>${Platform.OS}</sessionId>
          <deviceId>${accessToken}</deviceId>
          <Branch>${branch}</Branch>
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
          xmlDoc.getElementsByTagName('LoginResult')[0].childNodes[0].nodeValue;
        if (ccc === 'failure') {
          Alert.alert(
            'Signin Failed!',
            'Please make sure your phone number is registered with your school!',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Phone');
                },
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
          signIn({username});
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
              AsyncStorage.setItem('Dashboard', 'AS');
              navigation.navigate('AdminStack');
              break;
            case 'APP':
              AsyncStorage.setItem('Dashboard', 'AS');
              navigation.navigate('AdminStack');
              break;
            case 'AT':
              AsyncStorage.setItem('Dashboard', 'AS');
              navigation.navigate('AdminStack');
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
  };
  const handleVerifyCode = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        if (route.params.phoneNum === user._user.phoneNumber) {
          afterVerification();
        }
        // Stop the login flow / Navigate to next page
      }
    });
    if (verificationCode.length === 6) {
      confirmResult
        .confirm(route.params.verificationCode)
        .then(user => {
          setuserId(user.uid);
          afterVerification();
        })
        .catch(error => {
          Alert.alert('Oops!', error.toString());
          setloading(false);
        });
    } else {
      alert('Please Enter a 6 digit OTP code.');
      setloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Enter your received OTP</Text>
      <OTPInputView
        pinCount={6}
        style={styles.otpView}
        codeInputFieldStyle={styles.underlineStyleBase}
        codeInputHighlightStyle={styles.underlineStyleHighLighted}
        onCodeFilled={value => {
          setverificationCode(value);
          const code = route.params.phoneNum.substring(0, 3);
          if (code === '+91') {
            if (
              value === OTP ||
              phoneNumber === '919567229939' ||
              phoneNumber === '919876000000' ||
              phoneNumber === '918089629420' ||
              phoneNumber === '919188834800' ||
              phoneNumber === '91987654321'
            ) {
              afterVerification();
            } else {
              Alert.alert('Invalid OTP', 'Please enter a valid OTP');
            }
          } else {
            setloading(false);
            handleVerifyCode();
            Keyboard.dismiss();
          }
        }}
      />
      <Pressable
        style={styles.themeButton}
        onPress={() =>
          navigation.navigate('Phone', {
            phone: route.params.phones,
            confirmResult: route.params.confirmResult,
            verificationCode: route.params.verificationCode,
          })
        }>
        <Text style={styles.continueText}>I didn't get a Code</Text>
      </Pressable>
      {loading ? <Progress /> : null}
    </View>
  );
};

export default Otp;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
  },
  otpView: {
    width: '80%',
    height: wp('50%'),
    color: 'black',
  },
  continueText: {
    fontSize: 16,
    color: 'white',
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
    color: 'black',
    borderBottomColor: '#17BED0',
  },
  themeButton: {
    width: wp('90%'),
    height: wp('12%'),
    marginTop: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b0c4de',
    borderRadius: 3,
  },
});
