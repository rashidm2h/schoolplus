import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View,BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Header from '../../components/DashboardHeader';
import { useIsFocused } from '@react-navigation/native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const AdminDashboard = ({navigation}) => {
  const isFocused = useIsFocused();
  let mobile = '';
  let branch = '';
  let studentId = '';

  const [domain, setdomain] = useState('');
  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack() && isFocused) {  
        BackHandler.exitApp();
        return true; 
      } else {
        
        navigation.goBack();
        return true; 
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isFocused, navigation]);

  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      setdomain(value);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => {
          navigation.navigate('Notifications');
        }}
        branchSwitch={() => navigation.navigate('AdminSwitchBranch')}
      />

      <Pressable
        style={[styles.box, {backgroundColor: '#FEC107'}]}
        onPress={() => {
          navigation.navigate('StudentDetails');
        }}>
        <Icon name="school" size={34} color="white" />
        <Text style={styles.title}>STUDENT DETAILS</Text>
      </Pressable>
      <Pressable
        style={[styles.box, {backgroundColor: '#4CB050'}]}
        onPress={() => {
          navigation.navigate('Attendance');
        }}>
        <Icon name="checkbox-marked-circle-outline" size={34} color="white" />

        <Text style={styles.title}>ATTENDANCE</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('TimeTable');
        }}
        style={[styles.box, {backgroundColor: '#EA1E63'}]}>
        <Icon name="calendar-range-outline" size={34} color="white" />

        <Text style={styles.title}>TIME TABLE</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('StaffDetails');
        }}
        style={[styles.box, {backgroundColor: '#673BB7'}]}>
        <Icon name="account-multiple" size={34} color="white" />

        <Text style={styles.title}>STAFF DETAILS</Text>
      </Pressable>
      {/* {domain !== 'avk.schoolplusapp.com' && (
        <Pressable
          onPress={() => {
            navigation.navigate('AdminFee');
          }}
          style={[styles.box, {backgroundColor: '#EA1E63'}]}>
          <Icon name="currency-usd" size={34} color="white" />

          <Text style={styles.title}>FEES MANAGEMENT</Text>
        </Pressable>
      )} */}
      {domain === 'avk.schoolplusapp.com' ? (
        <Pressable
          onPress={() => {
            navigation.navigate('Exam');
          }}
          style={[styles.box, {backgroundColor: 'red'}]}>
          <Icon name="file-document" size={34} color="white" />

          <Text style={styles.title}>EXAM RESULTS</Text>
        </Pressable>
      ) : null}
      {/* <View style={styles.lastBox}> */}
        <Pressable
          onPress={() => {
            navigation.navigate('Events');
          }}
          style={[styles.box, {backgroundColor: '#8CC447'}]}>
          <Icon name="calendar" size={34} color="white" />

          <Text style={styles.title}>EVENTS</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate('Notes');
          }}
          style={[styles.box, {backgroundColor: '#607D8B'}]}>
          <Icon name="message-processing-outline" size={34} color="white" />

          <Text style={styles.title}>NOTES</Text>
        </Pressable>
      </View>
    // </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  box: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    paddingLeft: wp('6.4%'),
  },
  title: {
    color: 'white',
    fontSize: wp('5.5%'),
    marginLeft: wp('3%'),
  },
  lastBox: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  smallBox: {
    flex: 1,
    flexDirection: 'row',
    height: hp('16%'),
    paddingLeft: hp('0.7%'),
    alignItems: 'center',
  },
});
