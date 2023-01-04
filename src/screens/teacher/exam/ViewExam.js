import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import {Pressable} from 'react-native';

const ViewExam = () => {
  const [minmark, setminmark] = useState('');
  const [maxmark, setmaxmark] = useState('');
  const [examname, setexamname] = useState('');
  const [chosenDate, setchosenDate] = useState('');
  const [accessToken, setaccessToken] = useState('');
  const [chosenEndTime, setchosenEndTime] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [dropdownValue2, setdropdownValue2] = useState('');
  const [dropdownValue3, setdropdownValue3] = useState('');
  const [chosenStartTime, setchosenStartTime] = useState('');
  const [examdetails, setexamdetails] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownSource3, setdropdownSource3] = useState([]);
  const [dropdownSource2, setdropdownSource2] = useState([]);
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [isVisble, setisVisble] = useState(false);
  const [loadTable, setloadTable] = useState(false);
  const [isVisibleEnd, setisVisibleEnd] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [isLoadingalert, setisLoadingalert] = useState(false);
  const [isVisibleStart, setisVisibleStart] = useState(false);
  const [datepickerVisible, setdatepickerVisible] = useState(false);
  const parser = new DOMParser();

  useEffect(() => {
    AsyncStorage.getItem('acess_token').then(keyValue => {
      setaccessToken(keyValue);
      classListViewExam(keyValue);
      examCreatTeacherClass(keyValue);
      setTimeout(() => setisLoadingalert(false), 12000);
    });
  }, []);

  const onDatePickedFunction = date => {
    setdatepickerVisible(false);
    setchosenDate(moment(date).format('DD/MM/YYYY'));
  };

  const onValueChangeclass = value => {
    examCreateTypegrade(value);
    examCreateGetsubject(value);
  };

  const examCreateGetsubject = value => {
    fetch(`${GLOBALS.TEACHER_URL}GetSubjects`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
		<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
		  <soap12:Body>
		    <GetSubjects xmlns="http://www.m2hinfotech.com//">
		      <BranchclsId>${value}</BranchclsId>
		      <PhoneNo>${accessToken}</PhoneNo>
		    </GetSubjects>
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
        const modalgetsubject = parser
          .parseFromString(response)
          .getElementsByTagName('GetSubjectsResult')[0].childNodes[0].nodeValue;
        if (modalgetsubject === 'failure') {
        } else {
          const modalgetsubjectdata = JSON.parse(modalgetsubject);
          const dropData = modalgetsubjectdata.map(element => ({
            value: element.SubId,
            label: element.SubName,
          }));
          setdropdownSource3(dropData);
          setdropdownValue3(modalgetsubjectdata[0].SubId);
        }
      });
  };
  const DatePickerMainFunctionCall = () => {
    let DateHolder = DateHolder;
    setdatepickerVisible(true);
    if (!DateHolder || DateHolder == null) {
      DateHolder = new Date();
      DateHolder = DateHolder;
    }
  };
  const examCreateTypegrade = value => {
    fetch(`${GLOBALS.TEACHER_URL}GetSubjectTypeAndGradeType`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetSubjectTypeAndGradeType xmlns="http://www.m2hinfotech.com//">
          <BranchclsId>${value}</BranchclsId>
        </GetSubjectTypeAndGradeType>
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
        const modalgradetype = parser
          .parseFromString(response)
          .getElementsByTagName('GetSubjectTypeAndGradeTypeResult')[0]
          .childNodes[0].nodeValue;
        if (modalgradetype === 'failure') {
        } else {
          const modalgradetypedata = JSON.parse(modalgradetype);
          const dropdownData = modalgradetypedata.Table2;
          const dropData = dropdownData.map(element => ({
            value: element.GradeId,
            label: element.GradeType,
          }));
          setdropdownSource2(dropData);
          setdropdownValue2(dropdownData[0].GradeId);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const examCreatTeacherClass = token => {
    fetch(`${GLOBALS.TEACHER_URL}ExmClassListForTeacher`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
								<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
							<soap12:Body>
						<ExmClassListForTeacher xmlns="http://www.m2hinfotech.com//">
							<teacherMobNo>${token}</teacherMobNo>
						</ExmClassListForTeacher>
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
        const modalteacherclass = parser
          .parseFromString(response)
          .getElementsByTagName('ExmClassListForTeacherResult')[0]
          .childNodes[0].nodeValue;

        if (modalteacherclass === 'failure') {
        } else {
          const modalteacherclassdata = JSON.parse(modalteacherclass);
          const dropData = modalteacherclassdata.map(element => ({
            value: element.BranchClassId,
            label: element.Class,
          }));
          setdropdownSource1(dropData);
          setdropdownValue1(modalteacherclassdata[0].BranchClassId);
          examCreateTypegrade(modalteacherclassdata[0].BranchClassId);
          examCreateGetsubject(modalteacherclassdata[0].BranchClassId);
        }
      });
  };

  const examviewlist = () => {
    setloadTable(true);
    fetch(`${GLOBALS.TEACHER_URL}GetExamDtls`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
									<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
									<soap12:Body>
									<GetExamDtls xmlns="http://www.m2hinfotech.com//">
									<PhoneNo>${accessToken}</PhoneNo>
									<BranchclsId>${dropdownValue}</BranchclsId>
									</GetExamDtls>
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
          .getElementsByTagName('GetExamDtlsResult')[0].childNodes[0].nodeValue;
        if (result === 'failure') {
          setloadTable(false);
          Alert.alert(
            'No Exam',
            'No Examinations Scheduled for this class',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        } else {
          const output = JSON.parse(result);
          setexamdetails(output);
          setisVisble(true);
          setloadTable(false);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const classListViewExam = token => {
    fetch(`${GLOBALS.TEACHER_URL}ExmClassListForTeacher`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
								<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
							<soap12:Body>
						<ExmClassListForTeacher xmlns="http://www.m2hinfotech.com//">
							<teacherMobNo>${token}</teacherMobNo>
						</ExmClassListForTeacher>
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
        const examviewclass = parser
          .parseFromString(response)
          .getElementsByTagName('ExmClassListForTeacherResult')[0]
          .childNodes[0].nodeValue;
        if (examviewclass === 'failure') {
          setisVisble(false);
        } else {
          const examviewclasslist = JSON.parse(examviewclass);
          const dropData = examviewclasslist.map(element => ({
            value: element.BranchClassId,
            label: element.Class,
          }));
          setisVisble(false);
          setdropdownSource(dropData);
          setdropdownValue(examviewclasslist[0].BranchClassId);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const IsemptyInput = () => {
    if (
      examname.length === 0 ||
      minmark.length === 0 ||
      maxmark.length === 0 ||
      chosenDate.length === 0 ||
      chosenStartTime.length === 0 ||
      chosenEndTime.length === 0
    ) {
      setisLoadingalert(false);
      Alert.alert('Fill All Details', 'Please Fill all details and try again!');
    } else {
      addNewExam();
    }
  };

  const btAddExam = () => {
    setTimeout(() => setisLoadingalert(false), 12000);
    setisLoadingalert(true);
    IsemptyInput();
  };

  const addNewExam = () => {
    const examtype = 'Internal';
    const subtype = 'Compulsory';
    fetch(`${GLOBALS.TEACHER_URL}InsertTeachInternalExam`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<InsertTeachInternalExam xmlns="http://www.m2hinfotech.com//">
<ExamName>${examname}</ExamName>
<ExamType>${examtype}</ExamType>
<GradeId>${dropdownValue2}</GradeId>
<PhoneNo>${accessToken}</PhoneNo>
<BranchclsId>${dropdownValue1}</BranchclsId>
<SubType>${subtype}</SubType>
<SubId>${dropdownValue3}</SubId>
<Date>${chosenDate}</Date>
<starttime>${chosenStartTime}</starttime>
<endtime>${chosenEndTime}</endtime>
<maxmark>${maxmark}</maxmark>
<minmark>${minmark}</minmark>
</InsertTeachInternalExam>
</soap12:Body>
</soap12:Envelope>
`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/xml; charset=utf-8',
      },
    })
      .then(response => response.text())
      .then(response => {
        const outpt = parser
          .parseFromString(response)
          .getElementsByTagName('InsertTeachInternalExamResult')[0]
          .childNodes[0].nodeValue;
        if (outpt === 'success') {
          setisLoadingalert(false);
          Alert.alert('Success!', 'The exam has been created successfully!', [
            {
              text: 'OK',
              onPress: () => setisModalVisible(false),
            },
          ]);
        } else if (outpt === 'failure') {
          Alert.alert('Exam Created', 'Failure', [
            {
              text: 'OK',
              onPress: () => setisModalVisible(false),
            },
          ]);
        } else {
          Alert.alert('Error', 'Unexpected error occured! Try Again !');
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const _showModal = () => {
    setisModalVisible(true);
    setexamname('');
    setchosenEndTime('');
    setchosenStartTime('');
    setchosenDate('');
    setminmark('');
    setmaxmark('');
  };
  const _hideModal = () => {
    setisModalVisible(false);
    setexamname('');
    setchosenEndTime('');
    setchosenStartTime('');
    setchosenDate('');
    setminmark('');
    setmaxmark('');
  };
  const handlePickerStarttime = time => {
    setisVisibleStart(false);
    setchosenStartTime(moment(time).format('HH:mm'));
  };
  const hidePickerStartTime = () => {
    setisVisibleStart(false);
  };
  const showDateTimePickerStartTime = () => {
    setisVisibleStart(true);
  };
  const handlePickerEndtime = time => {
    setisVisibleEnd(false);
    setchosenEndTime(moment(time).format('HH:mm'));
  };
  const hidePickerEndTime = () => {
    setisVisibleEnd(false);
  };
  const showDateTimePickerEndTime = () => {
    setisVisibleEnd(true);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.pickerButtonView}>
        <View style={styles.pickerView}>
          <Dropdown
            inputContainerStyle={{borderBottomColor: 'transparent'}}
            data={dropdownSource}
            style={styles.dropdownStyle}
            textColor="#121214"
            baseColor="transparent"
            value={dropdownValue}
            onChangeText={value => {
              setdropdownValue(value);
            }}
          />
        </View>
        <View style={styles.button}>
          <TouchableOpacity onPress={() => examviewlist()}>
            <Text style={styles.dashtext}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.containerTable}>
        {loadTable && (
          <ActivityIndicator
            style={styles.progressBar}
            color="#C00"
            size="large"
          />
        )}
        {isVisble && (
          <View style={styles.headingTableView}>
            <View style={styles.textheadBox}>
              <Text style={styles.textc}>EXAM NAME</Text>
            </View>
            <View style={[styles.textheadBox, {justifyContent: 'center'}]}>
              <Text style={styles.textc}>DATE</Text>
            </View>
            <View style={styles.textheadBox}>
              <Text style={styles.textc}>TIME</Text>
            </View>
            <View style={styles.textheadboxlast}>
              <Text style={styles.textc}>SUBJECT</Text>
            </View>
          </View>
        )}

        <View style={styles.flatlistView}>
          {isVisble && (
            <FlatList
              data={examdetails}
              renderItem={({item}) => (
                <View style={styles.itemStyle}>
                  <View style={styles.itemBoxData}>
                    <Text style={styles.flatitem}>{item.ExamName}</Text>
                  </View>
                  <View style={styles.itemBoxData}>
                    <Text style={styles.flatitem}>{item.DateOfExam}</Text>
                  </View>
                  <View style={styles.itemBoxData}>
                    <Text style={styles.flatitem}>
                      {item.StartTime}to{item.EndTime}
                    </Text>
                  </View>
                  <View style={styles.itemBoxDataLast}>
                    <Text style={styles.flatitem}>{item.SubName}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <Pressable style={styles.buttonstyle} onPressIn={_showModal}>
          <Icon
            name="plus"
            size={28}
            onPress={() => {
              setexamname('');
              console.log('ooo');
              setchosenEndTime('0.00');
              setchosenStartTime('');
            }}
            style={styles.topcontentimagelogo}
            color="#FFF"
          />
        </Pressable>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackButtonPress={() => setisModalVisible(false)}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.container}>
            <ScrollView>
              <View style={styles.containercreat}>
                <View style={styles.containertoprow}>
                  {Platform.OS === 'ios' ? (
                    <View style={styles.backbuttonImageView}>
                      <TouchableOpacity onPress={_hideModal}>
                        <Icon
                          name="close"
                          size={28}
                          style={styles.backbuttonImageView}
                          color="#FFF"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.containerImageTextcreat}>
                    <Icon
                      name="file-document"
                      size={30}
                      color="white"
                      style={styles.esscontainertopcontentimagecreat}
                    />
                    <Text style={styles.texticoncreat}>CREATE EXAM</Text>
                  </View>
                </View>

                <View style={styles.containerTabcreat}>
                  <View style={styles.ViewInColcreat}>
                    <Text style={styles.textcreat}>Exam Name</Text>
                    <TextInput
                      style={styles.textInputcreat}
                      returnKeyType="next"
                      keyboardType={
                        Platform.OS === 'ios' ? 'ascii-capable' : 'default'
                      }
                      underlineColorAndroid="transparent"
                      onChangeText={text => setexamname(text)}
                    />
                  </View>
                  {isLoadingalert && (
                    <ActivityIndicator
                      style={styles.progressBar}
                      color="#C00"
                      size="large"
                    />
                  )}
                  <View style={styles.ViewInRowcreat}>
                    <View style={[styles.ViewCol1in3creat, {width: '32%'}]}>
                      <Text style={styles.textcreat}>Date</Text>
                      <TouchableOpacity onPress={DatePickerMainFunctionCall}>
                        <Text style={styles.textInput1in3creat}>
                          {chosenDate}
                        </Text>
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={datepickerVisible}
                        mode="date"
                        onCancel={() => setdatepickerVisible(false)}
                        onConfirm={onDatePickedFunction}
                      />
                    </View>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>Start Time</Text>
                      <TouchableOpacity onPress={showDateTimePickerStartTime}>
                        <Text style={styles.textInput1in3creat}>
                          {chosenStartTime}
                        </Text>
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isVisibleStart}
                        mode="time"
                        onCancel={hidePickerStartTime}
                        onConfirm={handlePickerStarttime}
                      />
                    </View>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>End Time</Text>
                      <TouchableOpacity onPress={showDateTimePickerEndTime}>
                        <Text style={styles.textInput1in3creat}>
                          {chosenEndTime}
                        </Text>
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isVisibleEnd}
                        mode="time"
                        onCancel={hidePickerEndTime}
                        onConfirm={handlePickerEndtime}
                      />
                    </View>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={[styles.ViewCol1in3creat, {paddingRight: 5}]}>
                      <Text style={styles.textcreat}>Class</Text>
                      <View style={styles.textInput1in3creatv}>
                        <Dropdown
                          fontSize={14}
                          dropdownOffset={{top: 15}}
                          inputContainerStyle={{
                            borderBottomColor: 'transparent',
                          }}
                          baseColor="transparent"
                          data={dropdownSource1}
                          containerStyle={styles.pickerStyle}
                          textColor="#121214"
                          selectedItemColor="#7A7A7A"
                          value={dropdownValue1}
                          onChangeText={value => {
                            setdropdownValue1(value);
                            onValueChangeclass(value);
                          }}
                        />
                      </View>
                    </View>
                    <View style={[styles.ViewCol1in3creat, {paddingRight: 5}]}>
                      <Text style={styles.textcreat}>Grade Type</Text>
                      <View style={styles.textInput1in3creatv}>
                        <Dropdown
                          fontSize={14}
                          dropdownOffset={{top: 15}}
                          baseColor="transparent"
                          inputContainerStyle={{
                            borderBottomColor: 'transparent',
                          }}
                          data={dropdownSource2}
                          containerStyle={styles.pickerStyle}
                          textColor="#121214"
                          selectedItemColor="#7A7A7A"
                          value={dropdownValue2}
                          onChangeText={value => {
                            setdropdownValue2(value);
                          }}
                        />
                      </View>
                    </View>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>Subject</Text>
                      <View style={styles.textInput1in3creatv}>
                        <Dropdown
                          fontSize={14}
                          dropdownOffset={{top: 15}}
                          baseColor="transparent"
                          inputContainerStyle={{
                            borderBottomColor: 'transparent',
                          }}
                          data={dropdownSource3}
                          containerStyle={styles.pickerStyle}
                          textColor="#121214"
                          selectedItemColor="#7A7A7A"
                          value={dropdownValue3}
                          onChangeText={value => {
                            setdropdownValue3(value);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewCol1in2creat}>
                      <Text style={styles.textcreat}>Minimum Mark</Text>
                      <TextInput
                        style={styles.textInput1in2creat}
                        returnKeyType="next"
                        keyboardType={
                          Platform.OS === 'ios'
                            ? 'numbers-and-punctuation'
                            : 'numeric'
                        }
                        underlineColorAndroid="transparent"
                        onSubmitEditing={() => maxmark.focus()}
                        onChangeText={text => setminmark(text)}
                      />
                    </View>
                    <View style={styles.ViewCol1in2creat}>
                      <Text style={styles.textcreat}>Maximum Mark</Text>
                      <TextInput
                        style={styles.textInput1in2creat}
                        returnKeyType="done"
                        keyboardType={
                          Platform.OS === 'ios'
                            ? 'numbers-and-punctuation'
                            : 'numeric'
                        }
                        underlineColorAndroid="transparent"
                        onChangeText={text => setmaxmark(text)}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={btAddExam}
                    style={styles.ButtonAddExamcreat}>
                    <Text style={styles.textWhitecreat}>ADD EXAM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  mainContainer: {
    flex: 1,
  },
  pickerButtonView: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 5,
    marginVertical: 2,
  },
  pickerView: {
    flex: 1,
  },
  containertoprow: {
    flexDirection: 'row',
    backgroundColor: '#673BB7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerStyle: {
    ...Platform.select({
      ios: {
        justifyContent: 'center',
        alignItems: 'stretch',
        paddingLeft: 2,
      },
      android: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        paddingBottom: 20,
        paddingLeft: 2,
      },
    }),
  },
  button: {
    borderRadius: 2,
    elevation: 3,
    backgroundColor: '#17BED0',
    height: 35,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownStyle: {
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
    borderRadius: 1,
    marginRight: 10,
    borderWidth: 1,
    height: 38,
  },
  dashtext: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backbuttonImageView: {
    ...Platform.select({
      ios: {
        height: 30,
        width: 30,
        alignItems: 'flex-start',
      },
    }),
  },
  containerTable: {
    marginTop: 5,
    elevation: 0.5,
    flex: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  itemStyle: {
    flexDirection: 'row',
    height: 30,
  },
  item: {
    height: 20,
    flex: 1,
    textAlign: 'center',
  },
  textheadBox: {
    elevation: 5,
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: 1,
  },
  textheadboxlast: {
    elevation: 5,
    borderColor: '#FFFFFF',
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBoxData: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  itemBoxDataLast: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingTableView: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  textc: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  flatitem: {
    flexWrap: 'wrap',
    textAlign: 'center',
    fontSize: 13,
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
    left: 30,
    bottom: 20,
  },
  topcontentimagelogo: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#F9F6F5',
  },
  containercreat: {
    flex: 1,
  },
  texticoncreat: {
    marginLeft: -10,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  containerImageTextcreat: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#673BB7',
    flex: 1,
    flexDirection: 'column',
  },
  containerTabcreat: {
    marginHorizontal: 15,
    flex: 7,
    flexDirection: 'column',
  },
  ViewInColcreat: {
    flex: 1,
    marginVertical: 10,
    flexDirection: 'column',
  },
  textcreat: {
    alignItems: 'flex-start',
    fontSize: 17,
    fontWeight: 'normal',
    color: 'gray',
  },
  textInputcreat: {
    height: 40,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  ViewInRowcreat: {
    marginVertical: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ViewCol1in3creat: {
    flexDirection: 'column',
  },
  textInput1in3creat: {
    height: 40,
    textAlignVertical: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderRadius: 5,
  },
  textInput1in3creatv: {
    ...Platform.select({
      ios: {},
      android: {
        height: 40,
        borderWidth: 0.5,
        borderRadius: 5,
      },
    }),
  },
  ViewCol1in2creat: {
    flexDirection: 'column',
    flex: 0.48,
  },
  textInput1in2creat: {
    height: 40,
    textAlign: 'center',
    borderWidth: 0.5,
    borderRadius: 5,
  },
  ButtonAddExamcreat: {
    flex: 1,
    backgroundColor: '#034951',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    margin: 20,
    elevation: 3,
  },
  textWhitecreat: {
    color: '#FFFFFF',
  },
});
export default ViewExam;
