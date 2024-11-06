import { StyleSheet, Text, View, TextInput, Pressable, Alert, Image, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useRef, useEffect, useContext } from 'react'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import GLOBALS from '../../config/Globals'
import PhoneInput from 'react-native-phone-number-input';
import Logo from '../../images/logo.png';
import { DOMParser } from 'xmldom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryFlag from "react-native-country-flag";
import { Platform } from 'react-native';
import OneSignal from 'react-native-onesignal';
import AuthContext from '../../config/Context';
import Progress from '../../components/ProgressIndicator';

const LoginPage = ({ navigation }) => {
  const { signIn } = useContext(AuthContext);
  const [pin, setPin] = useState('')
  const [phoneNumber, setphoneNumber] = useState('');
  const [error, setError] = useState('')
  const phoneInput = useRef(null);
  const [loading, setloading] = useState('')
  const [spinnerValue, setspinnerValue] = useState(false);
  AsyncStorage.setItem('acess_token', phoneNumber)

  useEffect(() => {
    OneSignal.setAppId('e59855c0-e3c5-49cc-a270-89d13e896bee');
    onIds();
  }, []);

  const onIds = async () => {
    const deviceState = await OneSignal.getDeviceState();
    if (deviceState != null) {
      token = deviceState.userId;
      loginService(deviceState.userId);
    } else {
      token = 123456789;
      loginService(123456789);
    }
  };



  const validatePin = (inputPin) => {
    const pinRegex = /^[0-9]{4}$/;
    return pinRegex.test(inputPin);
  }
  const buttonPress = async () => {
    if (!pin || !validatePin(pin)) {
      setError('Please Enter Correct pin')
      Alert.alert("Please Enter the Correct Pin")
    }
    try {
      await AsyncStorage.setItem('access_token', phoneNumber);
      loginService(phoneNumber);
    }
    catch (error) {
      console.error("Error storing phone number: ", error);
    }
    // setphoneNumber('')
    // setPin('')
  }

  const loginService = async (phoneNumber) => {
    const fcmToken = token;
    setloading(true);

    try {
      const response = await fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=Login`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
              <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                  <Login xmlns="http://www.m2hinfotech.com//">
                    <mobile>${phoneNumber}</mobile>
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
      });

      const textResponse = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textResponse, 'text/xml');
      const parserError = xmlDoc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error("XML Parsing Error");
      }

      const loginResult = xmlDoc.getElementsByTagName('LoginResult')[0].childNodes[0].nodeValue;
      setloading(false);
      if (loginResult === "Pin Number doesn't Match") {
        setspinnerValue(false);
        Alert.alert(
          'Login Failed!',
          'Please Enter Valid Pin!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('LoginPage');
                setphoneNumber('')
                setPin('')
              },
            },
          ],
          { cancelable: false },
        );
      }
      else if (loginResult === 'Failure') {
        setspinnerValue(false)
        Alert.alert('Login Failed', 'Please Enter Registered Phone Number',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('LoginPage')
                setPin('')
                setphoneNumber('')
              }
            },
            {
              text: 'Login with another number',
              onPress: () => {
                navigation.navigate('LoginPage');
                setphoneNumber('')
                setPin('')
              },
            },
          ],
          { cancelable: false },
        )
      }
      else if (loginResult === "Didn't Set the Pin Number")
      {
        Alert.alert('Login Failed', 'Please Set your Pin',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('SignIn')
              }
            },
            {
              text: 'Sign Up',
              onPress: () => {
                navigation.navigate('SignIn');
              },
            },
          ],
          { cancelable: false },
        )
      }
      else {
        signIn(phoneNumber);
        const parsedResult = JSON.parse(loginResult);
        const userDetails = parsedResult[0];
        const userRole = userDetails.UserRole;
        const branch = userDetails.BranchId
        const branchname = userDetails.BranchName
        const domain = userDetails.Domain
        AsyncStorage.setItem('BranchID', branch)
        AsyncStorage.setItem('pin', pin)
        AsyncStorage.setItem('schoolBranchName', branchname)
        AsyncStorage.setItem('domain', domain)
        setspinnerValue(false);
        try {
          AsyncStorage.setItem('role', userRole);
        } catch (error) {
          console.log('somthing went wrong');
        }
        switch (userRole) {
          case 'A':
            navigation.navigate('AdminHome');
            break;
          case 'AA':
            navigation.navigate('AdminHome');
            break;
          case 'AP':
            navigation.navigate('AdminHome');
            break;
          case 'APP':
            navigation.navigate('AdminHome');
            break;
          case 'AT':
            navigation.navigate('AdminHome');
            break;
          case 'P':
            navigation.navigate('ParentHome');
            AsyncStorage.setItem('Dashboard', 'PH');
            break;
          case 'T':
            navigation.navigate('TeacherHome');
            AsyncStorage.setItem('Dashboard', 'TH');
            break;
          case 'PT':
            navigation.navigate('TeacherHome');
            break;
          case 'PPT':
            navigation.navigate('TeacherHome');
            break;
          case 'PP':
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
                    navigation.navigate('LoginPage');
                  },
                },
              ],
              { cancelable: false },
            );
            break;
          case 'NC':
            Alert.alert(
              'Number Changed!',
              'Please login with your newly registered number. Contact School Admin if there is any issue.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('LoginPage'),
                },
              ],
              { cancelable: false },
            );
            break;
          default:
            alert.Alert(
              'Unexpected Error!',
              'Some unexpected error has been occured! Please Try again!',
            );
        }
      }
    } catch (error) {
      console.log('Error during login: ', error);
      // Alert.alert('Login failed', 'There was a problem with your login. Please try again.');
    } finally {
      setloading(false);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logocontainer}>
          <Image style={styles.logo} source={Logo} />
          <Text style={styles.welcomepara}>Login to Continue...</Text>
        </View>
        <View style={styles.logincontainer}>
          <View style={styles.phoneContainer}>
            <CountryFlag isoCode="IN" size={20} style={styles.flagIcon} />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.textInputph}
              placeholder="Phone Number"
              placeholderTextColor="#B4B2B2"
              returnKeyType="done"
              maxLength={10}
              keyboardType="numeric"
              selectionColor="black"
              backgroundColor="#F4FDFF"
              value={phoneNumber.slice(2)}
              onChangeText={value => {
                if (value === "") {
                  setphoneNumber("91");
                } else {
                  setphoneNumber("91" + value);
                }
              }}
            />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your pin"
            placeholderTextColor="#B4B2B2"
            returnKeyType="done"
            maxLength={4}
            keyboardType="numeric"
            selectionColor="black"
            backgroundColor="#F4FDFF"
            value={pin}
            onChangeText={value => setPin(value)}
          />
          <Pressable style={styles.themeButton} onPress={() => buttonPress()}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>

          <View style={styles.signin}>
            <Text style={styles.signintext}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signintextlink}>SIGN IN</Text>
            </Pressable>
          </View>
        </View>
        {loading ? <Progress /> : null}
      </View>
    </TouchableWithoutFeedback>
  )
}
export default LoginPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17BED0',
  },
  logocontainer: {
    marginTop: wp('24%'),
    marginLeft: wp('10%')
  },
  logo: {
    width: wp('25%'),
    height: wp('35%'),
  },
  welcomepara: {
    fontSize: 24,
    color: 'white'
  },
  logincontainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp('8%')
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: hp('2%'),
    borderRadius: 8,
    backgroundColor: '#F4FDFF',
    width: wp('80%'),
    height: wp('13%'),
  },
  countryCode: {
    fontSize: 16,
    marginRight: wp('6%'),
    color: '#000',
    marginLeft: wp('3%'),
    fontWeight: 'bold'
  },
  textInputph: {
    fontSize: 16,
    color: '#B4B2B2',
    alignSelf: 'center'
  },
  textInput: {
    textAlign: 'center',
    color: '#B4B2B2',
    width: wp('80%'),
    height: wp('13%'),
    marginTop: hp('3%'),
    borderColor: '#F4FDFF',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  themeButton: {
    width: wp('35%'),
    height: wp('11%'),
    marginTop: hp('6%'),
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4FDFF',
    borderRadius: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#53BCC5',
    alignSelf: 'center',
    fontWeight: '500',
  },
  signin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        marginTop: hp('20%'),
      },
      android: {
        marginTop: hp('23%'),
      },
    })
  },
  signintext: {
    fontSize: 16,
    color: 'white',
  },
  signintextlink: {
    fontSize: 16,
    color: '#0630EA'
  },
})