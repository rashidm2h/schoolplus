import React, {useState, useEffect} from 'react';
import {StyleSheet, Pressable, FlatList, Text, View} from 'react-native';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Header from '../../components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Studentdetails = ({navigation}) => {
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [branch, setbranch] = useState('');
  let branchId = '';
  let username = '';

  useEffect(() => {
    getClasses();
  }, []);

  useEffect(() => {
    if (dropdownValue !== '') {
      getDivisions();
    }
  }, [dropdownValue]);

  const pressAction = item => {
    try {
      AsyncStorage.setItem('StdID', item.StudId);
      navigation.navigate('StudentDetails2');
    } catch (error) {
      console.log(`somthing went wrong: ${error}`);
    }
  };

  const getClasses = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      setbranch(BranchID);
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          username = keyValue;
          fetch(`${GLOBALS.PARENT_SERVICE}GetAllClasses`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetAllClasses xmlns="http://www.m2hinfotech.com//">
          <mobileNo>${username}</mobileNo>
          <Branch>${branchId}</Branch>
        </GetAllClasses>
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
              const ccc = xmlDoc.getElementsByTagName('GetAllClassesResult')[0]
                .childNodes[0].nodeValue;
              if (ccc === 'failure') {
                this.Alert(
                  '',
                  'It seems like you have no access to any class!',
                );
              } else {
                const output = JSON.parse(ccc);
                let dropdownData = output;
                const dropData = dropdownData.map(element => ({
                  value: element.class_Id,
                  label: element.Class_name,
                }));
                setdropdownSource(dropData);
                setdropdownValue(dropdownData[0].class_Id);
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
    });
  };

  const getDivisions = () => {
    setdata('');
    fetch(`${GLOBALS.PARENT_SERVICE}GetDivisions`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <GetDivisions xmlns="http://www.m2hinfotech.com//">
        <BranchID>${branch}</BranchID>
        <classId>${dropdownValue}</classId>
      </GetDivisions>
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
        const ccc =
          xmlDoc.getElementsByTagName('GetDivisionsResult')[0].childNodes[0]
            .nodeValue;
        if (ccc === 'failure') {
        } else {
          const output = JSON.parse(ccc);
          let dropdownData = output;
          const dropData = dropdownData.map(element => ({
            value: element.BranchClassId,
            label: element.DivCode,
          }));
          setdropdownSource1(dropData);
          setdropdownValue1(dropdownData[0].BranchClassId);
          getList(dropdownData[0].BranchClassId);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const getList = divId => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_SERVICE}StdAttClasswiseList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <StdAttClasswiseList xmlns="http://www.m2hinfotech.com//">
        <BranchclsId>${divId}</BranchclsId>
      </StdAttClasswiseList>
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
            const ccc = xmlDoc.getElementsByTagName(
              'StdAttClasswiseListResult',
            )[0].childNodes[0].nodeValue;
            if (ccc === 'failure') {
              setdata('');
              setdataerror(true);
            } else {
              const output = JSON.parse(ccc);
              setdata(output);
              setdataerror(false);
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      error => {
        console.log(error); //Display error
      },
    );
  };

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => {
          navigation.navigate('Notifications');
        }}
      />
      <View style={styles.classSelection}>
        <Dropdown
          icon="chevron-down"
          baseColor="transparent"
          underlineColor="transparent"
          inputContainerStyle={{borderBottomColor: 'transparent'}}
          containerStyle={styles.pickerStyle}
          data={dropdownSource}
          value={dropdownValue}
          onChangeText={value => {
            setdropdownValue(value);
          }}
        />
        <Dropdown
          icon="chevron-down"
          baseColor="transparent"
          underlineColor="transparent"
          inputContainerStyle={{borderBottomColor: 'transparent'}}
          containerStyle={styles.pickerStyle}
          data={dropdownSource1}
          value={dropdownValue1}
          onChangeText={value => {
            setdropdownValue1(value);
            getList(value);
          }}
        />
      </View>
      <View style={{flex: 1}}>
        {dataerror ? (
          <Text style={styles.notDataText}>No data found.</Text>
        ) : (
          <View style={styles.containerTable}>
            <View style={styles.headingTableView}>
              <View style={styles.textcontaineone}>
                <Text style={styles.textc}>RL NO</Text>
              </View>
              <View style={styles.textcontaintwo}>
                <Text style={styles.textc}>STUDENT NAME</Text>
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
                        <Text style={styles.item}>{item.Name}</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Studentdetails;

const styles = StyleSheet.create({
  icon: {
    width: 10,
    height: 40,
  },
  container: {
    flex: 1,
  },
  notDataText: {
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerTable: {
    elevation: 0.5,
    flex: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 4,
    shadowOpacity: 0.5,
  },
  headingTableView: {
    flex: 0.75,
    elevation: 3,
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  textcontaineone: {
    flex: 0.8,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#B866C6',
    paddingLeft: 10,
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: 1,
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
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
  classSelection: {
    flexDirection: 'row',
    //  height: 75,
    flex: 0.1,
    width: wp('100%'),
    paddingHorizontal:wp('1%')
  },
  pickerStyle: {
    height: 35,
    flex: 0.5,
    paddingTop: 10,
    paddingLeft: 5,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    margin: 5,
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 3,
  },
});
