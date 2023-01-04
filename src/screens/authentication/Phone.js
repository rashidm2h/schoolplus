import React, {useState, useRef} from 'react';
import {StyleSheet, Pressable, Alert, Text, View, Platform} from 'react-native';

import PhoneInput from 'react-native-phone-number-input';
// import CountryPicker from 'react-native-country-picker-modal';
import Globals from '../../config/Globals';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {DOMParser} from 'xmldom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Progress from '../../components/ProgressIndicator';
let token = '';
const Phone = ({navigation}) => {
  const [phoneNumber, setphoneNumber] = useState('');
  const [confirmResult, setconfirmResult] = useState(null);
  const [verificationCode, setverificationCode] = useState('');
  const [spinnerValue, setspinnerValue] = useState(false);
  const phoneInput = useRef(null);

  const [branchName, setbranchName] = useState('');
  const [domainName, setdomainName] = useState('');
  const [fcm_token, setfcm_token] = useState('');

  const buttonPress = () => {
    setspinnerValue(true);
    if (phoneNumber.length < 7) {
      Alert.alert('Please fill your phone number correctly!');
      setspinnerValue(false);
    } else {
      handleSendCode();
      // navigation.navigate('OTP', {
      //   phoneNumber: value,
      // });
    }
  };
  const handleSendCode = () => {
    // Request to send OTP
    if (
      phoneNumber === '+91987654321' ||
      phoneNumber === '+918848012237' ||
      phoneNumber === '+919567229939' ||
      phoneNumber === '+919999900000'
    ) {
      setspinnerValue(false);
      navigation.navigate('OTP', {
        phoneNum: phoneNumber,
        confirmResult: confirmResult,
        verificationCode: verificationCode,
      });
    } else {
      const code = phoneNumber.substring(0, 3);
      if (code === '+91') {
        setspinnerValue(false);
        navigation.navigate('OTP', {
          phoneNum: phoneNumber,
          confirmResult: confirmResult,
          verificationCode: verificationCode,
        });
      } else if (validatePhoneNumber()) {
        setspinnerValue(false);
        console.log('test', phoneNumber);
        firebase
          .auth()
          .verifyPhoneNumber(phoneNumber)
          .on(
            'state_changed',
            phoneAuthSnapshot => {
              console.log('phoneAuthSnapshot', phoneAuthSnapshot);
              console.log('phoneAuthSnapshot.state', phoneAuthSnapshot.state);
              switch (phoneAuthSnapshot.state) {
                case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
                  console.log('code sent');
                  vefifyByOtp();
                  break;
                case firebase.auth.PhoneAuthState.ERROR:
                  // console.log(phoneAuthSnapshot.error);
                  Alert.alert(phoneAuthSnapshot.error.nativeErrorMessage);
                  setspinnerValue(false);
                  break;
                case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
                  vefifyByOtp();
                  break;
                case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
                  // console.log(phoneAuthSnapshot);

                  setspinnerValue(false);
                  afterVerification();
                  break;
              }
            },
            error => {
              console.log(error.verificationId);
            },
            phoneAuthSnapshot => {
              console.log(phoneAuthSnapshot);
            },
          );
      } else {
        alert('Invalid Phone Number'), setspinnerValue(false);
      }
    }
  };
  const validatePhoneNumber = () => {
    var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(phoneNumber);
  };
  const vefifyByOtp = () => {
    // console.log('ver');
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber)
      .then(ConfirmResult => {
        // console.log('ConfirmResult', ConfirmResult);
        setconfirmResult(ConfirmResult);
        navigationFunction(ConfirmResult);
      })
      .catch(error => {
        alert.Alert(error.message);
        setspinnerValue(false);
        console.log(error);
      });
    setconfirmResult(null);
    setverificationCode('');
  };
  const navigationFunction = ConfirmResult => {
    // console.log('conre', ConfirmResult);
    // console.log('verificationCode', verificationCode);
    setspinnerValue(false);
    navigation.navigate('OTP', {
      phoneNum: phoneNumber,
      confirmResult: ConfirmResult,
      verificationCode: verificationCode,
    });
  };
  const afterVerification = () => {
    let phone = phoneNumber.replace('+', '');
    AsyncStorage.getItem('schoolBranchName').then(branchNamekeyValue2 => {
      setbranchName(branchNamekeyValue2);
      if (Platform.OS === 'ios') {
        if (
          branchNamekeyValue2 === 'MH' &&
          domainName === 'demo.schoolplusapp.com'
        ) {
          try {
            AsyncStorage.setItem('acess_token', '918848012237');
          } catch (error) {
            console.log('somthing went');
          }
        } else {
          try {
            AsyncStorage.setItem('acess_token', phone);
          } catch (error) {
            console.log(error);
          }
        }
        fetchdata();
      } else {
        try {
          AsyncStorage.setItem('acess_token', phone);
        } catch (error) {
          console.log(error);
        }
        fetchdata();
      }
    });
  };
  const fetchdata = () => {
    setfcm_token(token);
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('schoolBranchName').then(
          keyValue2 => {
            setbranchName(keyValue2);

            const Branch = keyValue2;
            const username = keyValue;
            const fcmToken = fcm_token;
            fetch(`${Globals.PARENT_URL}Login`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <Login xmlns="http://www.m2hinfotech.com//">
      <mobile>${username}</mobile>
      <sessionId>${Platform.OS}</sessionId>
      <deviceId>${fcmToken}</deviceId>
      <Branch>${Branch}</Branch>
    </Login>
  </soap12:Body>
</soap12:Envelope>`,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/soap+xml; charset=utf-8',
              },
            })
              .then(response => response.text())
              .then(response => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(response);
                const ccc =
                  xmlDoc.getElementsByTagName('LoginResult')[0].childNodes[0]
                    .nodeValue;
                if (ccc === 'failure') {
                  setspinnerValue(false);
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
                  setspinnerValue(false);
                  try {
                    AsyncStorage.setItem('role', ccc);
                  } catch (error) {
                    console.log('somthing went wrong');
                  }
                  switch (ccc) {
                    case 'A':
                      navigation.navigate('AdminStack');
                      break;
                    case 'AA':
                      navigation.navigate('AdminSwitchBranch');
                      break;
                    case 'AP':
                      navigation.navigate('AdminStack');
                      break;
                    case 'APP':
                      navigation.navigate('AdminStack');
                      break;
                    case 'AT':
                      navigation.navigate('AdminStack');
                      break;
                    case 'P':
                      navigation.navigate('ParentStackDraw');
                      break;
                    case 'T':
                      navigation.navigate('TeacherStack');
                      break;
                    case 'PT':
                      navigation.navigate('TeacherStack');
                      break;
                    case 'PPT':
                      navigation.navigate('TeacherStack');
                      break;
                    case 'PP':
                      navigation.navigate('SwitchstudentPage');
                      break;
                    case 'S':
                      navigation.navigate('NonTeachingStack');
                      break;
                    case 'SP':
                      navigation.navigate('NonTeachingStack');
                      break;
                    case 'SPP':
                      navigation.navigate('NonTeachingStack');
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
                      alert.Alert(
                        'Unexpected Error!',
                        'Some unexpected error has been occured! Please Try again!',
                      );
                  }
                }
              })
              .catch(error => {
                console.log(error);
              });
          },
          error => {
            console.log(error);
          },
        );
      },
      error => {
        console.log(error);
      },
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Enter your Mobile Number</Text>

      <PhoneInput
        ref={phoneInput}
        defaultValue={phoneNumber}
        defaultCode="IN"
        layout="first"
        withShadow
        autoFocus
        containerStyle={styles.phoneContainer}
        textContainerStyle={styles.textInput}
        onChangeFormattedText={text => {
          setphoneNumber(text);
        }}
      />

      {/* <View style={styles.container}> */}
      {/* <PhoneInput
          ref={phoneInput}
          onPressFlag={this.onPressFlag}
          initialCountry={'IN'}
          initialValue={phoneNumber}
          textProps={{
            placeholder: 'Enter a phone number...',
          }}
          onChangePhoneNumber={text => {
            setphoneNumber(text);
          }}
        /> */}

      {/* <CountryPicker
          ref={ref => {
            this.countryPicker = ref;
          }}
          onChange={value => this.selectCountry(value)}
          translation="eng"
          cca2={this.state.cca2}>
          <View />
        </CountryPicker> */}
      {/* </View> */}
      <Pressable style={styles.themeButton} onPress={() => buttonPress()}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
      {spinnerValue ? <Progress /> : null}
    </View>
  );
};

export default Phone;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: hp('5%'),
  },

  themeButton: {
    width: wp('90%'),
    height: wp('12%'),
    marginTop: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b0c4de',
    borderRadius: 3,
  },
  phoneContainer: {
    width: wp('90%'),
    height: wp('18%'),
    color: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 16,
    color: 'white',
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
    justifyContent: 'center',
    // marginLeft: 50,
    padding: 10,
    paddingBottom: 10,
    // alignItems: 'flex-end',
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    padding: 10,
  },

  textInput: {
    backgroundColor: 'white',
  },
});
