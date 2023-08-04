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
          <View style={styles.P_SD_Bottom_AttendenceboxLeft}>
            <CheckBox
              onPress={() => mainCheckFunction()}
              checkedColor="white"
              uncheckedColor="white"
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
                <View style={styles.P_SD_Bottom_FlatlistRowLeft}>
                  {studentIds.length > 0 ? (
                    <CheckBox
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
    margin: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  renderText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: 'red',
    paddingTop: wp('2%'),
    width: '90%',
    textAlign: 'left',
  },
  renderView: {
    alignContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  Modaltext: {
    marginBottom: 4,
  },
  ModalContainer: {
    padding: 10,
    height: 500,
    backgroundColor: '#FFFFFF',
  },
  ModalButtonLeft: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
    marginBottom: 10,
  },
  MOdalButtonRight: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
    marginBottom: 10,
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
    width: '100%',
  },
  MOdalButtontext: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '200',
  },
  textFlewWrap: {
    flexWrap: 'wrap',
    marginLeft: 20,
  },

  textinputtitleView: {
    alignSelf: 'stretch',
    alignContent: 'stretch',
    height: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 3,
    flexDirection: 'row',
    color: 'black',
    borderColor: '#607D8B',
  },
  TextInputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 200,
    flexDirection: 'row',
    alignSelf: 'stretch',
    color: 'black',
    borderWidth: 1,
    borderRadius: 3,
    marginBottom: 10,
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
        paddingTop: 10,
        borderWidth: 0.5,
        borderRadius: 3,
        marginLeft: 10,
        height: 35,
        // alignItems: 'stretch',
        paddingLeft: 2,
      },
      android: {
        justifyContent: 'center',
        paddingTop: 10,
        marginLeft: 10,
        borderWidth: 0.5,
        borderRadius: 3,
        height: 35,
        // alignItems: 'stretch',
        paddingLeft: 2,
      },
    }),
  },
  buttonSENTALL: {
    flex: 0.75,
    height: 35,
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 0.5,
    borderRadius: 4,
    borderColor: '#13C0CE',
    // flex: 1,
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#13C0CE',
    ...Platform.select({
      ios: {
        height: 35,
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
    marginLeft: 10,
    fontSize: 15,
    marginTop: 5,
  },
  text_white: {
    marginLeft: 10,
    color: '#F5F5F5',
    fontSize: 15,
  },
  P_SD_Bottom_Attendence: {
    flex: 7,
    flexDirection: 'column',
  },
  P_SD_Bottom_Row: {
    flexDirection: 'row',
  },
  P_SD_Bottom_AttendenceboxLeft: {
    elevation: 3,
    flex: 0.2,
    height: wp('13'),
    backgroundColor: '#AF67BD',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderColor: '#EDE7EA',
  },
  P_SD_Bottom_AttendenceboxRight: {
    elevation: 3,
    flex: 0.8,
    height: wp('13'),
    flexDirection: 'column',
    backgroundColor: '#AF67BD',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderColor: '#EDE7EA',
  },
  P_SD_Bottom_Flatlist: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  P_SD_Bottom_FlatlistRowLeft: {
    flex: 0.2,
    height: wp('13'),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 1,
    borderColor: '#C5C5C5',
  },
  P_SD_Bottom_FlatlistRowRight: {
    flex: 0.8,
    height: wp('13'),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderColor: '#C5C5C5',
  },
});
