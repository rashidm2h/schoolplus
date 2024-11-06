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
  Keyboard,
} from 'react-native';
import moment from 'moment';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Iconarrow from 'react-native-vector-icons/Entypo'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import {Pressable} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
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
  const [selectedSubId, setSelectedSubId] = useState(null);


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
    examCreateGetsubject(value);
  };
  const onValueChangesubject = value => {
    examCreateTypegrade(value);
  };
  const handleGradeChange = (selectedGradeId) => {
    const selectedGrade = dropdownSource3.find((grade) => grade.value === selectedGradeId);
    
    if (selectedGrade) {
      setminmark(selectedGrade.MarkFrom);
      setmaxmark(selectedGrade.MarkTo);
    }
  };
  const examCreateGetsubject = async (value) => {

    try{

   const response = await  fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetSubjects`, {
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
    const responseText = await response.text();
    const modalgetsubject = parser.parseFromString(responseText).getElementsByTagName('GetSubjectsResult')[0].childNodes[0].nodeValue;

    if (modalgetsubject !== 'failure') {
      const modalgetsubjectdata = JSON.parse(modalgetsubject);
      const dropData = modalgetsubjectdata.map(element => ({
        value: element.SubId,
        label: element.SubName,
      }));
      setdropdownSource2(dropData);
      const selectedSubId = modalgetsubjectdata[0].SubId;
      setdropdownValue2(selectedSubId);
      setSelectedSubId(selectedSubId);
    }
  } catch (error) {
    console.error('Error fetching subjects:', error);
  }
};
  const DatePickerMainFunctionCall = () => {
    let DateHolder = DateHolder;
    setdatepickerVisible(true);
    if (!DateHolder || DateHolder == null) {
      DateHolder = new Date();
      DateHolder = DateHolder;
    }
  };
  const examCreateTypegrade = ( SubId ) => {

    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetSubjectTypeAndGradeType`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetSubjectTypeAndGradeType xmlns="http://www.m2hinfotech.com//">
          <BranchclsId>${dropdownValue1}</BranchclsId>
          <SubId>${SubId}</SubId>
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
            MarkFrom: element.MarkFrom,
            MarkTo: element.MarkTo,
          }));
          setdropdownSource3(dropData);
          setdropdownValue3(dropdownData[0].GradeId);
          setminmark(dropdownData[0].MarkFrom)
          setmaxmark(dropdownData[0].MarkTo)
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const examCreatTeacherClass = token => {
    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=ExmClassListForTeacher`, {
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
          // examCreateTypegrade(modalteacherclassdata[0].BranchClassId);
          examCreateGetsubject(modalteacherclassdata[0].BranchClassId);
        }
      });
  };

  const examviewlist = () => {
    setloadTable(true);

    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetExamDtls`, {
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
    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=ExmClassListForTeacher`, {
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

    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=InsertTeachInternalExam`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<InsertTeachInternalExam xmlns="http://www.m2hinfotech.com//">
<ExamName>${examname}</ExamName>
<ExamType>${examtype}</ExamType>
<GradeId>${dropdownValue3}</GradeId>
<PhoneNo>${accessToken}</PhoneNo>
<BranchclsId>${dropdownValue1}</BranchclsId>
<SubType>${subtype}</SubType>
<SubId>${dropdownValue2}</SubId>
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
    setchosenEndTime('00:00');
    setchosenStartTime('00:00');
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
            iconStyle={styles.iconStyle}
            // inputContainerStyle={{borderBottomColor: 'transparent'}}
            data={dropdownSource}
            style={styles.dropdownStyle}
            selectedTextStyle={styles.selectedTextStyle1}
            textColor="#000"
            selectedItemColor="#000"
            labelField="label"
            valueField="value"
           maxHeight={dropdownValue1.length * 10}
            value={dropdownValue}
            onChange={item => {
              setdropdownValue(item.value);
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

        <Pressable style={styles.buttonstyle}>
          <Icon
            name="plus"
            size={28}
            onPress={() => {
              setexamname('');
              // console.log('ooo');
              setchosenEndTime('0.00');
              setchosenStartTime('');
              _showModal();
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
            <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
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
                        Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'
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
                  {/* <View style={styles.ViewInRowcreat}> */}
                      <View style={styles.ViewInColcreat}>
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
                        minimumDate={new Date()}
                      />
                    </View>
                    <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewCol1in2creat}>
                      {/* <View style={styles.timeinput}> */}
                      <Text style={styles.textcreat}>Start Time </Text>
                      <TouchableOpacity onPress={showDateTimePickerStartTime}>
                        {chosenStartTime === '00:00'?(
                        <Text style={styles.textInput1in3creat}>
                          {chosenStartTime}
                        </Text>):(<Text style={styles.textInput1in3creat}>
                          {chosenStartTime}
                        </Text>)}
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isVisibleStart}
                        mode="time"
                        onCancel={hidePickerStartTime}
                        onConfirm={handlePickerStarttime}
                      />
                    </View>
                    {/* </View> */}
                    {/* <View style={styles.timearrow}>
                      <Iconarrow
                      name='arrow-long-right'
                      color='#000'
                      size={30}/>
                    </View> */}
                    <View style={styles.ViewCol1in2creat}>
                    {/* <View style={styles.timeinput}> */}
                      <Text style={styles.textcreat}>End Time </Text>
                      <TouchableOpacity onPress={showDateTimePickerEndTime}>
                      {chosenEndTime === '00:00'?(
                        <Text style={styles.textInput1in3creat}>
                          {chosenEndTime}
                        </Text>):(<Text style={styles.textInput1in3creat}>
                          {chosenEndTime}
                        </Text>)}
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={isVisibleEnd}
                        mode="time"
                        onCancel={hidePickerEndTime}
                        onConfirm={handlePickerEndtime}
                        is24Hour={false}
                      />
                    </View>
                    </View>
                  {/* </View> */}
                  <View style={styles.ViewInColcreat}>
                      <Text style={styles.textcreat}>Class</Text>
                      <View style={styles.textInput1in3creat}>
                        <Dropdown
                        iconStyle={styles.iconStyle}
                          fontSize={16}
                          // dropdownOffset={{top: 15}}
                          baseColor="transparent"
                          data={dropdownSource1}
                          containerStyle={styles.pickerStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          textColor="#000"
                          selectedItemColor="#000"
                          value={dropdownValue1}
                          labelField="label"
                           valueField="value"
                           maxHeight={dropdownValue1.length * 10}
                          onChange={item => {
                            setdropdownValue1(item.value);
                            onValueChangeclass(item.value);
                          }}
                        />
                      </View>
                    </View>
                    <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewCol1in2creat}>
                      <Text style={styles.textcreat}>Subject</Text>
                      <View style={styles.textInput1in3creat}>
                        <Dropdown
                              fontSize={16}
                              dropdownOffset={{top: 15}}
                              baseColor="transparent"
                              containerStyle={styles.dropdownContainer}
                              data={dropdownSource2}
                              labelField="label"
                              valueField="value"
                              textColor="#000"
                              selectedItemColor="#000"
                              placeholderStyle={styles.placeholderStyle}
                              selectedTextStyle={styles.selectedTextStyle}
                              iconStyle={styles.iconStyle}
                              maxHeight={dropdownValue2.length * 10}
                              value={dropdownValue2}
                              onChange={item => {
                            setdropdownValue2(item.value);
                            onValueChangesubject(item.value)
                              }}
                        />
                      </View>
                    </View>
                    <View style={styles.ViewCol1in2creat}>
                      <Text style={styles.textcreat}>Grade Type</Text>
                      <View style={styles.textInput1in3creat}>
                        <Dropdown
                         iconStyle={styles.iconStyle}
                          fontSize={16}
                          dropdownOffset={{top: 15}}
                          baseColor="transparent"
                          data={dropdownSource3}
                          containerStyle={styles.pickerStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          textColor="#000"
                          selectedItemColor="#000"
                          value={dropdownValue3}
                           labelField="label"
                           valueField="value"
                           maxHeight={dropdownValue2.length * 10}
                          onChange={item => {
                            setdropdownValue3(item.value);
                            handleGradeChange(item.value)
                          }}
                        />
                      </View>
                    </View>
                    </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewCol1in2creat}>
                      <Text style={styles.textcreat}>Minimum Mark</Text>
                      <Text
                        style={styles.textInput1in2creat}>{minmark}</Text>
                    </View>
                    <View style={styles.ViewCol1in2creat}>
                      <Text style={styles.textcreat}>Maximum Mark</Text>
                      <Text
                        style={styles.textInput1in2creat}>{maxmark}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={btAddExam}
                    style={styles.ButtonAddExamcreat}>
                    <Text style={styles.textWhitecreat}>ADD EXAM</Text>
                  </TouchableOpacity>
                </View>
              </View>
              </KeyboardAwareScrollView>
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
    paddingHorizontal: wp('1%'),
    marginVertical: wp('1%'),
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
  iconStyle: {
    width: wp('8%'),
    height: wp('8%'),
  },
  pickerStyle: {
    ...Platform.select({
      ios: {
        justifyContent: 'center',
        alignItems: 'stretch',
        paddingLeft: 2,
      },
      android: {
        flex: 1,
        // width: wp('40%'),
        justifyContent: 'center',
        // alignItems: 'center',
        // paddingBottom: 0,
        // backgroundColor: 'blue',
        borderBottomWidth: 0,  // Set bottom border width to 0
        borderBottomColor: 'transparent',
        // paddingLeft: 0,
        height:hp('30%')
      },
    }),
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#121214',
  },
  selectedTextStyle1: {
    fontSize: 16,
    color: '#121214',
    paddingLeft: wp('2%')
  },
  button: {
    borderRadius: 2,
    elevation: 3,
    backgroundColor: '#17BED0',
    height: wp('10.5%'),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownStyle: {
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
    borderRadius: 1,
    marginRight: wp('3.5%'),
    borderWidth: wp('0.5%'),
    height: wp('11.5%'),
  },
  dashtext: {
    fontSize: wp('4.5%'),
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
    height: wp('11.9%'),
  },
  item: {
    height: wp('6%'),
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
    height: wp('9%'),
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  textc: {
    fontSize: 14,
    color: '#FFFFFF',
    paddingHorizontal: wp('0.5%')
  },
  flatitem: {
    flexWrap: 'wrap',
    textAlign: 'center',
    fontSize: 13,
  },
  buttonstyle: {
    position: 'absolute',
    height: wp('15.3%'),
    width: wp('15.3%'),
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    left: wp('9.3%'),
    bottom: wp('7%'),
  },
  // topcontentimagelogo: {
  //   height: wp('7%'),
  //   width: wp('7%'),
  //   justifyContent: 'center',
  //   resizeMode: 'contain',
  //   alignSelf: 'center',
  //   alignItems: 'center',
  // },
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#F9F6F5',
  },
  containercreat: {
    flex: 1,
  },
  texticoncreat: {
    marginLeft: wp('3%'),
    color: '#FFFFFF',
    fontSize: wp('7%'),
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
    marginHorizontal: wp('4%'),
    flex: 7,
    flexDirection: 'column',
  },
  ViewInColcreat: {
    flex: 1,
    marginVertical: wp('3.5%'),
    flexDirection: 'column',
  },
  textcreat: {
    alignItems: 'flex-start',
    fontSize: 18,
    fontWeight: 'normal',
    color: 'gray',
    marginBottom: wp('1%')
  },
  textInputcreat: {
    height: wp('11%'),
    borderWidth: wp('0.3%'),
    borderRadius: 5,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  ViewInRowcreat: {
    marginVertical: wp('3%'),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ViewCol1in3creat: {
    flexDirection: 'column',
  },
  textInput1in3creat: {
    height: wp('11%'),
    textAlignVertical: 'center',
    // textAlign: 'center',
    paddingLeft: wp('2%'),
   justifyContent: 'center',
    borderWidth: wp('0.3%'),
    borderRadius: 5,
    fontSize: 16
  
  },
  timeinput: {
    height: wp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: wp('0.3%'),
    borderRadius: 5,
    width: wp('35%')
  },
  timedisplay: {
    fontWeight: '700',
    fontSize: 30,
    color:'gray'
  },
  timedisplay1: {
    fontWeight: '500',
    fontSize: 30,
  },
  timearrow: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput1in3creatv: {
    ...Platform.select({
      ios: {},
      android: {
        flex: 1,
        height: wp('14%'),
        width: 80,
        // backgroundColor: 'blue',
        borderWidth: wp('0.3%'),
        borderRadius: 5,
      },
    }),
  },
  ViewCol1in2creat: {
    flexDirection: 'column',
    flex: 0.48,
    
  },
  textInput1in2creat: {
    height: wp('11%'),
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: wp('0.3%'),
    borderRadius: 5,
    color:'#000',
    fontSize: 20,
  },
  ButtonAddExamcreat: {
    flex: 1,
    backgroundColor: '#034951',
    alignItems: 'center',
    justifyContent: 'center',
    height: wp('10%'),
    margin: 20,
    elevation: 3,
    borderRadius: 5,
  },
  textWhitecreat: {
    color: '#FFFFFF',
  },
});
export default ViewExam;
