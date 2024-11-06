import React, {useEffect, useState} from 'react';
import {DOMParser} from 'xmldom';
import {CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, Alert, FlatList, Pressable, Text, View} from 'react-native';
import GLOBALS from '../../../config/Globals';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { log } from 'react-native-reanimated';
const AN = () => {
  const [data, setdata] = useState('');
  const [checked, setchecked] = useState([]);
  const parser = new DOMParser();

  useEffect(() => {
    accessdataFN();
  }, []);

  const checkItem = item => {
    if (!checked.includes(item.StudId)) {
      setchecked([...checked, item.StudId]);
    } else {
      setchecked(checked.filter(a => a !== item.StudId));
    }
  };

  const onFinalPress = () => {
    let studidData = [];
    for (let t = 0; t < checked.length; t++) {
      studidData.push({Stud_Id: checked[t]});
    }
    onData(studidData);
  };

  const onData = dataSet => {
    let arr2 = JSON.stringify(dataSet);
    let arr3 = JSON.parse(arr2);
    let count = 0;
    let attendancestatus;
    for (var i = 0; i < arr3.length; i++) {
      if (arr3[i].Stud_Id !== '') {
        count++;
      }
    }
    attendancestatus = count > 0 ? 'SomePresent' : 'AllPresent';
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('bclsatt').then(
          keyValue2 => {
            fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=StdAttInsertion`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <StdAttInsertion xmlns="http://www.m2hinfotech.com//">
        <BclsId>${keyValue2}</BclsId>
        <teacherMobNo>${keyValue}</teacherMobNo>
        <DayStatus>AN</DayStatus>
        <StdIds>${arr2}</StdIds>
        <MainStatus>${attendancestatus}</MainStatus>
      </StdAttInsertion>
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
                var result = parser
                  .parseFromString(response)
                  .getElementsByTagName('StdAttInsertionResult')[0]
                  .childNodes[0].nodeValue;
                if (result === 'AlreadyExist') {
                  Alert.alert(
                    'Attendance',
                    "Today's Attendance Already Taken  !..",
                  );
                } else if (result === 'success') {
                  Alert.alert(
                    'Attendance',
                    'Attendance has been registered Successfully !',
                  );
                } else if (result === 'failure') {
                  Alert.alert(
                    'Failure',
                    'Attendance insertion failed! Try Again!',
                  );
                }else if (result === 'Failure: Cannot insert past date.') {
                  Alert.alert(
                    'Failure',
                    'Attendance insertion After Date is not Possible',
                  );
                }else if (result === 'Failure: Not in the forenoon.') {
                  Alert.alert(
                    'Please insert in Afternoon',
                    'Afternoon attendance cannot insert in forenoon',
                  );
                }else if (result === 'Failure') {
                  Alert.alert(
                    'Failure',
                    'Attendance insertion failed! Try Again!',
                  );
                } else {
                  Alert.alert('Error', 'Unexpected error occured! Try Again !');
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

  const accessdataFN = () => {
    AsyncStorage.getItem('bclsatt').then(
      keyValue => {
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=StdAttClasswiseList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <StdAttClasswiseList xmlns="http://www.m2hinfotech.com//">
        <BranchclsId>${keyValue}</BranchclsId>
      </StdAttClasswiseList>
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
            var result = parser
              .parseFromString(response)
              .getElementsByTagName('StdAttClasswiseListResult')[0]
              .childNodes[0].nodeValue;
            if (result === 'failure') {
              console.log('failure');
            } else {
              var rslt = JSON.parse(result);
              setdata(rslt);
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

  return (
    <View style={styles.container}>
      <View style={styles.flatlistTitle}>
        <View style={styles.textcontainone}>
          <Text style={styles.titleText1} />
        </View>
        <View style={styles.line} />
        <View style={styles.textcontaintwo}>
          <Text style={styles.titleText2}>RL NO</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>STUDENT NAME</Text>
        </View>
      </View>
      <View style={styles.flatlistStyle}>
        <FlatList
          data={data}
          renderItem={({item, index}) => (
            <View style={styles.itemStyle}>
              <View style={styles.textcontentone}>
                <CheckBox
                  onPress={() => checkItem(item)}
                  containerStyle={styles.containerStyle}
                  checked={!checked.includes(item.StudId)}
                />
              </View>
              <View style={styles.textcontenttwo}>
                <Text>{item.RollNo}</Text>
              </View>
              <View style={styles.textcontentthree}>
                <Text style={styles.item2}>{item.Name}</Text>
              </View>
            </View>
          )}
        />
      </View>
      <Pressable style={styles.buttonstyle} onPress={() => onFinalPress()}>
        <View style={styles.topcontentimagelogo}>
          <Icon name="checkbox-marked-circle-outline" size={25} color="white" />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  line: {
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#FFFFFF',
  },
  containerStyle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: wp('13%'),
    backgroundColor: '#BA69C8',
    elevation: 3,
  },
  titleText1: {
    justifyContent: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: wp('3%'),
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: wp('3%'),
  },
  textcontainone: {
    flex: 1,
    backgroundColor: '#B866C6',
    justifyContent: 'center',
  },
  textcontaintwo: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#B866C6',
    alignItems: 'center',
  },
  textcontainthree: {
    flex: 3,
    backgroundColor: '#B866C6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textcontentone: {
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontenttwo: {
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontentthree: {
    flex: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  itemStyle: {
    flexDirection: 'row',
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#E0E0E0',
  },
  flatlistStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
  item2: {
    marginLeft: wp('4%'),
  },
  buttonstyle: {
    alignSelf: 'flex-end',
    height: wp('16.5%'),
    width: wp('16.5%'),
    borderRadius: wp('16%'),
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    right: wp('9%'),
    bottom: wp('7%'),
  },
  topcontentimagelogo: {
    height: wp('8%'),
    width: wp('8%'),
  },
});
export default AN;
