import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Alert,
  FlatList,
  Platform,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  PermissionsAndroid,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import RNFetchBlob from 'rn-fetch-blob';
import {CheckBox} from 'react-native-elements';
import {useIsFocused} from '@react-navigation/core';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';
import Spinner from '../../../components/Spinner';

import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
const SendNotes = () => {
  const isFocused = useIsFocused();
  const [attachSet, setattachSet] = useState([]);
  const [studentIds, setstudentIds] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  const [sendNoteTitle, setsendNoteTitle] = useState('');
  const [dataSourceStudent, setdataSourceStudent] = useState('');
  const [sendNoteDescription, setsendNoteDescription] = useState('');
  const [mainCheck, setmainCheck] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [spinnerVisible, setspinnerVisible] = useState(false);
  let branch = '';

  useEffect(() => {
    ClassAccess();
  }, [isFocused]);

  useEffect(() => {
    let array = [...studentIds];
    if (mainCheck) {
      array.map(element => {
        element.status = true;
      });
      console.log(array);
      setstudentIds(array);
    } else {
      array.map(element => {
        element.status = false;
      });
      console.log(array);
      setstudentIds(array);
    }
    console.log(array);
  }, [mainCheck]);

  const mainCheckFunction = () => {
    let status = mainCheck;
    setmainCheck(!status);
  };

  const itemCheck = (item, index) => {
    let array = [...studentIds];
    if (array[index].status) {
      array[index].status = false;
    } else {
      array[index].status = true;
    }
    console.log(array);
    setstudentIds(array);
  };

  const sendNote = () => {
    let status = '';

    if (sendNoteTitle.length === 0 || sendNoteDescription.length === 0) {
      Alert.alert('Teacher Note', 'Please Enter the Text Fields....!');
    } else {
      setspinnerVisible(true);
      let studArray = [];
      studentIds.map(element => {
        if (element.status) {
          studArray.push({id: element.StudId});
        }
      });
      let studentArrayString = JSON.stringify(studArray);
      const attachArray = JSON.stringify(attachSet);
      if (studArray.length === dataSourceStudent.length) {
        status = 'All';
      } else {
        status = 'No';
      }
      let title = sendNoteTitle.replace(/&/g, '&amp;');
      title = title.replace(/</g, '&lt;');
      title = title.replace(/>/g, '&gt;');
      let description = sendNoteDescription.replace(/&/g, '&amp;');
      description = description.replace(/</g, '&lt;');
      description = description.replace(/>/g, '&gt;');
      AsyncStorage.getItem('BranchID')
        .then(keyValue2 => {
          branch = keyValue2;
          AsyncStorage.getItem('acess_token').then(
            keyValue => {
              const username = keyValue;
              fetch(`${GLOBALS.TEACHER_URL}InsertTeacherNotes`, {
                method: 'POST',
                body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <InsertTeacherNotes xmlns="http://www.m2hinfotech.com//">
        <senderNo>${username}</senderNo>
        <studentId>${studentArrayString}</studentId>
        <title>${title}</title>
        <description>${description}</description>
        <branchId>${branch}</branchId>
        <status>${status}</status>
        <attachs>${attachArray}</attachs>
      </InsertTeacherNotes>
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
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(response);
                  const output = xmlDoc.getElementsByTagName(
                    'InsertTeacherNotesResult',
                  )[0].childNodes[0].nodeValue;
                  if (output === 'failure') {
                    setspinnerVisible(false);
                    Alert.alert('Try Again', 'Note Sending Failed');
                  } else {
                    setspinnerVisible(false);
                    Alert.alert('Success', 'Note Sent Successfully');
                  }
                });
            },
            error => {
              setspinnerVisible(false);
              console.log(error); //Display error
            },
          );

          hideModal();
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  const uploadFile = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to memory to upload the file',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        uploadDocument();
      } else {
        Alert.alert('Permission Denaied ', 'Give permission', [
          {
            text: 'Ok',
            onPress: () => {},
          },
        ]);
      }
    } catch (err) {
      console.warn(err);
    }
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

  const ClassAccess = () => {
    let dropdownData = '';
    setmainCheck(false);
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const username = keyValue; //Display key value
        fetch(`${GLOBALS.TEACHER_URL}TeacherClasses`, {
          method: 'POST',
          body: `
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <TeacherClasses xmlns="http://www.m2hinfotech.com//">
          <PhoneNo>${username}</PhoneNo>
        </TeacherClasses>
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
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName('TeacherClassesResult')[0]
              .childNodes[0].nodeValue;
            if (v === 'failure') {
            } else {
              const rslt = JSON.parse(v);
              dropdownData = rslt;
              const dropData = dropdownData.map(element => ({
                value: element.BranchClassId,
                label: element.Class,
              }));
              setdropdownSource(dropData);
              setdropdownValue(dropdownData[0].BranchClassId);
              ClassStudentsAccess(dropdownData[0].BranchClassId);
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

  const ClassStudentsAccess = id => {
    const branchIds = id;
    fetch(`${GLOBALS.TEACHER_URL}StdNotesClasswiseList`, {
      method: 'POST',
      body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <StdNotesClasswiseList xmlns="http://www.m2hinfotech.com//">
      <BranchclsId>${branchIds}</BranchclsId>
    </StdNotesClasswiseList>
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
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response);
        const v = xmlDoc.getElementsByTagName('StdNotesClasswiseListResult')[0]
          .childNodes[0].nodeValue;
        if (v === 'failure') {
          setdataSourceStudent([]);
          Alert.alert('', 'No Parents Logged in through Phone!');
        } else {
          const rslt = JSON.parse(v);
          let array = [];
          rslt.map(element => {
            array.push({StudId: element.StudId, status: true});
          });
          setdataSourceStudent(rslt);
          setstudentIds(array);
          setmainCheck(true);
        }
      })
      .catch(error => {
        console.log(error, 'class Error');
      });
  };

  const hideModal = () => {
    setisModalVisible(false);
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
        Platform.OS === 'ios' ? res[0].uri.replace('file://', '') : res[0].uri;
      RNFetchBlob.fs.readFile(path, 'base64').then(encoded => {
        const dataArray = [...attachSet];
        dataArray.push({
          filename: res[0].name,
          filedata: encoded,
          filetype: res[0].type,
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
  const renderItems = ({item, index}) => {
    return (
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
  };

  return (
    <View style={styles.container}>
      <Modal isVisible={isModalVisible}>
        <ScrollView keyboardShouldPersistTaps="always">
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10}>
            <View style={styles.ModalContainer}>
              <View style={styles.containerColoum}>
                <Text style={styles.Modaltext}>Note Title</Text>
                <TextInput
                  style={styles.textinputtitleView}
                  underlineColorAndroid="transparent"
                  returnKeyType="next"
                  onChangeText={text => setsendNoteTitle(text)}
                />
                <Text style={styles.Modaltext}>Details</Text>
                <TextInput
                  style={styles.TextInputContainer}
                  underlineColorAndroid="transparent"
                  multiline={true}
                  textAlignVertical={'top'}
                  returnKeyType="next"
                  onChangeText={text => setsendNoteDescription(text)}
                />
                <FlatList data={attachSet} renderItem={renderItems} />
                <View style={styles.directionRow}>
                  <Text style={styles.Modaltext}>Attachments</Text>
                  <Pressable
                    onPress={() => {
                      uploadFile();
                    }}
                    style={styles.browseButton}>
                    <Text style={styles.MOdalButtontext}>Browse</Text>
                  </Pressable>
                </View>
                <View style={styles.Buttoncontainer}>
                  <Pressable
                    onPress={() => sendNote()}
                    style={styles.ModalButtonLeft}>
                    <Text style={styles.MOdalButtontext}>SEND</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => hideModal()}
                    style={styles.MOdalButtonRight}>
                    <Text style={styles.MOdalButtontext}>CANCEL</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </Modal>

      <View style={styles.containerTop_sendNotes}>
        <Text style={styles.text}>Choose Class: </Text>
        <View style={styles.containerTopPIckerButton}>
          <View style={{flex: 2}}>
            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              inputContainerStyle={{borderBottomColor: 'transparent'}}
              data={dropdownSource}
              containerStyle={styles.pickerStyle}
              textColor="#121214"
              selectedItemColor="#7A7A7A"
              value={dropdownValue}
              onChangeText={value => {
                ClassStudentsAccess(value);
                setdropdownValue(value);
              }}
            />
          </View>
          <Pressable
            onPress={() => {
              let bool = false;
              studentIds.map(element => {
                if (element.status) {
                  bool = true;
                  return;
                }
              });
              if (bool && dataSourceStudent.length > 0) {
                setattachSet([]);
                setisModalVisible(true);
              } else {
                Alert.alert('Oops!', 'You have not selected any student');
              }
            }}
            style={styles.buttonSENTALL}>
            <Text style={styles.textSENTTOALL}>SEND</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.P_SD_Bottom_Attendence}>
        <View style={styles.P_SD_Bottom_Row}>
          <View style={styles.P_SD_Bottom_checkbox}>
            <CheckBox
              onPress={() => mainCheckFunction()}
              checkedColor="white"
              uncheckedColor="white"
              backgroundColor="gray"
              // // height={20}
              // flexDirection="coloumn"
              // justifyContent="center"
              containerStyle={{
                borderColor: '#FFFFFF',
              }}
              checked={mainCheck}
            />
          </View>
          <View style={styles.P_SD_Bottom_AttendenceboxLeft}>
            <Text style={styles.text_white}>RL NO</Text>
          </View>
          <View style={styles.P_SD_Bottom_AttendenceboxRight}>
            <Text style={styles.text_white}>STUDENT NAME</Text>
          </View>
        </View>
        <FlatList
          keyExtractor={(item, index) => index}
          extraData={studentIds}
          data={dataSourceStudent}
          renderItem={({item, index}) => (
            <Pressable style={styles.P_SD_Bottom_Flatlist}>
              <View style={styles.P_SD_Bottom_Flatlist}>
                <View style={styles.P_SD_Bottom_Flatlistcheckbox}>
                  {studentIds.length > 0 ? (
                    <CheckBox
                      backgroundColor="gray"
                      size={20}
                      onPress={() => itemCheck(item, index)}
                      checked={studentIds[index].status}
                    />
                  ) : null}
                </View>
                <View style={styles.P_SD_Bottom_FlatlistRowLeft}>
                  <Text style={styles.textFlewWrap}>{item.RollNo}</Text>
                </View>
                <View style={styles.P_SD_Bottom_FlatlistRowRight}>
                  <Text style={styles.textFlewWrap}> {item.Name}</Text>
                </View>
              </View>
            </Pressable>
          )}
        />
        <Spinner visibility={spinnerVisible} color="#607D8B" />
      </View>
    </View>
  );
};

export default SendNotes;

const styles = StyleSheet.create({
  containerColoum: {
    margin: wp('7%'),
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  renderText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: '#607D8B',
    paddingTop: wp('2%'),
    width: wp('65%'),
    //doublecheck
    textAlign: 'left',
  },
  renderView: {
    alignContent: 'space-between',
    width: '100%',
    // backgroundColor: 'blue',
    flexDirection: 'row',
  },
  Modaltext: {
    marginBottom: wp('1%'),
  },
  ModalContainer: {
    padding: wp('3%'),
    backgroundColor: '#FFFFFF',
  },
  ModalButtonLeft: {
    backgroundColor: '#60798B',
    flex: 0.5,
    height: wp('12.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('0.7%'),
    marginBottom: wp('3.5%'),
  },
  MOdalButtonRight: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: wp('12.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('0.7%'),
    marginBottom: wp('3.5%'),
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
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('72.3%'),
  },
  MOdalButtontext: {
    color: '#FFFFFF',
    fontSize: wp('5%'),
    fontWeight: '200',
  },
  textFlewWrap: {
    flexWrap: 'wrap',
    marginLeft: wp('7%'),
  },

  textinputtitleView: {
    alignSelf: 'stretch',
    alignContent: 'stretch',
    height: wp('14%'),
    marginBottom: wp('3.5%'),
    borderWidth: wp('0.5%'),
    borderRadius: 3,
    flexDirection: 'row',
    color: 'black',
    borderColor: '#607D8B',
  },
  TextInputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: wp('64%'),
    flexDirection: 'row',
    alignSelf: 'stretch',
    color: 'black',
    borderWidth: wp('0.5%'),
    borderRadius: 3,
    marginBottom: wp('3.5%'),
    borderColor: '#607D8B',
  },
  Buttoncontainer: {
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  card: {
    padding: 3,
    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 2,
    flexGrow: 0.15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,

    ...Platform.select({
      android: {
        borderRadius: 4,
      },
      ios: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
      },
    }),
  },
  cardin: {
    flexDirection: 'row',
    padding: 5,
    flex: 1,
  },
  pickerStyle: {
    ...Platform.select({
      ios: {
        justifyContent: 'center',
        paddingTop: wp('3.5%'),
        borderWidth: wp('0.3%'),
        borderRadius: 3,
        marginLeft: wp('3.5%'),
        height: wp('10.5%'),
        paddingLeft: wp('0.8%'),
      },
      android: {
        justifyContent: 'center',
        paddingTop: wp('3.5%'),
        marginLeft: wp('3.5%'),
        borderWidth: wp('0.3%'),
        borderRadius: 3,
        height: wp('10.5%'),
        // alignItems: 'stretch',
        paddingLeft: wp('0.3%'),
      },
    }),
  },
  buttonSENTALL: {
    flex: 0.75,
    height: wp('11.5%'),
    marginLeft: wp('3.5%'),
    marginRight: wp('3.5%'),
    borderWidth: 0.5,
    borderRadius: 4,
    borderColor: '#13C0CE',
    // flex: 1,
    padding: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#13C0CE',
    ...Platform.select({
      ios: {
        height: wp('11.5%'),
      },
    }),
  },
  textSENTTOALL: {
    color: '#FFFFFF',
  },
  containerTop_sendNotes: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  containerTopPIckerButton: {
    flexDirection: 'row',
    flex: 1,
  },
  text: {
    marginLeft: wp('3.5%'),
    fontSize: wp('5%'),
    marginTop: wp('1.5%'),
  },
  text_white: {
    marginLeft: wp('3%'),
    color: '#F5F5F5',
    fontSize: wp('4.7%'),
  },
  P_SD_Bottom_Attendence: {
    flex: 4,
    flexDirection: 'column',
  },
  P_SD_Bottom_Row: {
    flexDirection: 'row',
    height: 40,
  },

  P_SD_Bottom_checkbox: {
    elevation: 3,
    flex: 0.2,
    height: wp('17%'),
    backgroundColor: '#AF67BD',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderColor: '#EDE7EA',
  },
  P_SD_Bottom_AttendenceboxLeft: {
    elevation: 3,
    flex: 0.2,
    height: wp('13%'),
    flexDirection: 'column',
    backgroundColor: '#AF67BD',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderLeftWidth: wp('0.3%'),
    borderColor: '#EDE7EA',
  },
  P_SD_Bottom_AttendenceboxRight: {
    elevation: 3,
    flex: 0.8,
    height: wp('13%'),
    flexDirection: 'column',
    backgroundColor: '#AF67BD',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderLeftWidth: wp('0.3%'),
    borderColor: '#EDE7EA',
  },
  P_SD_Bottom_Flatlist: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  P_SD_Bottom_Flatlistcheckbox: {
    flex: 0.2,
    height: wp('15%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: wp('0.11%'),
    borderBottomWidth: wp('0.5%'),
    borderColor: '#C5C5C5',
  },

  P_SD_Bottom_FlatlistRowLeft: {
    flex: 0.2,
    height: wp('15%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: wp('0.11%'),
    borderBottomWidth: wp('0.5%'),
    borderColor: '#C5C5C5',
  },
  P_SD_Bottom_FlatlistRowRight: {
    flex: 0.8,
    height: wp('15%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: wp('0.5%'),
    borderLeftWidth: wp('0.1%'),
    borderColor: '#C5C5C5',
  },
});
