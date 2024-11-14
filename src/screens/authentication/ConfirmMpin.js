import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Fontisto";
import Reanimated, {  FadeInUp } from 'react-native-reanimated'
import * as React from "react";
import {
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from 'react-native-responsive-screen';
import {DOMParser} from 'xmldom';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import GLOBALS from '../../config/Globals';

const { width } = Dimensions.get("window");


const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "space", '0', "delete"];
const passcodeLength = 4;
const _keySize = width / 4;
const _passcodeSpacing = (width - 3 * _keySize) / 2;
const _passCodeSize = width / (passcodeLength + 2);


const PassCodeKeyboard = ({ onPress }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: _passcodeSpacing,
        alignItems: "center",
      }}>
      {keys.map((key) => {
        if (key === "space") {
          return <View style={{ width: _keySize }} key="space" />;
        }
        return (
          <TouchableOpacity
            onPress={() => onPress(key)}
            key={key}
            style={{
              width: _keySize,
              height: _keySize,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <View>
              {key === "delete" ? (
                <MaterialCommunityIcons
                  name="keyboard-backspace"
                  size={42}
                  color="rgba(0,0,0,0.3)"
                />
              ) : (
                <Text
                  style={{ color: "#000", fontSize: 32, fontWeight: "700" }}>
                  {key}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
    const PassCode = ({ passcode}) => {
        return (
          <View
            style={{
              flexDirection: "row",
              marginVertical: _passcodeSpacing,
            }}>
            {[...Array(passcodeLength).keys()].map((i) => {
              return (
                <Reanimated.View entering={FadeInUp.delay(200 * i)}
                  key={`passcode-${i}-${passcode[i]}`}
                  style={{
                    width: _passCodeSize,
                    height: _passCodeSize,
                    borderRadius: _passCodeSize,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    marginHorizontal: 5, 
                  }}>
                  {passcode[i] && (
                    <View
                      style={{
                        backgroundColor: "#17BED0",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        borderRadius: _passCodeSize,
                      }}>
                      <Text
                        style={{
                          fontSize: _passCodeSize / 2,
                          color: "#fff",
                          fontWeight: "700",
                        }}>
                        {passcode[i]}
                      </Text>
                    </View>
                  )}
                </Reanimated.View>
              );
            })}
          </View>
        );
      };

export default function PassCodeV1({ navigation, route }) {
  const { enteredPin } = route.params;
  const [confirmPasscode, setConfirmPasscode] = React.useState([]); 
  const [isValid, setIsValid] = React.useState(false);
  const [loading,setloading] =React.useState('')
  const [spinnerValue, setspinnerValue] = React.useState(false);

  React.useEffect(() => {
    if (confirmPasscode.length === 4) {
     
      if (confirmPasscode.join('') === enteredPin) {
        setIsValid(true);
       
        InsertLoginPin();
      } else {
        Alert.alert("Invalid PIN", "The confirmed PIN does not match the entered PIN. Please try again.");
        navigation.navigate('MPin')
        setIsValid(false);
      }
    }
  }, [confirmPasscode, enteredPin]);

  const InsertLoginPin =  async () => {
    const pin = confirmPasscode.join('');
    const fcmToken = '';
    try {
        const phoneNumber = await AsyncStorage.getItem('access_token');
        const response = await fetch(`${GLOBALS.PARENT_SERVICE}InsertLoginPin`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
        <InsertLoginPin xmlns="http://www.m2hinfotech.com//">
          <mobile>${phoneNumber}</mobile>
          <sessionId>${Platform.OS}</sessionId>
          <deviceId>${fcmToken}</deviceId>
          <pinNumber>${pin}</pinNumber>         
        </InsertLoginPin>
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
        
        const pinregResult = xmlDoc.getElementsByTagName('InsertLoginPinResult')[0].childNodes[0].nodeValue;
          if (pinregResult === 'Successfully Inserted') {
           navigation.navigate('LoginPage')
          } 
          else {
            Alert.alert('Pin creation failed', 'Can not insert the pin.');
            }
    }catch (error) {
      Alert.alert('Pin creation failed', 'Can not insert the pin.');
    } finally {
      setloading(false);
    }
  };      

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop:hp('8%')}}>
      <StatusBar hidden />
      <Icon
                  name='locked'
                  size={42}
                  color='#000'
                />
       <Text
          style={{
            fontSize: 28,
            paddingHorizontal: _passcodeSpacing * 1,
            textAlign: "center",
            color: "#000",
            marginTop: hp('2%'),
            fontWeight:'600'
          }}>
        Confirm your Pin
      </Text>
      <Text
          style={{
            fontSize: 16,
            paddingHorizontal: _passcodeSpacing * 2,
            textAlign: "center",
            color: "#000",
            marginTop: hp('2%'),
          }}>
          Please enter 4-digit pin to secure signup
        </Text>
      <PassCode
        passcode={confirmPasscode}
        // isValid={confirmPasscode.length !== passcodeLength || isValid}
      />
      <PassCodeKeyboard
        onPress={(char) => {
          if (char === "delete") {
            setConfirmPasscode((prev) =>
              prev.length === 0 ? [] : prev.slice(0, prev.length - 1)
            );
            return;
          }
          if (confirmPasscode.length === passcodeLength) {
            return; 
          }
          setConfirmPasscode((prev) => [...prev, char]);
        }}
      />
    </View>
  );
}
