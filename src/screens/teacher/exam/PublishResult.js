import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Alert,
  Platform,
  FlatList,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import {DOMParser} from 'xmldom';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GLOBALS from '../../../config/Globals';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const PublishResult = props => {
  const [
    publishresultclassnamedatasource,
    setpublishresultclassnamedatasource,
  ] = useState(' ');
  const [
    publishresultexamstdclaswiselistdatasource,
    setpublishresultexamstdclaswiselistdatasource,
  ] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownValue3, setdropdownValue3] = useState('');
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [publishresultexamname, setpublishresultexamname] = useState(' ');
  const [nodata, setnodata] = useState(true);
  const [isVisble, setisVisble] = useState(true);
  const [isVisble2, setisVisble2] = useState(true);
  const [isLoading, setisLoading] = useState(true);
  const [isVisbledata, setisVisbledata] = useState(false);
  const [isVisibleclass, setisVisibleclass] = useState(false);
  const [isNullChecking, setisNullChecking] = useState(false);
  const [flatlistLoading, setflatlistLoading] = useState(true);
  const [isLoadingpublish, setisLoadingpublish] = useState(true);
  const [isVisibleSubject, setisVisibleSubject] = useState(false);
  const [isLoadingpubsubject, setisLoadingpubsubject] = useState(true);
  const [insertjson, setinsertjson] = useState([]);
  const [accessToken, setaccessToken] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [dropdownSource3, setdropdownSource3] = useState([]);
  const [dropdownValue2, setdropdownValue2] = useState('Internal');
  let maxmark;
  const dropdownSource2 = [
    {
      label: 'Internal',
      value: 'Internal',
    },
    {
      label: 'CommonExam',
      value: 'CommonExam',
    },
  ];
  const parser = new DOMParser();

  const extraScrollHeight = Platform.OS === 'ios' ? 150 : 0;
  useEffect(() => {
    initialfunction();
  }, []);
  const initialfunction = () => {
    AsyncStorage.getItem('acess_token').then(keyValue => {
      setaccessToken(keyValue);
      classListpublishResult(keyValue);
      setisLoadingpublish(false);
      setisLoading(false);
      setisLoadingpubsubject(false);
    });
  };

  const onValuepublishresultexamtype = value => {
    publishresultclassnames(dropdownValue, dropdownValue1, value);
  };

  const onValuePublishExamClass = value => {
    setflatlistLoading(true);
    selectSubjectweb(accessToken, value);
    publishresultclassnames(value, dropdownValue1, dropdownValue2);
  };

  const onValuePublishExamsubject = value => {
    publishresultclassnames(dropdownValue, value, dropdownValue2);
    studentExamClslistwed(dropdownValue, value);
  };

  const publishresultclassnames = (drop1, drop2, drop3, token) => {
    AsyncStorage.setItem('bclsad', drop1);
    AsyncStorage.setItem('subject', drop2);
    AsyncStorage.setItem('examtypes', drop3);
 
    fetch(`${GLOBALS.TEACHER_SERVICE}GetClassExamNames`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
  <GetClassExamNames xmlns="http://www.m2hinfotech.com//">
  <PhoneNo>${token !== undefined ? token : accessToken}</PhoneNo>
  <BranchclsId>${drop1}</BranchclsId>
  <ExType>${drop3}</ExType>
  <SubId>${drop2}</SubId>
  </GetClassExamNames>
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
          .getElementsByTagName('GetClassExamNamesResult')[0]
          .childNodes[0].nodeValue;
        if (result === 'failure') {
          setisLoading(false);
          setisVisble(false);
          setpublishresultclassnamedatasource(' ');
        } else {
          const publishresultclassnamedata = JSON.parse(result);
          const dropData = publishresultclassnamedata.map(element => ({
            value: element.ExamSubId,
            label: element.ExamName,
          }));
          setpublishresultexamname(publishresultclassnamedata[0].ExamSubId);
          setdropdownSource3(dropData);
          setdropdownValue3(publishresultclassnamedata[0].ExamSubId);
          setisVisble(true);
          setisLoading(false);
          setpublishresultclassnamedatasource(publishresultclassnamedata);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const onV = value => {
    setpublishresultexamname(value);
    studentExamClslistwed(dropdownValue, dropdownValue1);
  };

  const studentExamClslistwed = (drop1, drop2, token) => {
    fetch(`${GLOBALS.TEACHER_SERVICE}StdExamClasswiseList`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
   <soap12:Body>
       <StdExamClasswiseList xmlns="http://www.m2hinfotech.com//">
           <BranchclsId>${drop1}</BranchclsId>
           <SubId>${drop2}</SubId>
           <PhoneNo>${token !== undefined ? token : accessToken}</PhoneNo>
       </StdExamClasswiseList>
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
        const publishresultexamstdclaswiselist = parser
          .parseFromString(response)
          .getElementsByTagName('StdExamClasswiseListResult')[0]
          .childNodes[0].nodeValue;
        if (publishresultexamstdclaswiselist === 'failure') {
          setflatlistLoading(false);
          setisVisble2(false);
          setpublishresultexamstdclaswiselistdatasource(' ');
          setinsertjson(' ');
        } else {
          const publishresultexamstdclaswiselistdata = JSON.parse(
            publishresultexamstdclaswiselist,
          );
          setflatlistLoading(false);
          setisVisble2(true);
          setpublishresultexamstdclaswiselistdatasource(
            publishresultexamstdclaswiselistdata,
          );
          setinsertjson(publishresultexamstdclaswiselistdata);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onclickthat = (values, index) => {
    if (publishresultexamname === ' ') {
      Alert.alert(
        'No exams',
        'No Exams Scheduled',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } else {
      const exammaximark = publishresultexamname;
      const examnamedata = publishresultclassnamedatasource;
      for (let i = 0; i < examnamedata.length; i++) {
        const subid = examnamedata[i].ExamSubId;
        if (subid === exammaximark) {
          maxmark = examnamedata[i].MaxMark;
        }
      }
      if (values > maxmark) {
        Alert.alert('Mark', 'Please Enter below Maximum Mark');
      } else {
        const array1 = insertjson;
        if (values !== '0') {
          setisNullChecking(true);
          array1[index].Marks = values;
          setpublishresultexamstdclaswiselistdatasource(array1);
        } else {
          setisNullChecking(false);
        }
      }
    }
  };

  const isEmptyCheck = () => {
    if (isNullChecking === true) {
      onFinalPress();
      setisVisbledata(true);
    } else {
      setisVisbledata(false);
      Alert.alert(
        '',
        'Please Fill the Mark',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    }
  };
  const btFabClick = () => {
    AsyncStorage.setItem('examids', publishresultexamname);
    setisVisbledata(true);
    isEmptyCheck();
  };
  const onFinalPress = () => {
    onData(publishresultexamstdclaswiselistdatasource);
  };
  const onData = arr => {
    const arr2 = JSON.stringify(arr);
    AsyncStorage.getItem('bclsad').then(
      keyValue2 => {
        AsyncStorage.getItem('subject').then(
          keyValue3 => {
            AsyncStorage.getItem('examtypes').then(
              keyValue4 => {
                AsyncStorage.getItem('examids').then(
                  keyValue5 => {
                    fetch(`${GLOBALS.TEACHER_SERVICE}InsertStdMarkReact`, {
                      method: 'POST',
                      body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
  <InsertStdMarkReact xmlns="http://www.m2hinfotech.com//">
  <JasonInPut>${arr2}</JasonInPut>
  <BranchclsId>${keyValue2}</BranchclsId>
  <SubId>${keyValue3}</SubId>
  <PhoneNo>${accessToken}</PhoneNo>
  <ExamSubId>${keyValue5}</ExamSubId>
  <ExamType>${keyValue4}</ExamType>
  </InsertStdMarkReact>
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
                        const {navigate} = props.navigation;
                        const xmlDoc = parser.parseFromString(response);
                        const output = xmlDoc.getElementsByTagName(
                          'InsertStdMarkReactResult',
                        )[0].childNodes[0].nodeValue;
                        if (output === 'failure') {
                          setisVisbledata(false);
                          Alert.alert(
                            'Failure',
                            'Failed to publish mark ! Try Again !',
                            [
                              {
                                text: 'OK',
                                onPress: () => console.log('failure'),
                              },
                            ],
                          );
                        } else if (output === 'AlreadyExist') {
                          setisVisbledata(false);
                          Alert.alert(
                            'Exam Publishing',
                            'You Already Published this marks..!',
                            [
                              {
                                text: 'OK',
                                onPress: () =>
                                  navigate('TeacherExamResultView'),
                              },
                            ],
                          );
                        } else if (output === 'success') {
                          setisVisbledata(false);
                          initialfunction();
                          Alert.alert(
                            'Exam Publish',
                            'The Exam has been published Successfully',
                            [
                              {
                                text: 'OK',
                                onPress: () =>
                                  navigate('TeacherExamResultView'),
                              },
                            ],
                          );
                        } else if (output === 'Exam Not Finished') {
                          setisVisbledata(false);
                          Alert.alert(
                            'Exam Publishing',
                            'Exam is Ongoing..!',
                            [
                              {
                                text: 'OK',
                                onPress: () =>
                                  navigate('TeacherExamResultView'),
                              },
                            ],
                          );
                        } else {
                          Alert.alert(
                            'Error',
                            'Unexpected error occured! Try Again !',
                          );
                        }
                      })
                      .catch(error => {
                        Alert.alert(
                          '',
                          'Please Fill all fields',
                          [
                            {
                              text: 'OK',
                              onPress: () => {
                                setisVisbledata(false);
                              },
                            },
                          ],
                          {cancelable: false},
                        );
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
  const classListpublishResult = token => {
    
    fetch(`${GLOBALS.TEACHER_SERVICE}ExmClassListForTeacher`, {
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
        const publishresultclasses = parser
          .parseFromString(response)
          .getElementsByTagName('ExmClassListForTeacherResult')[0]
          .childNodes[0].nodeValue;

        if (publishresultclasses === 'failure') {
          setnodata(false);
          setisLoadingpublish(false);
          setisVisibleclass(false);
        } else {
          const publishresultclassdata = JSON.parse(publishresultclasses);
          const dropData = publishresultclassdata.map(element => ({
            value: element.BranchClassId,
            label: element.Class,
          }));
          setisVisibleclass(true);
          setisLoadingpublish(false);
          setdropdownSource(dropData);
          setdropdownValue(publishresultclassdata[0].BranchClassId);
          selectSubjectweb(token, publishresultclassdata[0].BranchClassId);
          publishresultclassnames(
            publishresultclassdata[0].BranchClassId,
            dropdownValue1,
            dropdownValue2,
            token,
          );
          studentExamClslistwed(
            publishresultclassdata[0].BranchClassId,
            dropdownValue1,
            token,
          );
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const selectSubjectweb = (token, dropval) => {
    fetch(`${GLOBALS.TEACHER_SERVICE}GetClassSubjects`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
  <GetClassSubjects xmlns="http://www.m2hinfotech.com//">
  <PhoneNo>${token}</PhoneNo>
  <BranchclsId>${dropval}</BranchclsId>
  </GetClassSubjects>
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
        const exampublishresultgetclasssubj = xmlDoc.getElementsByTagName(
          'GetClassSubjectsResult',
        )[0].childNodes[0].nodeValue;
        if (exampublishresultgetclasssubj === 'failure') {
          setisVisibleSubject(false);
          setisLoadingpubsubject(false);
        } else {
          const exampublishresultgetclasssubjout = JSON.parse(
            exampublishresultgetclasssubj,
          );
          const dropData = exampublishresultgetclasssubjout.map(element => ({
            value: element.SubId,
            label: element.SubName,
          }));
          setisVisibleSubject(true);
          setisLoadingpubsubject(false);
          setdropdownSource1(dropData);
          setdropdownValue1(exampublishresultgetclasssubjout[0].SubId);
          publishresultclassnames(
            dropval,
            exampublishresultgetclasssubjout[0].SubId,
            dropdownValue2,
          );
          studentExamClslistwed(
            dropdownValue,
            exampublishresultgetclasssubjout[0].SubId,
          );
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  return !nodata ? (
    <View style={styles.mainContainer}>
      <View style={styles.noDataView}>
        <Text style={styles.notDataText}>No Class Assigned</Text>
      </View>
    </View>
  ) : isLoadingpublish || isLoading || isLoadingpubsubject ? (
    <View style={{flex: 1, paddingTop: 20}}>
      <ActivityIndicator color="#C00" size="large" style={styles.progressBar} />
    </View>
  ) : (
    <View style={styles.mainContainer}>
       <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}  
  >
      <View style={styles.mainContainerTop}>
        {Platform.OS === 'ios' ? (
          <KeyboardAwareScrollView
            keyboardDismissMode="interactive"
            contentContainerStyle={styles.container}
            extraScrollHeight={extraScrollHeight}
            useNativeDriver={false}>
            <View style={{flexDirection: 'row', margin: wp('1%'),paddingHorizontal: wp('1%')}}>
              {isVisibleclass && (
                <View style={{flex: 1}}>
                  <Text>Select Class :</Text>
                  <Dropdown
                    data={dropdownSource}
                    baseColor="transparent"
                    style={[styles.pickerStyle, {marginRight: wp('1%')}]}
                    textColor="#121214"
                    selectedItemColor="#7A7A7A"
                    value={dropdownValue}
                    onChangeText={value => {
                      setdropdownValue(value);
                      onValuePublishExamClass(value);
                    }}
                  />
                </View>
              )}
              {isVisibleSubject && (
                <View style={{flex: 1}}>
                  <Text>Select Subject :</Text>
                  <Dropdown
                    data={dropdownSource1}
                    baseColor="transparent"
                    style={styles.pickerStyle}
                    textColor="#121214"
                    selectedItemColor="#7A7A7A"
                    value={dropdownValue1}
                    onChangeText={value => {
                      setdropdownValue1(value);
                      onValuePublishExamsubject(value);
                    }}
                  />
                </View>
              )}
            </View>
            <View style={{flexDirection: 'row', margin: wp('1%'),paddingHorizontal: wp('1%')}}>
              <View style={{flex: 1}}>
                <Text>Select exam type :</Text>
                <Dropdown
                  data={dropdownSource2}
                  baseColor="transparent"
                  style={[styles.pickerStyle, {marginRight: wp('1%')}]}
                  textColor="#121214"
                  selectedItemColor="#7A7A7A"
                  value={dropdownValue2}
                  onChangeText={value => {
                    setdropdownValue2(value);
                    onValuepublishresultexamtype(value);
                  }}
                />
              </View>
              {isVisble && (
                <View style={{flex: 1}}>
                  <Text>Select Exam :</Text>
                  <Dropdown
                    data={dropdownSource3}
                    baseColor="transparent"
                    style={styles.pickerStyle}
                    textColor="#121214"
                    selectedItemColor="#7A7A7A"
                    value={dropdownValue3}
                    onChangeText={value => {
                      setdropdownValue3(value);
                      onV(value);
                    }}
                  />
                </View>
              )}
            </View>
            <View style={styles.containerTable}>
              {flatlistLoading && (
                <ActivityIndicator
                  style={styles.progressBar}
                  color="#C00"
                  size="large"
                />
              )}
              {isVisbledata && (
                <ActivityIndicator
                  style={styles.progressBar}
                  color="#C00"
                  size="large"
                />
              )}
              <View style={styles.headingTableView}>
                <View style={styles.textheadBoxRoll}>
                  <Text style={styles.textc}>RL NO</Text>
                </View>
                <View style={styles.textheadboxSname}>
                  <Text style={styles.texthead}>STUDENT NAME</Text>
                </View>
                <View style={styles.textheadboxMark}>
                  <Text style={styles.textc}>MARK</Text>
                </View>
              </View>
              <View style={styles.flatlistView}>
                {isVisble2 && (
                  <FlatList
                    data={publishresultexamstdclaswiselistdatasource}
                    renderItem={({item, index}) => (
                      <View style={styles.itemStyle}>
                        <View style={styles.itemone}>
                          <Text style={styles.flatitem}>{item.RollNo}</Text>
                        </View>
                        <View style={styles.itemtwo}>
                          <Text style={styles.flatitemName}>{item.Name}</Text>
                        </View>
                        <View style={styles.itemthree}>
                          <TextInput
                            style={styles.flatListiteminput}
                            returnKeyType={
                              Platform.OS === 'ios' ? 'done' : 'next'
                            }
                            keyboardType="numeric"
                            underlineColorAndroid="transparent"
                            autoCorrect={false}
                            onChangeText={inputValue =>
                              onclickthat(inputValue, index)
                            }>
                            {item.Marks}
                          </TextInput>
                        </View>
                      </View>
                    
                    )}
                  />
                )}
              </View>
            </View>
          </KeyboardAwareScrollView>
        ) : (
          <ScrollView useNativeDriver={false}>
            <View style={{flexDirection: 'row', margin: wp('1%'),paddingHorizontal: wp('1%')}}>
              {isVisibleclass && (
                <View style={{flex: 1}}>
                  <Text>Select Class :</Text>
                  <Dropdown
                    data={dropdownSource}
                    baseColor="transparent"
                    style={[styles.pickerStyle, {marginRight: wp('1%'),paddingHorizontal: wp('1%')}]}
                    textColor="#121214"
                    selectedItemColor="#7A7A7A"
                    value={dropdownValue}
                    onChangeText={value => {
                      setdropdownValue(value);
                      onValuePublishExamClass(value);
                    }}
                  />
                </View>
              )}
              {isVisibleSubject && (
                <View style={{flex: 1}}>
                  <Text>Select Subject :</Text>
                  <Dropdown
                    data={dropdownSource1}
                    baseColor="transparent"
                    style={styles.pickerStyle}
                    textColor="#121214"
                    selectedItemColor="#7A7A7A"
                    value={dropdownValue1}
                    onChangeText={value => {
                      setdropdownValue1(value);
                      onValuePublishExamsubject(value);
                    }}
                  />
                </View>
              )}
            </View>
            <View style={{flexDirection: 'row', margin: wp('1%')}}>
              <View style={{flex: 1}}>
                <Text>Select exam type :</Text>
                <Dropdown
                  data={dropdownSource2}
                  baseColor="transparent"
                  style={[styles.pickerStyle, {marginRight: wp('1%')}]}
                  textColor="#121214"
                  selectedItemColor="#7A7A7A"
                  value={dropdownValue2}
                  onChangeText={value => {
                    setdropdownValue2(value);
                    onValuepublishresultexamtype(value);
                  }}
                />
              </View>
              {isVisble && (
                <View style={{flex: 1}}>
                  <Text>Select Exam :</Text>
                  <Dropdown
                    data={dropdownSource3}
                    baseColor="transparent"
                    style={styles.pickerStyle}
                    textColor="#121214"
                    selectedItemColor="#7A7A7A"
                    value={dropdownValue3}
                    onChangeText={value => {
                      setdropdownValue3(value);
                      onV(value);
                    }}
                  />
                </View>
              )}
            </View>
            <View style={styles.containerTable}>
              {flatlistLoading && (
                <ActivityIndicator
                  style={styles.progressBar}
                  color="#C00"
                  size="large"
                />
              )}
              {isVisbledata && (
                <ActivityIndicator
                  style={styles.progressBar}
                  color="#C00"
                  size="large"
                />
              )}
              <View style={styles.headingTableView}>
                <View style={styles.textheadBoxRoll}>
                  <Text style={styles.textc}>RL NO</Text>
                </View>
                <View style={styles.textheadboxSname}>
                  <Text style={styles.texthead}>STUDENT NAME</Text>
                </View>
                <View style={styles.textheadboxMark}>
                  <Text style={styles.textc}>MARK</Text>
                </View>
              </View>
              <View style={styles.flatlistView}>
                {isVisble2 && (
                  <FlatList
                    data={publishresultexamstdclaswiselistdatasource}
                    renderItem={({item, index}) => (
                      <View style={styles.itemStyle}>
                        <View style={styles.itemone}>
                          <Text style={styles.flatitem}>{item.RollNo}</Text>
                        </View>
                        <View style={styles.itemtwo}>
                          <Text style={styles.flatitemName}>{item.Name}</Text>
                        </View>
                        <View style={styles.itemthree}>
                          <TextInput
                            style={styles.flatListiteminput}
                            returnKeyType="next"
                            keyboardType={
                              Platform.OS === 'ios'
                                ? 'numbers-and-punctuation'
                                : 'numeric'
                            }
                            underlineColorAndroid="transparent"
                            onChangeText={inputValue =>
                              onclickthat(inputValue, index)
                            }>
                            {item.Marks}
                          </TextInput>
                        </View>
                      </View>
                    )}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.buttonstyle}
        onPress={btFabClick}>
        <Icon
          name="check"
          size={27}
          style={styles.topcontentimagelogo}
          color="#FFF"
        />
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    height: wp('22%'),
    width: wp('22%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
  },
  noDataView: {
    marginTop: wp('22%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('5%'),
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    flexDirection: 'column',
  },
  mainContainerTop: {
    flex: 6,
  },
  pickerStyle: {
    marginTop: wp('2%'),
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
    borderRadius: 1,
    borderWidth: wp('0.3%'),
    height: wp('11.3%'),
  },
  containerTable: {
    marginTop: wp('1.3%'),
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
  headingTableView: {
    height: wp('11%'),
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  textheadBoxRoll: {
    elevation: 5,
    flex: 0.8,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: wp('0.6%'),
  },
  textheadboxSname: {
    elevation: 5,
    borderColor: '#FFFFFF',
    flex: 2,
    backgroundColor: '#B866C6',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: wp('0.5%'),
  },
  textheadboxMark: {
    elevation: 5,
    borderColor: '#FFFFFF',
    flex: 1.2,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column', 
    backgroundColor: '#FFFFFF',
  },
  itemone: {
    borderBottomWidth: wp('0.5%'),
    borderBottomColor: '#E0E0E0',
    borderRightWidth: wp('0.5%'),
    borderRightColor: '#E0E0E0',
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemtwo: {
    flex: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#E0E0E0',
  },
  itemthree: {
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#E0E0E0',
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: wp('1.3%'),
    paddingTop: wp('1.3%'),
  },
  flatListiteminput: {
    height: wp('12.3%'),
    width: wp('22.3%'),
    fontSize: wp('5%'),
    textAlign: 'center',
    borderWidth: wp('0.3%'),
    borderRadius: 5,
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
  itemStyle: {
    flexDirection: 'row',
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#000000',
  },
  item: {
    height: wp('7.3%'),
    flex: 1,
    textAlign: 'center',
  },
  texthead: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    marginLeft: wp('3.3%'),
  },
  textc: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
  },
  flatitem: {
    fontSize: wp('4.5%'),
  },
  flatitemName: {
    fontSize: wp('4.5%'),
    marginLeft: wp('3.3%'),
  },
  view: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#F9F6F5',
  },
});

export default PublishResult;
