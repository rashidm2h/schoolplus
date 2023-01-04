import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  Keyboard,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import RNFetchBlob from 'rn-fetch-blob';
import {CheckBox} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';
import Spinner from '../../../components/Spinner';

const SendIndividualNotes = ({navigation}) => {
  const [data, setdata] = useState('');
  const [smsCount, setsmsCount] = useState('');
  const [studentIds, setstudentIds] = useState('');
  const [sendNoteTitle, setsendNoteTitle] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [sendNoteDescription, setsendNoteDescription] = useState('');
  const [sendSms, setsendSms] = useState(false);
  const [mainCheck, setmainCheck] = useState(false);
  const [spinnerVisible, setspinnerVisible] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [attachSet, setattachSet] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [templateData, settemplateData] = useState([
    {value: 0, label: 'SELECT', Template: '', templateId: 0},
  ]);
  const [templatevalue, settemplatevalue] = useState([]);
  const [templateId, settemplateId] = useState(0);
  const [dropdownSource1, setdropdownSource1] = useState([]);

  useEffect(() => {
    getStudentList();
    AccessTemplate();
  }, []);

  useEffect(() => {
    getList();
  }, [dropdownValue1]);

  useEffect(() => {
    let array = [...studentIds];
    if (mainCheck) {
      array.map(element => {
        element.status = true;
      });
      // console.log(array);
      setstudentIds(array);
    } else {
      array.map(element => {
        element.status = false;
      });
      // console.log(array);
      setstudentIds(array);
    }
    // console.log(array);
  }, [mainCheck]);
  // const sendNote = () => {
  //   if (sendSms === true) {
  //     if (templateId === 0) {
  //       Alert.alert('Warning!', 'Please Select Template!');
  //     } else {
  //       sendNoteFunction();
  //     }
  //   } else {
  //     if (templateId === 0) {
  //       if (
  //         sendNoteTitle.length === 0 ||
  //         sendNoteDescription.length === 0 ||
  //         sendNoteTitle === '' ||
  //         sendNoteDescription === ''
  //       ) {
  //         Alert.alert('Empty Note!', 'Please fill all details!');
  //       } else {
  //         sendNoteFunction();
  //       }
  //     } else {
  //       sendNoteFunction();
  //     }
  //   }
  // };
  const sendNote = () => {
    if (sendSms === true) {
      if (templateId === 0) {
        Alert.alert('Warning!', 'Please Select Template!');
      } else {
        if (sendNoteDescription.length === 0 || sendNoteDescription === '') {
          Alert.alert('Empty Note!', 'Please fill all details!');
        } else {
          sendNoteFunction();
        }
      }
    } else {
      if (templateId === 0) {
        if (
          sendNoteTitle.length === 0 ||
          sendNoteDescription.length === 0 ||
          sendNoteTitle === '' ||
          sendNoteDescription === ''
        ) {
          Alert.alert('Empty Note!', 'Please fill all details!');
        } else {
          sendNoteFunction();
        }
      } else {
        if (sendNoteDescription.length === 0 || sendNoteDescription === '') {
          Alert.alert('Empty Note!', 'Please fill all details!');
        } else {
          sendNoteFunction();
        }
      }
    }
  };
  const sendNoteFunction = () => {
    setspinnerVisible(true);
    let branchClassId = '';
    let studentArray = [];
    studentIds.map(element => {
      if (element.status) {
        studentArray.push({id: element.StudId});
      }
    });
    const attachArray = JSON.stringify(attachSet);
    let studentArrayString = JSON.stringify(studentArray);
    if (studentIds.length === studentArray.length) {
      branchClassId = dropdownValue1;
    }
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    let NoteTitle = sendNoteTitle.replace(/&/g, '&amp;');
    NoteTitle = NoteTitle.replace(/</g, '&lt;');
    NoteTitle = NoteTitle.replace(/>/g, '&gt;');
    let NoteDescription = sendNoteDescription.replace(/&/g, '&amp;');
    NoteDescription = NoteDescription.replace(/</g, '&lt;');
    NoteDescription = NoteDescription.replace(/>/g, '&gt;');
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const username = keyValue;
        fetch(`${GLOBALS.PARENT_URL}InsertIndividualParentNoteByAdmin`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <InsertIndividualParentNoteByAdmin xmlns="http://www.m2hinfotech.com//">
                <senderNo>${username}</senderNo>
                <studentId>${studentArrayString}</studentId>
                <templateId>${templateId}</templateId>
                <title>${NoteTitle}</title>
                <description>${NoteDescription}</description>
                <branchId>${branchId}</branchId>
                <branchClassId>${branchClassId}</branchClassId>
                <sendSMS>${sendSms}</sendSMS>
                <attachs>${attachArray}</attachs>
              </InsertIndividualParentNoteByAdmin>
            </soap12:Body>
          </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const output = xmlDoc.getElementsByTagName(
              'InsertIndividualParentNoteByAdminResult',
            )[0].childNodes[0].nodeValue;
            if (output === 'failure') {
              setspinnerVisible(false);
              setsendNoteDescription('');
              settemplatevalue('');
              settemplateId(0);
              setsendNoteTitle('');
              Alert.alert('Failed!', 'Note Sending has been failed');
            } else {
              setspinnerVisible(false);
              setsendNoteDescription('');
              settemplatevalue('');
              settemplateId(0);
              setsendNoteTitle('');
              setTimeout(() => {
                Alert.alert('Success!', 'Note Sent Successfully');
              }, 1000);
            }
          });
      },
      error => {
        setspinnerVisible(true);
        console.log(error); //Display error
      },
    );
    setattachSet([]);
    setisModalVisible(false);
  };
  const AccessTemplate = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.PARENT_URL}FillTemplates`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <FillTemplates xmlns="http://www.m2hinfotech.com//">
                <MobileNo>${keyValue}</MobileNo>
                <BranchId>${branchId}</BranchId>
              </FillTemplates>
            </soap12:Body>
          </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName('FillTemplatesResult')[0]
              .childNodes[0].nodeValue;
            if (v === 'failure') {
              settemplateId(0);
              // setdataerror(true);
            } else {
              const output = JSON.parse(v);
              output.map(element => {
                templateData.push({
                  value: element.Id,
                  label: element.TemplateName,
                  Template: element.Template,
                  templateId: element.TemplateId,
                });
              });
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

  const textCountFunction = () => {
    let totalCount = sendNoteTitle.length + sendNoteDescription.length;
    let sms = totalCount % 160;
    let smsDiv = totalCount / 160;

    let totalSms = 0;
    if (smsDiv <= 1 && smsDiv > 0) {
      totalSms = 1;
    } else {
      if (sms === 0) {
        totalSms = smsDiv;
      } else {
        totalSms = parseInt(smsDiv) + 1;
      }
    }
    return `(${totalCount}/${totalSms})`;
  };

  const smsBalance = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.PARENT_URL}SMSBalance`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <SMSBalance xmlns="http://www.m2hinfotech.com//">
                <branchID>${branchId}</branchID>
              </SMSBalance>
            </soap12:Body>
          </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v =
              xmlDoc.getElementsByTagName('SMSBalanceResult')[0].childNodes[0]
                .nodeValue;
            if (v === 'failure') {
            } else {
              const rslt = JSON.parse(v);
              setsmsCount(rslt[0].SMS_limit);
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

  const checkboxPress = () => {
    setsendSms(!sendSms);
    smsBalance();
  };

  const mainCheckFunction = () => {
    setmainCheck(!mainCheck);
  };

  const itemCheck = (item, index) => {
    let array = [...studentIds];
    if (array[index].status) {
      array[index].status = false;
    } else {
      array[index].status = true;
    }
    setstudentIds(array);
  };

  const getStudentList = () => {
    let username = '';
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });

    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        username = keyValue; //Display key value
        fetch(`${GLOBALS.PARENT_URL}GetAllClasses`, {
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
            } else {
              const output = JSON.parse(ccc);
              let dropdownData = output;
              const dropData = dropdownData.map(element => ({
                value: element.class_Id,
                label: element.Class_name,
              }));
              setdropdownSource(dropData);
              setdropdownValue(dropdownData[0].class_Id);
              getDivisions(dropdownData[0].class_Id);
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

  const getDivisions = classId => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });

    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.PARENT_URL}GetDivisions`, {
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

  const getList = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}StdAttClasswiseList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <StdAttClasswiseList xmlns="http://www.m2hinfotech.com//">
        <BranchclsId>${dropdownValue1}</BranchclsId>
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
            } else {
              const output = JSON.parse(ccc);
              let array = [];
              output.map(element => {
                array.push({StudId: element.StudId, status: true});
              });
              setstudentIds(array);
              setdata(output);
              setmainCheck(true);
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

  const fromCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 500,
      cropping: false,
      includeBase64: true,
      compressImageQuality: 0.6,
    }).then(image => {
      const dataArray = [...attachSet];
      dataArray.push({
        filename: image.path.split('/').pop(),
        filedata: `data:${image.mime};base64,${image.data}`,
        filetype: image.mime,
      });
      setattachSet(dataArray);
    });
  };

  const uploadDocument = () => {
    Alert.alert('', 'Please select file type', [
      {
        text: 'Camera',
        onPress: () => {
          fromCamera();
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          uploadDocuments();
        },
      },
      {
        text: 'Cancel',
        onPress: () => {},
      },
    ]);
  };

  const uploadDocuments = async (type, i) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      let path =
        Platform.OS === 'ios' ? res.uri.replace('file://', '') : res.uri;
      RNFetchBlob.fs.readFile(path, 'base64').then(encoded => {
        const dataArray = [...attachSet];
        dataArray.push({
          filename: res.name,
          filedata: encoded,
          filetype: res.type,
        });
        setattachSet(dataArray);
      });
    } catch (err) {
      console.log(err, 'err');
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const renderItems = ({item, index}) => (
    <View style={styles.renderView}>
      <Text style={styles.renderText}>{item.filename}</Text>
      <Pressable
        onPress={() => {
          const check = [...attachSet];
          check.splice(index, 1);
          setattachSet(check);
        }}>
        <Icon name="close" size={wp('6%')} color="red" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      <View style={styles.classSelection}>
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
        <Dropdown
          icon="chevron-down"
          baseColor="transparent"
          underlineColor="transparent"
          containerStyle={styles.pickerStyle}
          data={dropdownSource1}
          value={dropdownValue1}
          onChangeText={value => {
            setdropdownValue1(value);
          }}
        />
        <Pressable
          style={styles.sendButton}
          onPress={() => {
            let bool = false;
            studentIds.map(element => {
              if (element.status) {
                bool = true;
                return;
              }
            });
            if (bool) {
              setattachSet([]);
              setisModalVisible(true);
            } else {
              Alert.alert('Oops!', 'You have not selected any student');
            }
          }}>
          <Text style={{color: 'white', fontSize: 16}}>SEND</Text>
        </Pressable>
      </View>
      <View style={styles.containerTable}>
        <View style={styles.headingTableView}>
          <CheckBox
            onPress={() => mainCheckFunction()}
            checkedColor="white"
            uncheckedColor="white"
            containerStyle={{
              borderColor: '#FFFFFF',
            }}
            checked={mainCheck}
          />
          <View style={styles.textcontaineone}>
            <Text style={styles.textc}>RL NO</Text>
          </View>
          <View style={styles.buttonView} />
          <View style={styles.textcontaintwo}>
            <Text style={styles.textc}>STUDENT NAME</Text>
          </View>
        </View>
        <View style={styles.flatlistView}>
          <FlatList
            data={data}
            renderItem={({item, index}) => (
              <Pressable>
                <View style={styles.itemStyle}>
                  <CheckBox
                    onPress={() => itemCheck(item, index)}
                    checked={
                      mainCheck
                        ? studentIds[index].status
                        : studentIds[index].status
                        ? true
                        : false
                    }
                  />
                  <View style={styles.itemone}>
                    <Text style={styles.item}>{item.RollNo}</Text>
                  </View>
                  <View style={styles.itemtwo}>
                    <Text style={styles.item}>{item.Name}</Text>
                  </View>
                </View>
              </Pressable>
            )}
            keyExtractor={(item, index) => index}
          />
        </View>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => {
          Keyboard.dismiss();
        }}>
        <SafeAreaView style={{flex: 1}}>
          <ScrollView keyboardShouldPersistTaps="always">
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={10}>
              <View style={styles.ModalContainer}>
                <View style={styles.containerColoum}>
                  <View>
                    <Text style={styles.Modaltext}>Template</Text>
                    <Dropdown
                      icon="chevron-down"
                      baseColor="transparent"
                      underlineColor="transparent"
                      containerStyle={[
                        styles.pickerStyle,
                        {borderColor: '#607D8B', width: '99%'},
                      ]}
                      data={templateData}
                      value={templatevalue}
                      onChangeText={(value, index) => {
                        settemplatevalue(value);
                        setsendNoteDescription(templateData[index].Template);
                        // settemplateId(templateData[index].templateId);
                        settemplateId(value);
                        setsendNoteTitle('');
                      }}
                    />
                  </View>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <Text
                      style={[
                        styles.Modaltext,
                        {color: templateId === 0 ? 'black' : 'grey'},
                      ]}>
                      Note Title
                    </Text>
                    <Text
                      style={[
                        styles.Modaltext2,
                        {color: templateId === 0 ? 'black' : 'grey'},
                      ]}>
                      {textCountFunction()}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.textinputtitleView}
                    underlineColorAndroid="transparent"
                    value={sendNoteTitle}
                    editable={templateId === 0 ? true : false}
                    onChangeText={text => setsendNoteTitle(text)}
                  />
                  <Text style={styles.Modaltext}>Details</Text>
                  <TextInput
                    style={styles.TextInputContainer}
                    underlineColorAndroid="transparent"
                    multiline={true}
                    textAlignVertical={'top'}
                    returnKeyType="next"
                    value={sendNoteDescription}
                    onChangeText={text => setsendNoteDescription(text)}
                  />
                  <FlatList data={attachSet} renderItem={renderItems} />
                  <View style={styles.directionRow}>
                    <Text style={styles.Modaltext}>Attachments</Text>
                    <Pressable
                      onPress={() => {
                        uploadDocument();
                      }}
                      style={styles.browseButton}>
                      <Text style={styles.MOdalButtontext}>Browse</Text>
                    </Pressable>
                  </View>
                  <View style={{marginLeft: -20, flexDirection: 'row'}}>
                    <CheckBox
                      title="Send SMS"
                      textStyle={{fontSize: 12, fontStyle: 'normal'}}
                      containerStyle={styles.checkBoxStyle}
                      size={16}
                      onPress={() => checkboxPress()}
                      checked={sendSms}
                    />
                    {sendSms ? (
                      <Text
                        style={
                          styles.balanceTxt
                        }>{`Sms Balance: ${smsCount}`}</Text>
                    ) : null}
                  </View>

                  <View style={styles.Buttoncontainer}>
                    <Pressable
                      onPress={() => sendNote()}
                      style={styles.ModalButtonLeft}>
                      <Text style={styles.MOdalButtontext}>SEND</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setisModalVisible(false);
                        setsendNoteDescription('');
                        settemplatevalue('');
                        settemplateId(0);
                        setsendNoteTitle('');
                      }}
                      style={styles.MOdalButtonRight}>
                      <Text style={styles.MOdalButtontext}>CANCEL</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Spinner visibility={spinnerVisible} color="#607D8B" />
    </View>
  );
};

export default SendIndividualNotes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containertop: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    elevation: 3,
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
  checkBoxStyle: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  balanceTxt: {
    alignSelf: 'center',
    marginLeft: 30,
    fontSize: 12,
  },
  buttonView: {
    height: '100%',
    borderRightWidth: 1,
    borderColor: 'white',
  },
  headingTableView: {
    height: 60,
    elevation: 3,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  textcontaineone: {
    flex: 0.8,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#B866C6',
    paddingLeft: 10,
    justifyContent: 'center',
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  renderText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: '#607D8B',
    paddingTop: wp('2%'),
    width: '90%',
    textAlign: 'left',
  },
  renderView: {
    alignContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  browseButton: {
    backgroundColor: '#607D8B',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: 3,
    margin: wp('2%'),
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
    paddingTop: 15,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    paddingTop: 15,
    paddingBottom: 10,
    justifyContent: 'center',
    marginLeft: 10,
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  classSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    //  height: 75,
    width: '100%',
  },
  pickerStyle: {
    height: 40,
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
  sendButton: {
    width: 70,
    height: 40,
    backgroundColor: '#13C0CE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    paddingLeft: 5,
    margin: 5,
  },
  ModalContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  Modaltext: {
    paddingBottom: 5,
  },
  Modaltext2: {
    paddingBottom: 5,
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  ModalButtonLeft: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
  },
  MOdalButtonRight: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  MOdalButtontext: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '200',
  },
  textinputtitleView: {
    alignSelf: 'stretch',
    alignContent: 'stretch',
    height: 40,
    borderWidth: 1,
    borderRadius: 3,
    flexDirection: 'row',
    borderColor: '#607D8B',
    marginBottom: 5,
  },
  containerColoum: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
    marginBottom: 40,
    flexDirection: 'column',
    // alignItems: 'flex-start',
  },
  TextInputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    height: 150,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#607D8B',
  },
  Buttoncontainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});
