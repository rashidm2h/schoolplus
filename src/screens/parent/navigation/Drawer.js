import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import DrawerItem from '../../../components/DrawerItem';
import GLOBALS from '../../../config/Globals';

const Drawer = ({navigation}) => {
  let role = '';
  let studentId = '';

  const [profilepic, setprofilepic] = useState('');
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [classNo, setclassNo] = useState('');
  const [classDiv, setclassDiv] = useState('');
  const [domain, setdomain] = useState('');
  AsyncStorage.getItem('StdID').then(value => {
    studentId = value;
  });

  useEffect(() => {
    AsyncStorage.getItem('domain').then(data => {
      setdomain(data);
    });
    getRole();
  }, []);

  const getRole = () => {
    AsyncStorage.getItem('role').then(
      keyValue => {
        role = keyValue;
        getStdDetail();
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  const getStdDetail = () => {
    let phno;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        phno = keyValue;
        AsyncStorage.getItem('BranchID').then(
          keyValue2 => {
            const branch = keyValue2;
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStudIdForParent`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
                    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                <GetStudIdForParent xmlns="http://www.m2hinfotech.com//">
                <mobile>${phno}</mobile>
                <Branch>${branch}</Branch>
                </GetStudIdForParent>
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
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(response);
                const ccc = xmlDoc.getElementsByTagName(
                  'GetStudIdForParentResult',
                )[0].childNodes[0].nodeValue;
                const output = JSON.parse(ccc);
                if (role === 'P' || role === 'PT' || role === 'SP') {
                  setprofilepic(output[0].Image);
                  setfirstName(output[0].FirstName);
                  setlastName(output[0].LastName);
                  setclassNo(output[0].ClassNo);
                  setclassDiv(output[0].DivCode);
                } else {
                  let numberid = '';
                  output.forEach((item, index) => {
                    if (studentId === item.StudentId) {
                      numberid = index;
                    }
                  });
                  setprofilepic(output[numberid].Image);
                  setfirstName(output[numberid].FirstName);
                  setlastName(output[numberid].LastName);
                  setclassNo(output[numberid].ClassNo);
                  setclassDiv(output[numberid].DivCode);
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
      <View style={styles.header}>
        <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
        <Text style={styles.class}>{`Class: ${classNo}${classDiv}`}</Text>
      </View>
      <DrawerItem
        onPress={() => {
          navigation.navigate('ParentStudentDetails');
        }}
        text="STUDENT DETAILS"
        icon="school"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('ParentExamResults');
        }}
        text="RESULTS"
        icon="checkbox-marked-circle-outline"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('ParentTimeTable');
        }}
        text="TIMETABLE"
        icon="calendar-range-outline"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('ParentExam');
        }}
        text="EXAM"
        icon="file-document"
      />
      {/* {domain !== 'avk.schoolplusapp.com' && (
        <DrawerItem
          text="FEE"
          icon="currency-usd"
          onPress={() => {
            navigation.navigate('ParentFee');
          }}
        />
      )} */}
      <DrawerItem
        onPress={() => {
          navigation.navigate('ParentEvents');
        }}
        text="EVENTS"
        icon="calendar"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('ParentNotes');
        }}
        text="NOTES"
        icon="message-processing-outline"
      />
    </View>
  );
};

export default Drawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13C0CE',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#607D8B',
    height: hp('25%'),
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
  class: {
    color: 'white',
    fontSize: wp('4%'),
  },
});
