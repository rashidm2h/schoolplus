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
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import GLOBALS from '../../../config/Globals';

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
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}TeacherClasses`, {
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
      fetch(`${GLOBALS.TEACHER_URL}ViewDailyAttList`, {
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
        fetch(`${GLOBALS.TEACHER_URL}StdAttUpdate`, {
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
                inputContainerStyle={styles.inputContainer}
                containerStyle={styles.pickerStyle}
                data={dropdownSource}
                value={dropdownValue}
                baseColor="transparent"
                underlineColor="transparent"
                dropdownOffset={{top: 15}}
                onChangeText={value => {
                  setdropdownValue(value);
                  onValueattClass(value);
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
                  />
                </Pressable>
              </View>
            </View>
          </View>
          <View style={[styles.horizontalView, {}]}>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose type:</Text>
              <Dropdown
                inputContainerStyle={styles.inputContainer}
                containerStyle={styles.pickerStyle}
                data={dropdownSource1}
                value={dropdownValue1}
                baseColor="transparent"
                underlineColor="transparent"
                dropdownOffset={{top: 15}}
                onChangeText={value => {
                  setdropdownValue1(value);
                  onValuepickertime(value);
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
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  inputContainer: {borderBottomColor: 'transparent'},
  line: {
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#BA69C8',
    elevation: 3,
  },
  titleText1: {
    justifyContent: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: 10,
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: 10,
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
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  flatlistStyle: {
    flex: 1,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  item2: {
    marginLeft: 10,
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  pickerStyle: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'grey',
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 30 : 35,
  },
  textStyle1: {
    marginLeft: 5,
    marginBottom: 5,
  },
  button: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#17BED0',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hideText: {
    marginLeft: 5,
    marginBottom: 5,
    color: 'white',
  },
  datePicker: {
    height: 35,
    justifyContent: 'center',
    borderRadius: 3,
    marginLeft: 5,
    marginRight: 5,
  },
  buttonstyle: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
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
});
export default Edit;
