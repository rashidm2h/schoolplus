import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Alert,
  Platform,
  Keyboard,
  FlatList,
  Text,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../../config/Globals';
import {useIsFocused} from '@react-navigation/native';
import Loader from '../../../../components/ProgressIndicator';
const MyIcon = <Icon name="ios-arrow-down" size={25} color="black" />;
const MyIcon2 = <Icon name="ios-arrow-up" size={25} color="black" />;

let branchId = '';
let academicId = '';
let departmentId = '';

const EvaluatorList1 = () => {
  const isFocused = useIsFocused();
  const [data, setdata] = useState('');
  const [data2, setdata2] = useState('');
  const [data3, setdata3] = useState('');
  const [teacherId, setteacherId] = useState('');
  const [expanded, setexpanded] = useState('');
  const [remarks, setremarks] = useState('');
  const [isModalVisible, setisModalVisible] = useState(false);

  useEffect(() => {
    loadList();
  }, [isFocused]);

  const saveRemarks = () => {
    let ccc = '';

    if (remarks.length === 0) {
      Alert.alert('Incomplete Remarks', 'Please fill remarks!');
    } else {
      setisModalVisible(false);
      AsyncStorage.getItem('acess_token').then(
        keyValue2 => {
          const username = keyValue2;
          fetch(`${GLOBALS.PARENT_URL}SaveAnswers`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <SaveAnswers xmlns="http://www.m2hinfotech.com//">
            <teacherId>${teacherId}</teacherId>
            <academicId>${academicId}</academicId>
            <branchId>${branchId}</branchId>
            <questionAnswer>${[]}</questionAnswer>
            <mobileNo>${username}</mobileNo>
            <remarks>${remarks}</remarks>
            <warnings>${[]}</warnings>
          </SaveAnswers>
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
              ccc =
                xmlDoc.getElementsByTagName('SaveAnswersResult')[0]
                  .childNodes[0].nodeValue;
              console.log('cc', ccc);
              if (ccc === 'failure') {
                Alert.alert(
                  '',
                  ' Error occured!',
                  [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                  {cancelable: false},
                );
              } else {
                if ((ccc = 'success')) {
                  if (Platform.OS === 'ios') {
                    Keyboard.dismiss();
                    setTimeout(() => {
                      Alert.alert(
                        'Success',
                        'You have successfully added remarks!',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              // Keyboard.dismiss();
                              loadList();
                            },
                          },
                        ],
                        {cancelable: true},
                      );
                    }, 1000);
                  } else {
                    Alert.alert(
                      'Success',
                      'You have successfully added remarks!',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            Keyboard.dismiss();
                            loadList();
                          },
                        },
                      ],
                      {cancelable: true},
                    );
                  }
                }
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
    }
  };

  const toggleModal = () => {
    setisModalVisible(!isModalVisible);
  };

  const loadList = () => {
    AsyncStorage.getItem('Department')
      .then(keyValue2 => {
        departmentId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('BranchID')
      .then(keyValue2 => {
        branchId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('FinancialYear')
      .then(keyValue2 => {
        academicId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });
    AsyncStorage.getItem('acess_token').then(
      keyValue2 => {
        const username = keyValue2;
        fetch(`${GLOBALS.PARENT_URL}ChairmanEvaluationTeachersList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <ChairmanEvaluationTeachersList xmlns="http://www.m2hinfotech.com//">
                  <academicId>${academicId}</academicId>
                  <branchId>${branchId}</branchId>
                  <subjectId>${departmentId}</subjectId>
                  <mobileNo>${username}</mobileNo>
                </ChairmanEvaluationTeachersList>
              </soap12:Body>
            </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            console.log(response);
            console.log(`<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <ChairmanEvaluationTeachersList xmlns="http://www.m2hinfotech.com//">
                  <academicId>${academicId}</academicId>
                  <branchId>${branchId}</branchId>
                  <subjectId>${departmentId}</subjectId>
                  <mobileNo>${username}</mobileNo>
                </ChairmanEvaluationTeachersList>
              </soap12:Body>
            </soap12:Envelope>`);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const ccc = xmlDoc.getElementsByTagName(
              'ChairmanEvaluationTeachersListResult',
            )[0].childNodes[0].nodeValue;
            if (ccc === 'failure') {
              Alert.alert(
                '',
                '  No Data Available',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
              );
            } else {
              const output = JSON.parse(ccc);
              console.log('out', output);
              let data = [];
              output.Table1.forEach(element => {
                if (element.RemarkStatus === 'P') {
                  data.push(element);
                }
                setdata(data);
                setdata2(output.Table);
                setdata3(output.Table2);
              });
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

  const iconPress = (item, index) => {
    if (item.expanded) {
      let datahere = [...data];
      datahere[index].expanded = false;
      setdata(datahere);
    } else {
      let datahere = [...data];
      datahere[index].expanded = true;
      setdata(datahere);
    }
  };

  const dataAvailable = id => {
    let dataExists = false;
    let datahere = [...data2];
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        dataExists = true;
      }
    });
    return dataExists;
  };

  const evaluatorDetails = (id, type) => {
    let datahere = [...data2];
    let value = '';
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        if (type === 'marks') {
          value = element.ExternalEvalMark;
        } else {
          value = element.EvalRemarks;
        }
      }
    });
    if (value === null) {
      value = '';
    }
    return value;
  };

  const hodDetails = (id, type) => {
    let datahere = [...data2];
    let memos = [...data3];
    let array = [];
    let value = '';

    if (type === 'warnings') {
      memos.forEach(element => {
        if (id === element.TeacherId) {
          array.push(element.Warnings);
        }
      });

      value = array.join('\n');
    } else {
      datahere.forEach(element => {
        if (id === element.TeacherId) {
          if (type === 'marks') {
            value = element.HODMark;
          } else {
            value = element.HODRemarks;
          }
        }
      });
    }
    if (value === null) {
      value = '';
    }

    return value;
  };

  const principalDetails = (id, type) => {
    let datahere = [...data2];
    let value = '';
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        if (type === 'marks') {
          value = element.PrincipalMark;
        } else {
          value = element.PrincipalRemarks;
        }
      }
    });
    if (value === null) {
      value = '';
    }
    return value;
  };

  const grade = id => {
    let datahere = [...data2];
    let value = '';
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        value = element.Grade;
      }
    });
    if (value === null) {
      value = '';
    }
    return value;
  };

  const marks = id => {
    let datahere = [...data2];
    let value = '';
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        value = element.Total;
      }
    });
    if (value === null) {
      value = '';
    }
    return value;
  };

  const chairmanRemarks = id => {
    let datahere = [...data2];
    let value = '';
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        value = element.ChairmanRemarks;
      }
    });
    if (value === null) {
      value = '';
    }
    return value;
  };
  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView keyboardDismissMode="interactive">
        <FlatList
          data={data}
          renderItem={({item, index}) => (
            <View style={{backgroundColor: index % 2 ? '#f7f7f7' : 'white'}}>
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={{width: '80%'}}>
                    <Pressable
                      style={{marginLeft: 20}}
                      onPress={() => {
                        setisModalVisible(true);
                        setteacherId(item.TeacherId);
                        setremarks('');
                      }}>
                      <Text style={styles.nameText}>{`${item.Name}`}</Text>
                    </Pressable>
                  </View>
                  <View style={{width: '20%'}}>
                    {dataAvailable(item.TeacherId) ? (
                      <Pressable
                        onPress={() => iconPress(item, index)}
                        style={{justifyContent: 'center'}}>
                        <View style={{alignSelf: 'center', marginTop: 10}}>
                          {item.expanded ? MyIcon2 : MyIcon}
                        </View>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
                {item.expanded && dataAvailable(item.TeacherId) ? (
                  <View>
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 5,
                        marginTop: 10,
                      }}>{`Evaluator Marks: ${evaluatorDetails(
                      item.TeacherId,
                      'marks',
                    )}`}</Text>
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 15,
                      }}>{`Evaluator Remarks: ${evaluatorDetails(
                      item.TeacherId,
                      'remarks',
                    )}`}</Text>
                    <View
                      style={{
                        borderTopWidth: 0.25,
                        width: '100%',
                        borderTopColor: 'gray',
                      }}
                    />
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 5,
                        marginTop: 15,
                      }}>{`HOD Marks: ${hodDetails(
                      item.TeacherId,
                      'marks',
                    )}`}</Text>
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 5,
                      }}>{`HOD Remarks: ${hodDetails(
                      item.TeacherId,
                      'remarks',
                    )}`}</Text>
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 15,
                      }}>{`HOD Warnings: ${hodDetails(
                      item.TeacherId,
                      'warnings',
                    )}`}</Text>
                    <View
                      style={{
                        borderTopWidth: 0.25,
                        width: '100%',
                        borderTopColor: 'gray',
                      }}
                    />
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 5,
                        marginTop: 15,
                      }}>{`Principal Marks: ${principalDetails(
                      item.TeacherId,
                      'marks',
                    )}`}</Text>
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 15,
                      }}>{`Principal Remarks: ${principalDetails(
                      item.TeacherId,
                      'remarks',
                    )}`}</Text>
                    <View
                      style={{
                        borderTopWidth: 0.25,
                        width: '100%',
                        borderTopColor: 'gray',
                      }}
                    />
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 5,
                        marginTop: 15,
                      }}>{`Total Marks: ${marks(item.TeacherId)}`}</Text>
                    <Text
                      style={{
                        marginRight: 10,
                        marginLeft: 10,
                        marginBottom: 15,
                      }}>{`Grade: ${grade(item.TeacherId)}`}</Text>
                    <View
                      style={{
                        borderTopWidth: 0.25,
                        width: '100%',
                        borderTopColor: 'gray',
                      }}
                    />
                    <Text
                      style={{
                        margin: 10,
                      }}>{`My Remarks: ${chairmanRemarks(
                      item.TeacherId,
                    )}`}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.line} />}
        />
      </KeyboardAwareScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => Keyboard.dismiss()}
        animationOutTiming={0}
        style={{alignSelf: 'center'}}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 22,
            height: 300,
            width: 280,
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          <KeyboardAwareScrollView
            style={{flex: 1}}
            keyboardShouldPersistTaps="always">
            <Text style={{textAlign: 'center', marginBottom: 25}}>
              ADD YOUR REMARKS
            </Text>
            <TextInput
              multiline
              style={{
                textAlignVertical: 'top',
                height: 100,
                borderColor: 'gray',
                borderWidth: 1,
              }}
              onChangeText={text => setremarks(text)}
              value={remarks}
            />
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Pressable
                onPress={() => saveRemarks()}
                style={{
                  marginTop: 25,
                  borderRadius: 3,
                  marginRight: 10,
                  width: 70,
                  height: 35,
                  backgroundColor: '#13C0CE',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: 'white'}}>SUBMIT</Text>
              </Pressable>
              <Pressable
                style={{
                  marginTop: 25,
                  borderRadius: 3,
                  width: 70,
                  height: 35,
                  backgroundColor: 'gray',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => toggleModal()}>
                <Text style={{color: 'white'}}>CANCEL</Text>
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default EvaluatorList1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#BA69C8',
    elevation: 3,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: 10,
    marginTop: 10,
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: 10,
    marginTop: 10,
  },
  textcontaintwo: {
    flex: 2,
  },
  textcontainthree: {
    flex: 1.25,
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  itemone: {
    flex: 2,
    paddingTop: 10,
    paddingBottom: 10,
    // alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 1.25,
    paddingTop: 10,
    paddingBottom: 10,
    // marginLeft: 10,
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  item: {
    marginLeft: 5,
  },
  line: {
    width: '100%',
    borderTopWidth: 0.75,
    borderTopColor: 'grey',
  },

  nameText: {
    fontSize: 16,
    marginLeft: Platform.OS === 'ios' ? 20 : 0,
    margin: 10,
  },
});
