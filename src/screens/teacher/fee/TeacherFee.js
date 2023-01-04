import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {DOMParser} from 'xmldom';
import NetInfo from '@react-native-community/netinfo';
// import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';

const TeacherFee = ({route, navigation}) => {
  const [nodata, setnodata] = useState(true);
  const [visible, setvisible] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [noDataView, setnoDataView] = useState(' ');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dataSourcetwo, setdataSourcetwo] = useState('');
  const parser = new DOMParser();

  useEffect(() => {
    AsyncStorage.getItem('acess_token').then(keyValue => {
      fetchData(keyValue);
    });
  }, []);

  const getData = data => {
    fetch(`${GLOBALS.TEACHER_URL}AttClassListForTeacher`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
        <AttClassListForTeacher xmlns="http://www.m2hinfotech.com//">
        <teacherMobNo>${data}</teacherMobNo>
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
        const result = parser
          .parseFromString(response)
          .getElementsByTagName('AttClassListForTeacherResult')[0]
          .childNodes[0].nodeValue;
        if (result === 'failure') {
          setnodata(false);
        } else {
          const feeclass = JSON.parse(result);
          const dropData = feeclass.map(element => ({
            value: element.BranchClassId,
            label: element.Class,
          }));
          setdropdownSource(dropData);
          setdropdownValue(feeclass[0].BranchClassId);
          setisLoading(false);
        }
      });
  };

  const fetchData = data => {
    NetInfo.fetch().then(state => {
      if (state.isConnected === false) {
        setisLoading(false);
        Alert(
          'You are offline!',
          'Please make sure you are connected to internet and try again!',
        );
      } else {
        getData(data);
      }
    });
  };

  const OnSubmitClick = () => {
    if (dropdownValue === '') {
      Alert.alert('Choose Class', 'Please choose class and then try!');
    } else {
      setisLoading(true);
      setdataSourcetwo(' ');
      fetch(`${GLOBALS.TEACHER_URL}StdAttClasswiseList`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
  <StdAttClasswiseList xmlns="http://www.m2hinfotech.com//">
  <BranchclsId>${dropdownValue}</BranchclsId>
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
          const result = parser
            .parseFromString(response)
            .getElementsByTagName('StdAttClasswiseListResult')[0]
            .childNodes[0].nodeValue;
          if (result === 'failure') {
            setisLoading(false);
            setnoDataView(false);
          } else {
            const output = JSON.parse(result);
            setdataSourcetwo(output);
            setisLoading(false);
            setvisible(true);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const Alert = (title, description) => {
    Alert.alert(
      title,
      description,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  };

  return nodata === false ? (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.containerData}>
        <View style={styles.noData}>
          <Text style={styles.notDataText}>No Class Assigned </Text>
        </View>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.containerData}>
        <View style={styles.picker_Buttonview}>
          <View style={styles.pickerviews}>
            {/* <Dropdown
              inputContainerStyle={{borderBottomColor: 'transparent'}}
              data={dropdownSource}
              baseColor="transparent"
              style={styles.pickerStyle}
              textColor="#121214"
              selectedItemColor="#7A7A7A"
              value={dropdownValue}
              onChangeText={value => {
                setdropdownValue(value);
              }}
            /> */}
          </View>
          <TouchableOpacity
            style={styles.buttonView}
            title="SUBMIT"
            color="#17BED0"
            onPress={() => {
              OnSubmitClick();
            }}>
            <Text style={styles.buttonText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.containerTable}>
          {!noDataView && (
            <View style={styles.noDataView}>
              <Text style={styles.notDataText}>No Students Available</Text>
            </View>
          )}
          {visible && (
            <View style={styles.containerTableHeadingView}>
              <View style={styles.textBoxRollNo}>
                <Text style={styles.textcs}>RL NO</Text>
              </View>
              <View style={styles.textBoxSname}>
                <Text style={styles.textcs}>STUDENT NAME</Text>
              </View>
            </View>
          )}
          <View style={styles.FlatlistTable}>
            {isLoading && (
              <ActivityIndicator
                style={styles.progressBar}
                color="#C00"
                size="large"
              />
            )}
            {visible && (
              <FlatList
                data={dataSourcetwo}
                renderItem={({item}) => (
                  <View style={styles.flatitemStyles}>
                    <View style={styles.itemones}>
                      <Text style={styles.flatitems}>{item.RollNo}</Text>
                    </View>
                    <View style={styles.itemtwos}>
                      <Text style={styles.flatitems}>{item.Name}</Text>
                    </View>
                    <View style={styles.itemthrees}>
                      <Button
                        title="Add Fee"
                        color="#DD2C00"
                        onPress={() => {
                          const Stdid = item.StudId;
                          navigation.navigate('TeacherFeeStructure', {Stdid});
                        }}
                      />
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noData: {
    marginTop: 80,
    alignItems: 'center',
  },
  noDataView: {
    flex: 1,
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  containerData: {
    flex: 8,
    elevation: 1,
    ...Platform.select({
      ios: {
        backgroundColor: '#FFFFFF',
      },
    }),
  },
  picker_Buttonview: {
    flex: 0.5,
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
      },
    }),
  },
  containerTable: {
    flex: 6,
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
    ...Platform.select({
      ios: {
        backgroundColor: '#FFFFFF',
      },
    }),
  },
  pickerviews: {
    flex: 1,
    marginRight: 2.5,
  },
  pickerStyle: {
    justifyContent: 'center',
    borderColor: '#CFCFCF',
    backgroundColor: '#FFF',
    borderWidth: 1,
    height: 37,
  },
  buttonView: {
    marginLeft: 2.5,
    height: 36,
    flex: 1,
    borderRadius: 2,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#17BED0',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textBoxRollNo: {
    height: 40,
    flex: 1,
    elevation: 2,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  textBoxSname: {
    height: 40,
    flex: 7,
    elevation: 2,
    backgroundColor: '#B866C6',
    paddingLeft: 10,
    justifyContent: 'center',
  },
  containerTableHeadingView: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  FlatlistTable: {
    flex: 7,
    flexDirection: 'column',
  },
  textcs: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  flatitemStyles: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
  },
  itemones: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#C7C7C7',
  },
  itemtwos: {
    flex: 5,
    marginLeft: 10,
    justifyContent: 'center',
  },
  itemthrees: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  progressBar: {
    flex: 1,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
  },
});
export default TeacherFee;
