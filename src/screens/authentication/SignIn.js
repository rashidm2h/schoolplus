import { StyleSheet, Text, View, TextInput, Pressable, Alert, Image, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native'
import React, {useState, useRef, useEffect} from 'react'
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
  import GLOBALS from '../../config/Globals'
  import CountryFlag from "react-native-country-flag";
  import Logo from '../../images/logo.png';
  import {DOMParser} from 'xmldom';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import OneSignal from 'react-native-onesignal';
 
const SignIn = ({navigation}) => {
    const [loading,setloading] =useState('')
    const [spinnerValue, setspinnerValue] = useState(false);
    const [confirmPin, setconfirmPin] = useState('')
    const [phoneNumber, setphoneNumber] = useState('');

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
        // SignUPUserChecking(deviceState.userId);
      } else {
        token = 123456789;
        SignUPUserChecking(123456789);
      }
    };
  

    const buttonpress = async () => {
      try {
        await AsyncStorage.setItem('access_token', phoneNumber); 
        SignUPUserChecking(); 
      } 
  catch (error) {
      console.error("Error storing phone number: ", error);
  }
}
    


    const SignUPUserChecking = async () => {
      const fcmToken = token;

    //  await AsyncStorage.setItem('phno',phoneNumber);
      try{
        const response = await fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=SignUPUserChecking`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
             <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SignUPUserChecking xmlns="http://www.m2hinfotech.com//">
          <mobile>${phoneNumber}</mobile>
          <sessionId>${Platform.OS}</sessionId>
          <deviceId>${fcmToken}</deviceId>       
         </SignUPUserChecking>
      </soap12:Body>
    </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
        });
    //     console.log(`http://10.25.25.124:85/EschoolWebService.asmx?op=SignUPUserChecking`,`<?xml version="1.0" encoding="utf-8"?>
    //          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    //   <soap12:Body>
    //     <SignUPUserChecking xmlns="http://www.m2hinfotech.com//">
    //       <mobile>${phoneNumber}</mobile>
    //       <sessionId>${Platform.OS}</sessionId>
    //       <deviceId>${fcmToken}</deviceId>       
    //      </SignUPUserChecking>
    //   </soap12:Body>
    // </soap12:Envelope>`)
    const textResponse = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textResponse, 'text/xml');
        const parserError = xmlDoc.getElementsByTagName("parsererror");
        if (parserError.length > 0) {
            throw new Error("XML Parsing Error");
        }
        
        const signupresult = xmlDoc.getElementsByTagName('SignUPUserCheckingResult')[0].childNodes[0].nodeValue;
        if(signupresult === 'Phone Number not Register'){
          Alert.alert('Ivalid Phone Number','Phone number is not registered')
        }
        else if(signupresult === 'Pin Number Exists')
        {
          navigation.navigate('LoginPage')
        }
        else if (signupresult === 'Phone Number Registered')
        {
          navigation.navigate('MPin')
        }
        else if(signupresult ===  "Teacher Doesn't Exists or Not Approved by Admin")
        {
          Alert.alert("Teacher Doesn't Exists or Not Approved by Admin")
        }
        else if(signupresult ===  "Not Exist")
          {
            Alert.alert("Please Register your number","Your phone number is not registered")
          }
        else{
          Alert.alert('SignUp failed', 'There was a problem with your SignUp. Please try again.');
        }
      }
    catch (error) {
      console.log('Error during signup: ', error);
      Alert.alert('SignUp failed', 'There was a problem with your SignUp. Please try again.');
    } finally {
      setloading(false);
    }
  }; 
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      <View style={styles.logocontainer}>
                <Image style={styles.logo} source={Logo} />
                <Text style={styles.welcomepara}>Signup to Continue...</Text>
            </View>
        
      {/* <Text style={styles.signuptxt}>SIGN UP</Text> */}
        <View style={styles.logincontainer}>
        <Text style={styles.text}>Enter your Mobile Number:</Text>
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
                backgroundColor = "#F4FDFF"
                onChangeText={value => setphoneNumber("91" + value)}
              />
            </View>
            <Pressable style={styles.themeButton} onPress={() => buttonpress()}>
                <Text style={styles.continueText}>Next</Text>
            </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default SignIn

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
          width: wp('28%'),
          height: wp('38%'),
        },
        welcomepara: {
          fontSize: 24,
          color: 'white'
        },
        text: {
          fontSize: 18,
          marginBottom: hp('5%'),
          color: '#FFF'
        },
          logincontainer: {
           justifyContent: 'center',
           marginTop: hp('10%'),
           marginLeft: wp('10%')
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
          themeButton: {
            width: wp('80%'),
            height: wp('12%'),
            marginTop: hp('5%'),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F4FDFF',
            borderRadius: 8,
          },
          continueText: {
            fontSize: 16,
            color: '#17BED0',
          },
})