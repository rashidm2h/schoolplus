import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Text,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Logo from '../../images/logo.png';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {DOMParser} from 'xmldom';
import OneSignal from 'react-native-onesignal';
import GLOBALS from '../../config/Globals';

const MobLogin = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={Logo} />
      </View>
      <View style={styles.buttoncontainer}>
        <Pressable
          android_ripple
          style={styles.buttonStyle}
          onPress={() => navigation.navigate('LoginPage')}>
          <Text style={styles.text}>Login</Text>
        </Pressable>
        <Pressable
          android_ripple
          style={styles.buttonStyle}
          onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.text}>Signup</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default MobLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17BED0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp('35%'),
    height: wp('50%'),
    resizeMode: 'contain',
  },
  buttoncontainer: {
    position: 'absolute',
    bottom: hp('10%'),
    alignItems: 'center',
  },
  buttonStyle: {
    backgroundColor: '#F4FDFF',
    marginTop: hp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('70%'),
    height: wp('12%'),
    borderRadius: 8,
  },
  text: {
    color: '#09A7BF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
