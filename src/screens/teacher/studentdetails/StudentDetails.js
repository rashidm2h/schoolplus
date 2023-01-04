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
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';

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
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getStudentList = classValue => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}StudentListForClassTeacher`, {
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
          <Dropdown
            data={dropdowndata}
            textColor="#121214"
            icon="chevron-down"
            value={dropdownValue}
            baseColor="transparent"
            selectedItemColor="#7A7A7A"
            underlineColor="transparent"
            onChangeText={setdropdownValue}
            containerStyle={styles.pickerStyle}
            inputContainerStyle={styles.inputContainer}
          />
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
    height: 30,
    elevation: 1,
    marginLeft: 10,
    marginRight: 10,
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
    elevation: 0.5,
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
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {borderBottomColor: 'transparent'},
  headingTableView: {
    flex: 0.1,
    elevation: 3,
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  textcontaineone: {
    flex: 0.8,
    borderRightWidth: 1,
    alignItems: 'center',
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    backgroundColor: '#B866C6',
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#B866C6',
    paddingLeft: 10,
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: 1,
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
    paddingTop: 10,
    borderWidth: 0.5,
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'stretch',
    flex: 1,
    paddingLeft: 2,
    marginLeft: 10,
    ...Platform.select({
      ios: {
        height: 30,
        borderRadius: 3,
        paddingBottom: 15,
        marginLeft: 10,
      },
      android: {
        height: 35,
      },
    }),
  },
  textc: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  item: {
    fontSize: 14,
    flex: 1,
  },
  itemone: {
    flex: 0.8,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemthree: {
    flex: 1.2,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
});

export default StudentDetails;
