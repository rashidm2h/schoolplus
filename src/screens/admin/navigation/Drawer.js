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
let role = '';
let path = '';

const Drawer = ({navigation}) => {
  const [fullName, setfullName] = useState('');
  const [evaluation, setevaluation] = useState(false);
  const [domain, setdomain] = useState('');
  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      setdomain(value);
    });
    AsyncStorage.getItem('role')
      .then(keyValue2 => {
        role = keyValue2;
        console.log('role', role);
        if (role === 'A,P' || role === 'AA,P') {
          setevaluation(true);
          path = 'AcademicYear';
        }
        if (role === 'A,C' || role === 'AA,C') {
          setevaluation(true);
          path = 'AcademicYear';
        }
      })
      .catch(error => {
        console.log(error);
      });
    getData();
  }, []);

  const getData = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      AsyncStorage.getItem('acess_token').then(keyValue => {
        // console.log(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetAdminDetailes`, `<?xml version="1.0" encoding="utf-8"?>
        //   <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        //     <soap12:Body>
        //     <GetAdminDetailes xmlns="http://www.m2hinfotech.com//">
        //       <senderNo>${keyValue}</senderNo>
        //       <branchId>${branchId}</branchId>
        //     </GetAdminDetailes>
        //     </soap12:Body>
        //   </soap12:Envelope>`)
        fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetAdminDetailes`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
            <GetAdminDetailes xmlns="http://www.m2hinfotech.com//">
              <senderNo>${keyValue}</senderNo>
              <branchId>${branchId}</branchId>
            </GetAdminDetailes>
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
            const v = xmlDoc.getElementsByTagName('GetAdminDetailesResult')[0]
              .childNodes[0].nodeValue;
            if (v === 'failure') {
              console.log('failure');
            } else {
              const rslt = JSON.parse(v);
              let SubName = rslt[0].Desigantion;
              if (SubName === null) {
                SubName = 'None';
              }
              let ClassName = rslt[0].Class;
              if (ClassName === null) {
                ClassName = 'None';
              }
              setfullName(rslt[0].Name);
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
      </View>
      <DrawerItem
        onPress={() => {
          navigation.navigate('StudentDetails');
        }}
        text="STUDENT DETAILS"
        icon="school"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('Attendance');
        }}
        text="ATTENDANCE"
        icon="checkbox-marked-circle-outline"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('TimeTable');
        }}
        text="TIMETABLE"
        icon="calendar-range-outline"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('StaffDetails');
        }}
        text="STAFF DETAILS"
        icon="account-multiple"
      />
      {domain === 'avk.schoolplusapp.com' ? (
        <DrawerItem
          onPress={() => {
            navigation.navigate('Exam');
          }}
          text="EXAM"
          icon="file-document"
        />
      ) : null}
      {/* {domain !== 'avk.schoolplusapp.com' ? ( */}
        {/* <DrawerItem
          onPress={() => {
            navigation.navigate('AdminFee');
          }}
          text="FEE"
          icon="currency-usd"
        /> */}
      {/* ) : null} */}
      <DrawerItem
        onPress={() => {
          navigation.navigate('Events');
        }}
        text="EVENTS"
        icon="calendar"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('Notes');
        }}
        text="NOTES"
        icon="message-processing-outline"
      />
      {evaluation ? (
        <DrawerItem
          onPress={() => {
            navigation.navigate(path);
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
