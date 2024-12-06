import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Platform,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import {DOMParser} from 'xmldom';
import {CheckBox} from 'react-native-elements';
import {Dropdown} from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import GLOBALS from '../../../config/Globals';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const Edit = () => {
  const [unchecked, setunchecked] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dataSourceEditcheck, setdataSourceEditcheck] = useState([]);
  const [showFrom, setShowFrom] = useState(false);
  const [clsisLoading, setclsisLoading] = useState(true);
  const [isVisbledata, setisVisbledata] = useState(false);
  const [isLoadingalert, setisLoadingalert] = useState(false);
  const [flatlistLoading, setflatlistLoading] = useState(false);
  const [nodata, setnodata] = useState('');
  const [classselected, setclassselected] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [pickertime, setpickertime] = useState('FN');
  const [dropdownValue1, setdropdownValue1] = useState('FN');
  const [DateText, setDateText] = useState(
    moment(new Date()).format('DD/MM/YYYY'),
  );
  const dropdownSource1 = useState([
    {
      label: 'FN',
      value: 'FN',
    },
    {label: 'AN', value: 'AN'},
  ]);

  let bclsatt;
  let timestatus;
  const parser = new DOMParser();

  useEffect(() => {
    classListCreateExam();
  }, []);

  const hideDatePicker = () => {
    setShowFrom(false);
  };

  const handleFromDatePicked = date => {
    setShowFrom(false);
    setDateText(moment(date).format('DD/MM/YYYY'));
  };

  const onValuepickertime = value => {
    setisVisbledata(false);
    setpickertime(value);
    getUnchecked(dataSourceEditcheck);
  };

  const onValueattClass = value => {
    setisVisbledata(false);
    setclassselected(value);
    getUnchecked(dataSourceEditcheck);
  };

  const getUnchecked = dat => {
    const un = [];
    for (let i = 0; i < dat.length; i++) {
      if (dat[i].Status === 'A') {
        if (!un.includes(dat[i].StudentId)) {
          un.push(dat[i].StudentId);
        }
      }
      setunchecked(un);
    }
  };

  const classListCreateExam = () => {
    AsyncStorage.getItem('BranchID').then(branch => {
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          fetch(`${GLOBALS.TEACHER_SERVICE}TeacherClasses`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<TeacherClasses xmlns="http://www.m2hinfotech.com//">
  <PhoneNo>${keyValue}</PhoneNo>
</TeacherClasses>
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
                .getElementsByTagName('TeacherClassesResult')[0]
                .childNodes[0].nodeValue;
              if (result === 'failure') {
                setisVisbledata(false);
              } else {
                const clsattpick = JSON.parse(result);
                let attnsclsdefault = clsattpick[0].BranchClassId;
                let dropdownData = clsattpick;
                const dropData = dropdownData.map(element => ({
                  value: element.BranchClassId,
                  label: element.Class,
                }));
                setdropdownSource(dropData);
                setdropdownValue(dropdownData[0].BranchClassId);
                setisVisbledata(true);
                setclsisLoading(false);
                setclassselected(attnsclsdefault);
                setDateText(' ');
              }
            });
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const onCheckboxData = () => {
    if (DateText === ' ') {
      setflatlistLoading(false);
      Alert.alert(
        'Alert! ',
        'Pick the required Date',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      setflatlistLoading(true);
      timestatus = pickertime;
      bclsatt = classselected;
      fetch(`${GLOBALS.TEACHER_SERVICE} ViewDailyAttList`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
  <ViewDailyAttList xmlns="http://www.m2hinfotech.com//">
    <BranchclsId>${bclsatt}</BranchclsId>
    <DayStatus>${timestatus}</DayStatus>
    <Date>${DateText}</Date>
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
          const result = parser
            .parseFromString(response)
            .getElementsByTagName('ViewDailyAttListResult')[0]
            .childNodes[0].nodeValue;
          if (result === 'failure') {
            setnodata(false);
          } else {
            const rsltcheck = JSON.parse(result);
            setflatlistLoading(false);
            setisVisbledata(true);
            setdataSourceEditcheck(rsltcheck);
            getUnchecked(rsltcheck);
          }
        });
    }
  };

  const checkboxtest = (item, unc) => {
    const x = dataSourceEditcheck;
    if (item.Status === 'P') {
      setunchecked([...unc, item.StudentId]);
      for (var i = 0; i < x.length; i++) {
        if (x[i].StudentId === item.StudentId) {
          x[i].Status = 'A';
        }
      }
    } else if (item.Status === 'A') {
      const a = unc.filter(a => a !== item.StudentId);
      setunchecked(a);
      for (var i = 0; i < x.length; i++) {
        if (x[i].StudentId === item.StudentId) {
          x[i].Status = 'P';
        }
      }
    }
    setdataSourceEditcheck(x);
  };

  const onFinalPress = () => {
    if (isVisbledata === false) {
      Alert.alert('Edit Attandance', 'Please Enter the Attendance....!');
    } else {
      const studidData = [];
      for (let t = 0; t < unchecked.length; t++) {
        studidData.push({Stud_Id: unchecked[t]});
      }
      setisLoadingalert(true);
      onData(studidData);
    }
  };
  const onData = arr => {
    const arr2 = JSON.stringify(arr);
    const arr3 = JSON.parse(arr2);
    let attendancestatus;
    if (arr3.length > 0) {
      attendancestatus = 'SomePresent';
    } else {
      attendancestatus = 'AllPresent';
    }
    timestatus = pickertime;
    bclsatt = classselected;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_SERVICE}StdAttUpdate`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
  <StdAttUpdate xmlns="http://www.m2hinfotech.com//">
    <BclsId>${bclsatt}</BclsId>
    <teacherMobNo>${keyValue}</teacherMobNo>
    <DayStatus>${timestatus}</DayStatus>
    <StdIds>${arr2}</StdIds>
    <MainStatus>${attendancestatus}</MainStatus>
    <Date>${DateText}</Date>
  </StdAttUpdate>
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
              .getElementsByTagName('StdAttUpdateResult')[0]
              .childNodes[0].nodeValue;
            if (result === 'failure') {
              setisLoadingalert(false);
              Alert.alert(
                'Attendance',
                'Attendance registration has been failed !..',
              );
            } else {
              setisLoadingalert(false);
              Alert.alert(
                'Attendance',
                'Attendance has been registered Successfully!',
              );
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
    <View style={{flex: 1}}>
      {nodata === false ? (
        <View style={styles.noDataView}>
          <Text style={styles.notDataText}>No Students</Text>
        </View>
      ) : clsisLoading === true ? (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator
            style={styles.progressBar}
            color="#C00"
            size="large"
          />
        </View>
      ) : null}
      <View style={styles.container}>
        <View style={{flex: 7}}>
          <View style={styles.horizontalView}>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose class:</Text>
            
                <Dropdown
                  style={styles.pickerStyle}
                  selectedItemColor="#000"
                  labelField="label"
                  valueField="value"
                  selectedTextStyle={styles.selectedTextStyle1}
                  marginTop={wp('4%')}
                  data={dropdownSource}
                  value={dropdownValue}
                  onChange={item => {
                    setdropdownValue(item.value);
                    onValueattClass(item.value);
                  }}
                />
            </View>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose date:</Text>
              <View style={styles.pickerStyle}>
                <Pressable
                  onPressIn={() => {
                    setShowFrom(true);
                  }}>
                  <View style={styles.datePicker}>
                    <Text style={styles.datePickerText}>{DateText}</Text>
                  </View>
                  <DateTimePickerModal
                    isVisible={showFrom}
                    mode="date"
                    onConfirm={handleFromDatePicked}
                    onCancel={hideDatePicker}
                    maximumDate={new Date()}
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <View style={[styles.horizontalView, {}]}>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose type:</Text>
             
                <Dropdown
                  style={styles.pickerStyle}
                  selectedItemColor="#000"
                  labelField="label"
                  valueField="value"
                  selectedTextStyle={styles.selectedTextStyle1}
                  data={dropdownSource1[0]}
                  value={dropdownValue1}
                  marginTop={wp('4%')}
                  onChange={item => {
                    setdropdownValue1(item.value);
                    onValuepickertime(item.value);
                  }}
                />
             
            </View>
            <View style={styles.verticalView}>
              <Text style={styles.hideText}>Submit</Text>
              <View style={styles.button}>
                <TouchableOpacity onPress={onCheckboxData}>
                  <Text style={styles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {isVisbledata === true ? (
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
          ) : null}
          <View style={styles.flatlistStyle}>
            {flatlistLoading === true ? (
              <View>
                <ActivityIndicator
                  style={styles.progressBar}
                  color="#C00"
                  size="large"
                />
              </View>
            ) : null}
            {isLoadingalert === true ? (
              <ActivityIndicator
                style={styles.progressBar}
                color="#C00"
                size="large"
              />
            ) : null}
            {isVisbledata === true ? (
              <ScrollView style={styles.flatlistStyle}>
                <FlatList
                  data={dataSourceEditcheck}
                  renderItem={({item}) => (
                    <View style={styles.itemStyle}>
                      <View style={styles.textcontentone}>
                        <CheckBox
                          containerStyle={styles.checkboxContainerStyle}
                          onPress={() => checkboxtest(item, unchecked)}
                          checked={!unchecked.includes(item.StudentId)}
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
              </ScrollView>
            ) : null}
          </View>
        </View>
        <TouchableOpacity style={styles.buttonstyle} onPress={onFinalPress}>
          <View>
            <Image
              style={styles.topcontentimagelogo}
              source={require('../../../images/ic_Tick.png')}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  checkboxContainerStyle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  noDataView: {
    marginTop: wp('26%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('11.5%'),
  },
  inputContainer: {
    borderBottomColor: 'transparent',
  },
  line: {
    borderRightWidth: wp('0.3%'),
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
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontenttwo: {
    borderRightWidth: 1,
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
    borderBottomWidth: wp('0.4%'),
    borderBottomColor: '#E0E0E0',
  },
  flatlistStyle: {
    flex: 1,
    backgroundColor: 'white',
    flexGrow: 1,
  },
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
  pickerStyle: {
    marginLeft: wp('2%'),
    marginRight: wp('1.5%'),
    marginBottom: wp('1%'),
    borderRadius: 3,
    borderWidth: wp('0.2%'),
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? wp('9.5%') : wp('10%'),
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
  textStyle1: {
    marginLeft: wp('2%'),
    marginBottom: wp('2%'),
  },
  button: {
    height: wp('11%'),
    justifyContent: 'center',
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
  },
  datePicker: {
    height: wp('32%'),
    justifyContent: 'center',
    borderRadius: 3,
    marginLeft: wp('1.5%'),
    marginRight: wp('1.5%'),
  },
  buttonstyle: {
    position: 'absolute',
    height: wp('15.5%'),
    width: wp('15.5%'),
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    right: wp('9%'),
    bottom: wp('7%'),
  },
  topcontentimagelogo: {
    height: wp('9%'),
    width: wp('9%'),
  },
});
export default Edit;
