import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Alert,
  Platform,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import {DOMParser} from 'xmldom';
import {Dropdown} from 'react-native-element-dropdown';
import {Dropdown1} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const StudentDetails = ({navigation}) => {
  const [data, setdata] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdowndata, setdropdowndata] = useState([]);
  const parser = new DOMParser();
  useEffect(() => {
    classDropdownFill();
  }, []);

  const classDropdownFill = () => {
    AsyncStorage.getItem('acess_token')
      .then(keyValue => {
        AsyncStorage.getItem('BranchID').then(keyValue1 => {
          fetch(`${GLOBALS.TEACHER_SERVICE}AttClassListForTeacher`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
          <AttClassListForTeacher xmlns="http://www.m2hinfotech.com//">
          <teacherMobNo>${keyValue}</teacherMobNo>
           <BranchId>${keyValue1}</BranchId>
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
              const xmlDoc = parser.parseFromString(response);
              const result = xmlDoc.getElementsByTagName(
                'AttClassListForTeacherResult',
              )[0].childNodes[0].nodeValue;
              if (result === 'failure') {
                console.log('failure');
              } else {
                const output = JSON.parse(result);
                const dropData = output.map(element => ({
                  value: element.BranchClassId,
                  label: element.Class,
                }));
                setdropdowndata(dropData);
                setdropdownValue(output[0].BranchClassId);
                getStudentList(output[0].BranchClassId);
              }
            });
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getStudentList = classValue => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_SERVICE}StudentListForClassTeacher`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
                  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                  <soap12:Body>
                  <StudentListForClassTeacher xmlns="http://www.m2hinfotech.com//">
                  <teacherMobNo>${keyValue}</teacherMobNo>
                  <BranchClassId>${classValue}</BranchClassId>
                  </StudentListForClassTeacher>
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
            const xmlDoc = parser.parseFromString(response);
            const result = xmlDoc.getElementsByTagName(
              'StudentListForClassTeacherResult',
            )[0].childNodes[0].nodeValue;
            if (result === 'failure') {
              Alert.alert(
                '',
                'It seems like you are not assigned to any class!',
              );
            } else {
              const output = JSON.parse(result);
              setdata(output);
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
  };

  const pressAction = item => {
    AsyncStorage.setItem('StdID', item.StudId);
    navigation.navigate('TeacherStudentDetails2', {
      screen: 'TeacherDashboard',
    });
  };

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.pickerview}>
        <View style={styles.container}>
          {Platform.OS === 'ios' ? (
            <Dropdown
              data={dropdowndata}
              textColor="#000"
              value={dropdownValue}
              selectedItemColor="#000"
              labelField="label"
              valueField="value"
              onChange={item => {
                setdropdownValue(item.value);
              }}
              inputContainerStyle={styles.inputContainer}
              style={styles.dropdownStyle}
              selectedTextStyle={styles.selectedTextStyle1}
            />
          ) : (
            <Dropdown1
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdowndata}
              value={dropdownValue}
              onChangeText={value => {
                setdropdownValue(value);
              }}
            />
          )}
        </View>
        <View style={styles.buttonView}>
          <Pressable onPress={() => getStudentList(dropdownValue)}>
            <Text style={styles.buttonText}>SUBMIT</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.containerTable}>
        <View style={styles.headingTableView}>
          <View style={styles.textcontaineone}>
            <Text style={styles.textc}>RL NO</Text>
          </View>
          <View style={styles.textcontaintwo}>
            <Text style={styles.textc}>STUDENT NAME</Text>
          </View>
          <View style={styles.textcontainthree}>
            <Text style={styles.textc}>CLASS and DIV</Text>
          </View>
        </View>
        <View style={styles.flatlistView}>
          <FlatList
            data={data}
            renderItem={({item}) => (
              <Pressable onPress={() => pressAction(item)}>
                <View style={styles.itemStyle}>
                  <View style={styles.itemone}>
                    <Text style={styles.item}>{item.RollNo}</Text>
                  </View>
                  <View style={styles.itemtwo}>
                    <Text style={styles.item}>{item.StudName}</Text>
                  </View>
                  <View style={styles.itemthree}>
                    <Text style={styles.item}>
                      {`${item.ClassNo} ${item.DivCode}`}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonView: {
    flex: 1,
    height: wp('10.5%'),
    elevation: 1,
    marginLeft: wp('3%'),
    marginRight: wp('3%'),
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17BED0',
  },
  container: {
    flex: 1,
  },
  containertop: {
    flex: 1,
    elevation: 3,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
  },
  containerTable: {
    flex: 7,
    elevation: wp('0.3%'),
    shadowRadius: 4,
    shadowOpacity: 0.5,
    shadowColor: '#000000',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
  },
  pickerview: {
    marginVertical: wp('4%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: wp('0.7%'),
  },
  inputContainer: {borderBottomColor: 'transparent'},
  headingTableView: {
    flex: 0.1,
    elevation: wp('1%'),
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  textcontaineone: {
    flex: 0.8,
    borderRightWidth: wp('0.2%'),
    alignItems: 'center',
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    backgroundColor: '#B866C6',
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#B866C6',
    // paddingLeft: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: wp('0.2%'),
  },
  textcontainthree: {
    flex: 1.2,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatlistView: {
    flex: 6,
    flexGrow: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  pickerStyle: {
    paddingTop: wp('3.5%'),
    borderWidth: wp('0.09%'),
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'stretch',
    flex: 1,
    paddingLeft: wp('1%'),
    marginLeft: wp('2%'),
    //responsive
    ...Platform.select({
      ios: {
        height: wp('7.5%'),
        borderRadius: 3,
        // paddingBottom: 15,
        marginLeft: 10,
      },
      android: {
        height: wp('8.75%'),
      },
    }),
  },
  dropdownStyle: {
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
    borderRadius: 1,
    marginRight: wp('3.5%'),
    borderWidth: wp('0.5%'),
    height: wp('11.5%'),
  },
  selectedTextStyle1: {
    fontSize: 16,
    color: '#121214',
    paddingLeft: wp('2%'),
  },
  textc: {
    fontSize: wp('3.8%'),
    color: '#FFFFFF',
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#D3D3D3',
  },
  item: {
    fontSize: 14,
    flex: 1,
  },
  itemone: {
    flex: 0.8,
    paddingTop: wp('2.5%'),
    paddingBottom: wp('2.5%'),
    alignItems: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    paddingTop: wp('2.5%'),
    paddingBottom: wp('2.5%'),
    alignItems: 'center',
    // marginLeft: wp('2.5%'),
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  itemthree: {
    flex: 1.2,
    paddingTop: wp('2.5%'),
    paddingBottom: wp('2.5%'),
    alignItems: 'center',
  },
});

export default StudentDetails;
