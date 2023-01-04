import React, {useEffect, useState} from 'react';
import {DOMParser} from 'xmldom';
// import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, Alert, Platform, Pressable, Text, View} from 'react-native';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';

const Attendance = ({navigation}) => {
  const [data, setdata] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');

  useEffect(() => {
    onPressButtonPOST();
  }, []);

  const onPressButtonPOST = () => {
    AsyncStorage.getItem('acess_token')
      .then(keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}AttClassListForTeacher`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
          <AttClassListForTeacher xmlns="http://www.m2hinfotech.com//">
          <teacherMobNo>${keyValue}</teacherMobNo>
          </AttClassListForTeacher>
          </soap12:Body>
          </soap12:Envelope>
          `,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            window.DOMParser = require('xmldom').DOMParser;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const result = xmlDoc.getElementsByTagName(
              'AttClassListForTeacherResult',
            )[0].childNodes[0].nodeValue;
            if (result !== 'failure') {
              const output = JSON.parse(result);
              const dropData = output.map(element => ({
                value: element.BranchClassId,
                label: element.Class,
              }));
              setdata(dropData);
              setdropdownValue(output[0].BranchClassId);
            }
          });
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onPressClass = () => {
    if (dropdownValue === '') {
      Alert.alert('Choose Class', 'Please choose class and then try!');
    } else {
      const branhcids = dropdownValue;
      AsyncStorage.setItem('bclsatt', branhcids);
      navigation.navigate('TeacherAttendanceMain');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.pickerview}>
        <View style={styles.container}>
          {/* <Dropdown
            inputContainerStyle={{borderBottomColor: 'transparent'}}
            data={data}
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            containerStyle={styles.pickerStyle}
            textColor="#121214"
            selectedItemColor="#7A7A7A"
            value={dropdownValue}
            onChangeText={value => {
              setdropdownValue(value);
            }}
          /> */}
        </View>
        <View style={styles.buttonView}>
          <Pressable onPress={() => onPressClass()}>
            <Text style={styles.buttonText}>SUBMIT</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    width: 10,
    height: 40,
  },
  pickerview: {
    ...Platform.select({
      android: {
        flexDirection: 'row',
        marginTop: 20,
      },
      ios: {
        flexDirection: 'row',
        margin: 5,
        marginTop: 20,
        justifyContent: 'space-between',
      },
    }),
  },
  pickerStyle: {
    paddingTop: 10,
    marginLeft: 10,
    paddingLeft: 2,
    borderWidth: 0.5,
    alignItems: 'stretch',
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        height: 30,
        flex: 1,
        borderRadius: 3,
        paddingBottom: 15,
      },
      android: {
        height: 35,
        flex: 1,
      },
    }),
  },
  buttonView: {
    height: 30,
    flex: 1,
    borderRadius: 2,
    elevation: 1,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#17BED0',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default Attendance;
