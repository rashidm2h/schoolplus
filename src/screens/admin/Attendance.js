import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Text,
  View,
  Pressable,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { CheckBox } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Hyperlink from 'react-native-hyperlink';
import { DOMParser } from 'xmldom';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import GLOBALS from '../../config/Globals';
import Loader from '../../components/ProgressIndicator';
import Header from '../../components/Header';
import moment from 'moment';

const Attendance = ({ navigation }) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownSource1, setdropdownSource1] = useState([
    {
      label: 'FN',
      value: 'FN',
    },
    { label: 'AN', value: 'AN' },
  ]);
  const [dropdownValue1, setdropdownValue1] = useState('FN');
  const [dropdownSource2, setdropdownSource2] = useState([]);
  const [dropdownValue2, setdropdownValue2] = useState('');
  const [dateText, setdateText] = useState('');
  const [dataSourceEditcheck, setdataSourceEditcheck] = useState('');
  const [datacheck, setdatacheck] = useState('');
  const [datepickerVisible, setdatepickerVisible] = useState(false);
  const [unchecked, setunchecked] = useState([]);
  useEffect(() => {
    getClasses();
  }, []);

  const getClasses = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        let mobile = keyValue; //Display key value
        fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetAllClasses`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetAllClasses xmlns="http://www.m2hinfotech.com//">
                <mobileNo>${mobile}</mobileNo>
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
            } else {
              const clsattpick = JSON.parse(ccc);
              let attnsclsdefault = clsattpick[0].BranchClassId;
              let dropdownData = clsattpick;
              const dropData = dropdownData.map(element => ({
                value: element.class_Id,
                label: element.Class_name,
              }));
              setdropdownSource(dropData);
              setdropdownValue(dropdownData[0].class_Id);
              getDivisions(dropdownData[0].class_Id);
            }
          });
      },
      error => {
        console.log(error); //Display error
      },
    );
  };

  const getDivisions = classId => {
    let username = '';
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });

    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetDivisions`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetDivisions xmlns="http://www.m2hinfotech.com//">
          <BranchID>${branchId}</BranchID>
          <classId>${classId}</classId>
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
            console.log('cc', ccc);
            if (ccc === 'failure') {
            } else {
              const output = JSON.parse(ccc);
              console.log('data', output);
              let dropdownData = output;
              const dropData = dropdownData.map(element => ({
                value: element.BranchClassId,
                label: element.DivCode,
              }));
              setdropdownSource2(dropData);
              setdropdownValue2(dropdownData[0].BranchClassId);
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

  const onCheckboxData = () => {
    if (dateText === '') {
      Alert.alert(
        'Alert! ',
        'Pick the required Date',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    } else {
      let timestatus = dropdownValue1;

      fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=ViewDailyAttList`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <ViewDailyAttList xmlns="http://www.m2hinfotech.com//">
      <BranchclsId>${dropdownValue2}</BranchclsId>
      <DayStatus>${timestatus}</DayStatus>
      <Date>${dateText}</Date>
    </ViewDailyAttList>
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
          setloading(false);
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response);

          const v = xmlDoc.getElementsByTagName('ViewDailyAttListResult')[0]
            .childNodes[0].nodeValue;
          console.log(v);
          if (v === 'failure') {
            setdataerror(true);
          } else {
            const rsltcheck = JSON.parse(v);
            console.log('rsltcheck', rsltcheck);
            setdataSourceEditcheck(rsltcheck);
            setdatacheck(rsltcheck.filter(x => x.Status === 'A'));
            getUnchecked(rsltcheck);
            setdataerror(false);
          }
        });
    }
  };
  const getUnchecked = data => {
    const allData = data;
    const un = [];
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].Status === 'A') {
        if (!un.includes(allData[i].StudentId)) {
          un.push(allData[i].StudentId);
        }
      }
    }
    setunchecked(un);
  };
  const dateselect = date => {
    setdateText(moment(date).format('DD/MM/YYYY'))
    setdatepickerVisible(false)
  }

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      <View style={{ flex: 7 }}>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Choose class:</Text>

            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdownSource}
              value={dropdownValue}
              onChangeText={value => {
                setdropdownValue(value);
                getDivisions(value);
              }}
            />
          </View>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Choose Division:</Text>

            {/* <View style={styles.pickerView}> */}
            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdownSource2}
              value={dropdownValue2}
              onChangeText={value => {
                setdropdownValue2(value);
              }}
            />
          </View>
        </View>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Choose date:</Text>
            <View style={styles.pickerStyle}>
              <Pressable onPress={() => setdatepickerVisible(true)}>
                <View style={styles.datePicker}>
                  <Text style={styles.datePickerText}>{dateText}</Text>
                </View>
              </Pressable>
              <DateTimePickerModal
                isVisible={datepickerVisible}
                mode="date"
                onCancel={() => setdatepickerVisible(false)}
                onConfirm={dateselect}
              />
            </View>
          </View>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Choose type:</Text>

            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdownSource1}
              value={dropdownValue1}
              dropdownOffset={{ top: 15, left: 1 }}
              onChangeText={value => {
                setdropdownValue1(value);
              }}
            />
          </View>
        </View>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.hideText}>{''}</Text>
            <View style={styles.button}>
              <Pressable onPress={() => onCheckboxData()}>
                <Text style={styles.buttonText}>SUBMIT</Text>
              </Pressable>
            </View>
          </View>
        </View>

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
        {dataerror ? (
          <Text style={styles.notDataText}>No data found.</Text>
        ) : (
          <View style={styles.flatlistStyle}>
            <FlatList
              data={dataSourceEditcheck}
              renderItem={({ item }) => (
                <View style={styles.itemStyle}>
                  <View style={styles.textcontentone}>
                    <CheckBox
                      checked={!unchecked.includes(item.StudentId)}
                      containerStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#FFFFFF',
                      }}
                    // onPress={() => this.checkboxtest(item)}
                    />
                  </View>
                  <View style={styles.textcontenttwo}>
                    <Text style={styles.item1}>{item.RollNo}</Text>
                  </View>
                  <View style={styles.textcontentthree}>
                    <Text style={styles.item2}>{item.Name}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  noDataView: {
    marginTop: wp('22%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('5%'),
    marginTop: wp('3.5%'),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    borderRightWidth: wp('0.5%'),
    borderRightColor: '#FFFFFF',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: wp('12%'),
    backgroundColor: '#BA69C8',
    elevation: 3,
  },
  titleText1: {
    justifyContent: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: wp('3.5%'),
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: wp('3.5%'),
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
    borderRightWidth: wp('0.5%'),
    borderRightColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontenttwo: {
    borderRightWidth: wp('0.5%'),
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

  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#4CB050',
    borderRadius: 30,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },

  fabView: {
    justifyContent: 'flex-end',
  },

  flatlistStyle: {
    flex: 1,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  line2: {
    borderRightWidth: 1,
    borderRightColor: 'grey',
  },
  item1: {},
  item2: {
    marginLeft: wp('3.5%'),
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  touchableView: {
    flexDirection: 'row',
  },
  pickerView: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
      ios: {
        flex: 1,
        marginRight: 10,
      },
    }),
  },
  pickerStyle: {
    ...Platform.select({
      android: {
        paddingTop: wp('3.5%'),
        borderWidth: wp('0.3%'),
        borderColor: 'grey',
        height: wp('10%'),
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: wp('0.6%'),
        paddingLeft: wp('1.5%'),
        marginRight: wp('1.5%'),
        marginBottom: wp('1.5%'),
      },
      ios: {
        paddingTop: wp('3.5%'),
        borderWidth: wp('0.3%'),
        borderColor: 'grey',
        height: wp('9%'),
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: wp('1.5%'),
        paddingLeft: wp('1.5%'),
        marginRight: wp('1.5%'),
        marginBottom: wp('1.5%'),
      },
    }),
  },
  textStyle1: {
    marginLeft: wp('1.5%'),
    marginBottom: wp('1.5%'),
  },
  button: {
    height: wp('9.5%'),
    width: '50%',
    marginTop: wp('2.5%'),
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginLeft: wp('1.5%'),
    marginRight: wp('1.5%'),
    backgroundColor: '#17BED0',
    marginBottom: wp('1.5%'),
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hideText: {
    marginLeft: wp('1.5%'),
    marginBottom: wp('1.5%'),
    color: 'white',
    // backgroundColor: 'red',
  },
  datePicker: {
    height: wp('9.5%'),
    justifyContent: 'center',
    // backgroundColor: 'red',
    borderRadius: wp('1.5%'),
    marginLeft: wp('0.5%'),
    marginRight: wp('0.5%'),
  },
  datePicker1: {
    height: wp('6.5%'),
    justifyContent: 'center',
    // backgroundColor: 'blue',
    borderRadius: wp('1.5%'),
    marginLeft: wp('1.5%'),
    marginRight: wp('1.5%'),
  },
  buttonstyle: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    right: 30,
    bottom: 20,
  },
  topcontentimagelogo: {
    height: 30,
    width: 30,
  },
  containertop: {
    elevation: 3,
    height: 100,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CB050',
  },
  containertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  dashtext: {
    marginLeft: 10,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
