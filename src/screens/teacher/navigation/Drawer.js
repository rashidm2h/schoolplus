import React, {useEffect, useState} from 'react';
import {DOMParser} from 'xmldom';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';
import DrawerItem from '../../../components/DrawerItem';

const Drawer = ({navigation}) => {
  let role = '';
  const [subName, setsubName] = useState('');
  const [fullName, setfullName] = useState('');
  const [className, setclassName] = useState('');
  const [domainName, setdomainName] = useState('');
  const [evaluation, setevaluation] = useState(false);

  useEffect(() => {
    getRole();
    AsyncStorage.getItem('domain').then(
      keyValue => {
        setdomainName(keyValue);
      },
      error => {
        console.log(error);
      },
    );
  }, []);

  const getRole = () => {
    AsyncStorage.getItem('role').then(
      keyValue => {
        role = keyValue;
        if (role === 'T,H' || role === 'PT,H' || role === 'PPT,H') {
          setevaluation(true);
        }
        getTeacherDetail();
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  const getTeacherDetail = () => {
    AsyncStorage.getItem('acess_token').then(username => {
      AsyncStorage.getItem('BranchID').then(branchName => {
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetTeacherDetails`, {
          method: 'POST',
          body: `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://www.m2hinfotech.com//">
<soap:Header/>
<soap:Body>
  <ns:GetTeacherDetails>
     <ns:phoneNo>${username}</ns:phoneNo>
  <ns:branchId>${branchName}</ns:branchId>
     </ns:GetTeacherDetails>
</soap:Body>
</soap:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName('GetTeacherDetailsResult')[0]
              .childNodes[0].nodeValue;
            if (v === 'failure') {
              console.log('failure');
            } else {
              const rslt = JSON.parse(v);
              let SubName = rslt[0].SubName;
              if (SubName === null) {
                SubName = 'None';
              }
              let ClassName = rslt[0].Class;
              if (ClassName === null) {
                ClassName = 'None';
              }
              setfullName(rslt[0].FullName);
              setsubName(SubName);
              setclassName(
                ClassName !== 'None' &&
                  ClassName !== undefined &&
                  ClassName !== null
                  ? ClassName
                  : '',
              );
            }
          })
          .catch(error => {
            console.log(error);
          });
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{`${fullName}`}</Text>
        <Text style={styles.class}>{`Subject: ${subName}`}</Text>
        <Text style={styles.class}>{`Class: ${className}`}</Text>
      </View>
      <DrawerItem
        onPress={() => {
          navigation.navigate('TeacherStudentDetails');
        }}
        text="STUDENT DETAILS"
        icon="school"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('TeacherAttendance');
        }}
        text="ATTENDANCE"
        icon="checkbox-marked-circle-outline"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('TeacherTimeTable');
        }}
        text="TIMETABLE"
        icon="calendar-range-outline"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('TeacherExam');
        }}
        text="EXAM"
        icon="file-document"
      />
      {/* {domainName !== 'avk.schoolplusapp.com' ? (
        <DrawerItem
          text="FEES MANAGEMENT"
          icon="currency-usd"
          onPress={() => {
            navigation.navigate('TeacherFee');
          }}
        />
      ) : null} */}
      <DrawerItem
        onPress={() => {
          navigation.navigate('TeacherEvents');
        }}
        text="EVENTS"
        icon="calendar"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('TeacherNotes');
        }}
        text="NOTES"
        icon="message-processing-outline"
      />
      {evaluation ? (
        <DrawerItem
          onPress={() => {
            navigation.navigate('TeacherAcademicYear');
          }}
          text="EVALUATION"
          icon="account-group"
        />
      ) : null}
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
    fontSize: 16,
  },
  class: {
    color: 'white',
    fontSize: 16,
  },
});
