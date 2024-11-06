import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import DeviceInfo from 'react-native-device-info';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
const ViewResult = () => {
  const [keys, setkeys] = useState('');
  const [domain, setdomain] = useState('');
  const [totalmarks, settotalmarks] = useState('');
  const [percentages, setpercentages] = useState('');
  const [accessToken, setaccessToken] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownValue2, setdropdownValue2] = useState('');
  const [dataSourcefore, setdataSourcefore] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dataSourceAlert, setdataSourceAlert] = useState([]);
  const [dropdownSource2, setdropdownSource2] = useState([]);
  const [isVisiblefst, setisVisiblefst] = useState(true);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [flatlistLoading, setflatlistLoading] = useState(true);
  const [dropdownValue1, setdropdownValue1] = useState('CommonExam');
  const dropdownSource1 = [
    {
      label: 'Common Exam',
      value: 'CommonExam',
    },
    {
      label: 'Internal',
      value: 'Internal',
    },
  ];

  let bcls;
  let examids;
  let avkexamId = '';
  let avkexamIdStatus = true;
  const parser = new DOMParser();

  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      setdomain(value);
      AsyncStorage.getItem('acess_token').then(keyValue => {
        setaccessToken(keyValue);
        viewresultclassFunc(keyValue);
      });
    });
  }, []);

  const avkHeader = (item, exam, items) => {
    if (item !== avkexamId) {
      avkexamIdStatus = true;
      avkexamId = item;
    } else {
      avkexamIdStatus = false;
    }

    return item > 4 ? (
      <View>
        {avkexamIdStatus ? (
          <View>
            <View style={styles.examTotalView}>
              <Text style={{fontSize: 16, color: '#B866C6'}}>{exam}</Text>
            </View>
            <View style={styles.topcontaineralert}>
              <View style={styles.textcontaineonealertoneSubject}>
                <Text style={styles.textalert}>{Object.keys(items)[2]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{Object.keys(items)[6]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={[styles.textalert, {fontSize: 12}]}>
                  {Object.keys(items)[7]}
                </Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{Object.keys(items)[8]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{Object.keys(items)[9]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{Object.keys(items)[10]}</Text>
              </View>
              <View style={styles.textcontaineonealertlast}>
                <Text style={styles.textalert}>Grade</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    ) : (
      <View>
        {avkexamIdStatus ? (
          <View>
            <View style={styles.avkexamView}>
              <Text style={{fontSize: 16, color: '#B866C6'}}>{exam}</Text>
            </View>
            <View style={styles.topcontaineralert}>
              <View style={styles.textcontaineonealertoneSubject}>
                <Text style={styles.textalert}>{Object.keys(items)[2]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{Object.keys(items)[3]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{Object.keys(items)[4]}</Text>
              </View>
              <View style={styles.textcontaineonealertlast}>
                <Text style={styles.textalert}>{Object.keys(items)[5]}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  };
  const Alert = (title, description) => {
    alert(
      title,
      description,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  };

  const onValueexamtype = value => {
    viewresultexamnamesFunc(accessToken, dropdownValue, value);
  };

  const viewresultclassFunc = value => {
  //   console.log(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=TeacherClasses`, `<?xml version="1.0" encoding="utf-8"?>
  //     <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  //     <soap12:Body>
  //       <TeacherClasses xmlns="http://www.m2hinfotech.com//">
  //       <PhoneNo>${value}</PhoneNo>
  //     </TeacherClasses>
  //   </soap12:Body>
  // </soap12:Envelope>
  // `)
    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=TeacherClasses`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <TeacherClasses xmlns="http://www.m2hinfotech.com//">
              <PhoneNo>${value}</PhoneNo>
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
        const examresultview = parser
          .parseFromString(response)
          .getElementsByTagName('TeacherClassesResult')[0]
          .childNodes[0].nodeValue;
        if (examresultview === 'failure') {
          setisVisiblefst(false);
          Alert(
            'Failure',
            'Incorrect!',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        } else {
          console.log('success');
        }
        const examresultviewdata = JSON.parse(examresultview);
        let dropdownData = examresultviewdata;
        const dropData = dropdownData.map(element => ({
          value: element.BranchClassId,
          label: element.Class,
        }));
        setdropdownSource(dropData);
        setdropdownValue(dropdownData[0].BranchClassId);
        viewresultexamnamesFunc(
          value,
          dropdownData[0].BranchClassId,
          dropdownValue1,
        );
        viewresultclasslist(dropdownData[0].BranchClassId, dropdownValue1);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onValueResultExam = value => {
    setflatlistLoading(true);
    viewresultexamnamesFunc(accessToken, value, dropdownValue1);
    viewresultclasslist(value, dropdownValue2);
  };

  const viewresultexamnamesFunc = (value, bcl, dropval) => {
    if (dropval === 'CommonExam' && domain === 'avk.schoolplusapp.com') {
      return null;
    } else {
      AsyncStorage.setItem('branchidresult', bcl);
      const result = JSON.parse(JSON.stringify(dropval));
      fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetExamList`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
                <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                  <GetExamList xmlns="http://www.m2hinfotech.com//">
                  <PhoneNo>${
                    value !== undefined ? value : accessToken
                  }</PhoneNo>
                  <BranchclsId>${
                    bcl !== undefined ? bcl : dropdownValue
                  }</BranchclsId>
                  <ExType>${result}</ExType>
                </GetExamList>
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
          const examresultviewexamname = parser
            .parseFromString(response)
            .getElementsByTagName('GetExamListResult')[0]
            .childNodes[0].nodeValue;
          if (examresultviewexamname === 'failure') {
            setflatlistLoading(false);
            Alert.alert(
              'No Exam',
              'No examinations scheduled for this class',
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              {cancelable: false},
            );
          } else {
            const examresultviewexamnamedata = JSON.parse(
              examresultviewexamname,
            );
            let dropdownData = examresultviewexamnamedata;
            const dropData = dropdownData.map(element => ({
              value: element.ExamId,
              label: element.ExamName,
            }));
            setdropdownSource2(dropData);
            setdropdownValue2(dropdownData[0].ExamId);
            viewresultclasslist(dropdownValue, dropdownData[0].ExamId);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  const onValuegetexmaname = value => {
    viewresultclasslist(dropdownValue, value);
  };

  const viewresultclasslist = (drop1, drop2) => {
    examids = drop2;
    bcls = drop1;
    AsyncStorage.setItem('examid', drop2);
    fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=StdAttClasswiseList`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <StdAttClasswiseList xmlns="http://www.m2hinfotech.com//">
          <BranchclsId>${bcls}</BranchclsId>
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
        const examresultviewstudclasslist = parser
          .parseFromString(response)
          .getElementsByTagName('StdAttClasswiseListResult')[0]
          .childNodes[0].nodeValue;
        if (examresultviewstudclasslist !== 'failure') {
          const outputfore = JSON.parse(examresultviewstudclasslist);
          setflatlistLoading(false);
          setdataSourcefore(outputfore);
        } else {
          setdataSourcefore('');
          console.log('failure :examresultviewstudclasslist');
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const _showModal = () => setisModalVisible(true);

  const _hideModal = () => {
    avkexamId = '';
    setisModalVisible(false);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={{flexDirection: 'row', margin: wp('1%'),paddingHorizontal: wp('1%')}}>
        <View style={{flex: 1}}>
          <Text style={{}}>Select Class :</Text>
          {isVisiblefst === true ? (
            <Dropdown
              inputContainerStyle={styles.dropdownInput}
              baseColor="transparent"
              data={dropdownSource}
              style={[
                styles.pickerStyle,
                {
                  marginRight: wp('1.5%'),
                },
              ]}
              textColor="#121214"
              selectedItemColor="#7A7A7A"
              value={dropdownValue}
              onChangeText={value => {
                setdropdownValue(value);
                onValueResultExam(value);
              }}
            />
          ) : (
            <View style={styles.pickerviewstwos}>
              <Picker />
            </View>
          )}
        </View>
        <View style={{flex: 1}}>
          <Text style={{}}>Select exam type :</Text>
          <Dropdown
            inputContainerStyle={styles.dropdownInput}
            baseColor="transparent"
            data={dropdownSource1}
            style={styles.pickerStyle}
            textColor="#121214"
            selectedItemColor="#7A7A7A"
            value={dropdownValue1}
            onChangeText={value => {
              setdropdownValue1(value);
              onValueexamtype(value);
            }}
          />
        </View>
      </View>
      {dropdownValue1 === 'CommonExam' &&
      domain === 'avk.schoolplusapp.com' ? null : (
        <View style={{flex: 1, margin: wp('1%'),paddingHorizontal: wp('1%')}}>
          <Text style={{}}>Select Exam :</Text>
          <Dropdown
            inputContainerStyle={styles.dropdownInput}
            baseColor="transparent"
            data={dropdownSource2}
            style={styles.pickerStyle}
            textColor="#121214"
            selectedItemColor="#7A7A7A"
            value={dropdownValue2}
            onChangeText={value => {
              setdropdownValue2(value);
              onValuegetexmaname(value);
            }}
          />
        </View>
      )}
      <View style={styles.mainContainerTop}>
        <View style={styles.containerTable}>
          {flatlistLoading && (
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
              <Text style={styles.textc}>STUDENT NAME</Text>
            </View>
          </View>
          <View style={styles.flatlistView}>
            <FlatList
              data={dataSourcefore}
              renderItem={({item}) => (
                <View style={styles.flatitemStyles}>
                  <View style={styles.itemones}>
                    <Text style={styles.flatitems}>{item.RollNo}</Text>
                  </View>
                  <View style={styles.itemtwos}>
                    <Text style={styles.flatitems}>{item.Name}</Text>
                  </View>
                  <View style={styles.itemthrees}>
                    <TouchableOpacity
                      style={styles.buttonResultView}
                      onPress={() => {
                        if (
                          dropdownValue1 === 'CommonExam' &&
                          domain === 'avk.schoolplusapp.com'
                        ) {
                          if (dropdownValue2 > 4) {
                          } else {
                          }

                          AsyncStorage.getItem('BranchID').then(BranchID => {
                            fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=RetrieveAllMarksheet`, {
                              method: 'POST',
                              body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <RetrieveAllMarksheet xmlns="http://www.m2hinfotech.com//">
                <studentId>${item.StudId}</studentId>
                <brnachId>${BranchID}</brnachId>
              </RetrieveAllMarksheet>
            </soap12:Body>
          </soap12:Envelope>`,
                              headers: {
                                Accept: 'application/json',
                                'Content-Type':
                                  'application/soap+xml; charset=utf-8',
                              },
                            })
                              .then(response => response.text())
                              .then(response => {
                                const xmlDoc = parser.parseFromString(response);
                                const v = xmlDoc.getElementsByTagName(
                                  'RetrieveAllMarksheetResult',
                                )[0].childNodes[0].nodeValue;
                                if (v === 'failure') {
                                  Alert('No Results', 'Results not published!');
                                } else {
                                  const rslt = JSON.parse(v);
                                  setdataSourceAlert(rslt);
                                  setkeys(keys);
                                  _showModal();
                                }
                              })
                              .catch(error => {
                                console.log(error);
                              });
                          });
                        } else {
                          AsyncStorage.getItem('branchidresult').then(
                            keyValue2 => {
                              const bclsd = keyValue2;
                              AsyncStorage.getItem('examid').then(
                                keyValueid => {
                                  examids = keyValueid;
                                  fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetStdMark`, {
                                    method: 'POST',
                                    body: `<?xml version="1.0" encoding="utf-8"?>
                                  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                                  <soap12:Body>
                                    <GetStdMark xmlns="http://www.m2hinfotech.com//">
                                    <BranchclsId>${bclsd}</BranchclsId>
                                    <StdId>${item.StudId}</StdId>
                                    <ExamId>${examids}</ExamId>
                                  </GetStdMark>
                                </soap12:Body>
                              </soap12:Envelope>
                              `,
                                    headers: {
                                      Accept: 'application/json',
                                      'Content-Type':
                                        'application/soap+xml; charset=utf-8',
                                    },
                                  })
                                    .then(response => response.text())
                                    .then(response => {
                                      const result = parser
                                        .parseFromString(response)
                                        .getElementsByTagName(
                                          'GetStdMarkResult',
                                        )[0].childNodes[0].nodeValue;
                                      if (result === 'failure') {
                                        Alert(
                                          'No Results',
                                          'Results not published!',
                                        );
                                      } else {
                                        const outputfore = JSON.parse(result);
                                        const totalmark =
                                          outputfore[0].TotalMark;
                                        const percentage =
                                          outputfore[0].TotalPercentage;
                                        setdataSourceAlert(outputfore);
                                        settotalmarks(totalmark);
                                        setpercentages(percentage);
                                        _showModal();
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
                        }
                      }}>
                      <Text style={styles.bttxtViewRslt}>View Result</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
        <Modal
          isVisible={isModalVisible}
          onBackButtonPress={() => setisModalVisible(false)}>
          {domain === 'avk.schoolplusapp.com' ? (
            <View style={styles.container}>
              <View style={styles.welcomeAlert}>
                {dataSourceAlert.length > 0 && (
                  <FlatList
                    data={dataSourceAlert}
                    renderItem={({item}) => {
                      return (
                        <View style={styles.modalViewStyle}>
                          {avkHeader(
                            item[Object.keys(item)[0]],
                            item[Object.keys(item)[1]],
                            item,
                          )}
                          <View style={styles.flatlistMarkTable}>
                            {item[Object.keys(item)[0]] > 4 ? (
                              <View style={styles.itemStylealert}>
                                <View style={styles.itemsoneAlertSubject}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[2]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[6]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[7]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[8]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[9]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[10]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[11]]}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <View style={styles.itemStylealert}>
                                <View style={styles.itemsoneAlertSubject}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[2]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[3]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {item[Object.keys(item)[4]]}
                                  </Text>
                                </View>
                                <View style={styles.itemsoneAlert}>
                                  <Text style={styles.flatitem}>
                                    {!item[Object.keys(item)[5]]
                                      ? item[Object.keys(item)[5]]
                                      : String.prototype.trim.call(
                                          item[Object.keys(item)[5]],
                                        )}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
                <View style={styles.closbuttonview}>
                  <TouchableOpacity
                    style={styles.closebutton}
                    onPress={_hideModal}>
                    <Text style={styles.bttxtViewRslt}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.container}>
              <View style={styles.topcontaineralert}>
                <View style={styles.textcontaineonealertoneSubject}>
                  <Text style={styles.textalert}>SUBJECT</Text>
                </View>
                <View style={styles.textcontaineonealertone}>
                  <Text style={styles.textalert}>MARK</Text>
                </View>
                <View style={styles.textcontaineonealertone}>
                  <Text style={styles.textalert}>MAX MARK</Text>
                </View>
                <View style={styles.textcontaineonealertlast}>
                  <Text style={styles.textalert}>GRADE</Text>
                </View>
              </View>
              <View style={styles.welcomeAlert}>
                <FlatList
                  data={dataSourceAlert}
                  renderItem={({item}) => (
                    <View style={styles.flatlistMarkTable}>
                      <View style={styles.itemStylealert}>
                        <View style={styles.itemsoneAlertSubject}>
                          <Text style={styles.flatitem}>{item.SubName}</Text>
                        </View>
                        <View style={styles.itemsoneAlert}>
                          <Text style={styles.flatitem}>
                            {item.StudentMark}
                          </Text>
                        </View>
                        <View style={styles.itemsoneAlert}>
                          <Text style={styles.flatitem}>{item.MaxMark}</Text>
                        </View>
                        <View style={styles.itemsoneAlert}>
                          <Text style={styles.flatitem}>
                            {!item.GradeName
                              ? item.GradeName
                              : String.prototype.trim.call(item.GradeName)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                />

                <View style={styles.seconditem}>
                  <Text style={styles.secondtext}>
                    Total marks: {totalmarks}
                  </Text>
                  <Text style={styles.secondtext}>
                    Percentage: {percentages}
                  </Text>
                </View>
                <View style={styles.closbuttonview}>
                  <TouchableOpacity
                    style={styles.closebutton}
                    onPress={_hideModal}>
                    <Text style={styles.bttxtViewRslt}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    height: wp('24%'),
    width: wp('24%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  examTotalView: {
    height: wp('12%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%'),
    backgroundColor: 'white',
  },
  avkexamView: {
    height: wp('12%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('100%'),
    backgroundColor: 'white',
  },
  mainContainerTop: {
    flex: 4,
  },
  dropdownInput: {
    borderBottomColor: 'transparent',
  },
  modalViewStyle: {
    marginTop: wp('9%'),
  },
  containerTable: {
    marginTop: wp('1.5%'),
    elevation: 0.5,
    flex: 7,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: wp('0.3%'),
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
  },
  headingTableView: {
    height: wp('12%'),
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  textheadBoxRoll: {
    elevation: 5,
    flex: 0.5,
    backgroundColor: '#B866C6',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: wp('0.3%'),
  },
  textheadboxSname: {
    elevation: 5,
    borderColor: '#FFFFFF',
    flex: 2,
    backgroundColor: '#B866C6',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  pickerStyle: {
    marginTop: wp('2%'),
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
    borderRadius: wp('0.3%'),
    borderWidth: wp('0.3%'),
    height: wp('12.6%'),
  },
  item: {
    height: wp('7%'),
    flex: 1,
    textAlign: 'center',
  },
  textc: {
    marginLeft: wp('3.5%'),
    fontSize: wp('4.2%'),
    color: '#FFFFFF',
  },
  flatitem: {
    fontSize: wp('4%'),
  },
  pickerviewstwos: {
    height: wp('9%'),
    width: wp('40%'),
    marginLeft: wp('3.5%'),
    margin: wp('0.3%'),
    borderWidth: wp('0.3%'),
    borderColor: '#C7C7C7',
    borderRadius: 2,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  flatitemStyles: {
    height: wp('15.5%'),
    flexDirection: 'row',
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: wp('1%'),
  },
  itemones: {
    flex: 0.5,
    borderRightColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
  },
  itemtwos: {
    borderRightColor: '#E0E0E0',
    flex: 1.3,
    alignItems: 'flex-start',
    marginLeft: wp('3.5%'),
    justifyContent: 'center',
  },
  itemthrees: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonResultView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('24%'),
    height: wp('9.7%'),
    backgroundColor: '#4CB050',
    elevation: 5,
  },
  bttxtViewRslt: {
    fontSize: wp('3%'),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  flatitems: {
    fontSize: wp('4.5%'),
  },
  container: {
    flexDirection: 'column',
    flex: 1,
    marginVertical: DeviceInfo.hasNotch() ? wp('9%') : 0,
    backgroundColor: '#FFFFFF',
  },
  welcomeAlert: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  topcontaineralert: {
    height: wp('16%'),
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  textcontaineonealertoneSubject: {
    flex: 2,
    backgroundColor: '#B866C6',
    paddingLeft: wp('2%'),
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#FFFFFF',
  },
  textcontaineonealertone: {
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#FFFFFF',
  },
  textcontaineonealertlast: {
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textalert: {
    fontSize: wp('4.5%'),
    flexWrap: 'wrap',
    color: '#FFFFFF',
  },
  flatlistMarkTable: {
    flex: 1,
  },
  itemStylealert: {
    flexDirection: 'row',
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#E0E0E0',
  },
  itemsoneAlertSubject: {
    flex: 2,
    paddingTop: wp('1.5%'),
    paddingBottom: wp('1.5%'),
    paddingLeft: wp('1%'),
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#E0E0E0',
  },
  itemsoneAlert: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#E0E0E0',
  },
  seconditem: {
    marginLeft: wp('3.5%'),
    marginTop: wp('3.5%'),
  },
  secondtext: {
    fontSize: wp('4.4%'),
  },
  closebutton: {
    paddingVertical: wp('3.5%'),
    paddingHorizontal: wp('3.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12BAD1',
  },
  closbuttonview: {
    marginBottom: wp('6.9%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewResult;
