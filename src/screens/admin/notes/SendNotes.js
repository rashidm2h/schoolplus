import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  Keyboard,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  PermissionsAndroid,
} from 'react-native';
import moment from 'moment';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import RNFetchBlob from 'rn-fetch-blob';
import {CheckBox} from 'react-native-elements';
import Hyperlink from 'react-native-hyperlink';
import FileViewer from 'react-native-file-viewer';
import MultiSelect from 'react-native-multiple-select';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {FloatingAction} from 'react-native-floating-action';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';
import Spinner from '../../../components/Spinner';
import Loader from '../../../components/ProgressIndicator';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';

import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
const allwise = <Icon name="send" size={25} color="white" />;

const actions = [
  {
    text: 'Send All',
    icon: allwise,
    name: 'All',
    color: '#FF4081',
    position: 2,
  },
  {
    text: 'Send Classwise',
    icon: allwise,
    name: 'Classwise',
    color: '#FF4081',
    position: 1,
  },
  {
    text: 'Send Individualwise',
    icon: allwise,
    name: 'Individualwise',
    color: '#FF4081',
    position: 1,
  },
];

const WebNotes = ({navigation}) => {
  let to = '';
  const [data, setdata] = useState('');
  const [classId, setclassId] = useState('');
  const [smsCount, setsmsCount] = useState('');
  const [imagePreUrl, setimagePreUrl] = useState('');
  const [sendNoteTitle, setsendNoteTitle] = useState('');
  const [BranchClassId, setBranchClassId] = useState('');
  const [sendNoteDescription, setsendNoteDescription] = useState('');
  const [attachSet, setattachSet] = useState([]);
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [loading, setloading] = useState(true);
  const [sendSms, setsendSms] = useState(false);
  const [dataerror, setdataerror] = useState(false);
  const [otherChecked, setotherChecked] = useState(true);
  const [parentChecked, setparentChecked] = useState(true);
  const [teacherChecked, setteacherChecked] = useState(true);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [spinnerVisible, setspinnerVisible] = useState(false);
  const [isClasswiseModalVisible, setisClasswiseModalVisible] = useState(false);
  const [templateData, settemplateData] = useState([
    {value: 0, label: 'SELECT', Template: '', templateId: 0},
  ]);
  const [templatevalue, settemplatevalue] = useState('');
  const [templateId, settemplateId] = useState(0);
  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      const pre = `http://${value}`;
      setimagePreUrl(pre);
    });
    NoteAccess();
    getStudentList();
    AccessTemplate();
  }, []);

  useEffect(() => {
    getMultiDivisions();
  }, [classId]);
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
              // const dropData = output.map((element) => ({
              // value: element.Id,
              // label: element.TemplateName,
              // Template: element.Template,
              // templateId: element.TemplateId,
              // }));
              // settemplateData(dropData);
              // setdropdownValue(dropdownData[0].class_Id);
              // getDivisions(dropdownData[0].class_Id);
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
  const NoteAccess = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.PARENT_URL}RetrieveAdminSentNoteResult`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
 <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
 <RetrieveAdminSentNote xmlns="http://www.m2hinfotech.com//">
 <MobileNo>${keyValue}</MobileNo>
 <BranchId>${branchId}</BranchId>
 </RetrieveAdminSentNote>
 </soap12:Body>
 </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            setloading(false);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName(
              'RetrieveAdminSentNoteResult',
            )[0].childNodes[0].nodeValue;
            if (v === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(v);
              const arraySet = [...rslt.Table];
              arraySet.map(i => (i.attachments = []));
              if (
                arraySet !== undefined &&
                arraySet !== null &&
                arraySet !== [] &&
                arraySet !== ''
              ) {
                arraySet.map((item, index) => {
                  if (
                    rslt.Table1 !== undefined &&
                    rslt.Table1 !== null &&
                    rslt.Table1 !== [] &&
                    rslt.Table1 !== ''
                  ) {
                    rslt.Table1.map(renderItm => {
                      if (renderItm.NotesDocsId === item.NotesDocsId) {
                        arraySet[index].attachments.push(renderItm);
                      }
                    });
                  }
                });
              }
              setdata(arraySet);
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
    if (
      teacherChecked === true &&
      parentChecked !== true &&
      otherChecked !== true
    ) {
      to = 'ROL_005';
    } else if (
      parentChecked === true &&
      teacherChecked !== true &&
      otherChecked !== true
    ) {
      to = 'ROL_004';
    } else if (
      parentChecked === true &&
      teacherChecked === true &&
      otherChecked !== true
    ) {
      to = 'ROL_004,ROL_005';
    } else if (
      teacherChecked !== true &&
      parentChecked !== true &&
      otherChecked === true
    ) {
      to = 'ROL_006';
    } else if (
      teacherChecked === true &&
      parentChecked !== true &&
      otherChecked === true
    ) {
      to = 'ROL_005,ROL_006';
    } else if (
      teacherChecked !== true &&
      parentChecked === true &&
      otherChecked === true
    ) {
      to = 'ROL_004,ROL_006';
    } else if (
      teacherChecked === true &&
      parentChecked === true &&
      otherChecked === true
    ) {
      to = 'ROL_004,ROL_005,ROL_006';
    } else {
      to = '';
    }
    setspinnerVisible(true);
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    let NoteTitle = sendNoteTitle.replace(/&/g, '&amp;');
    NoteTitle = NoteTitle.replace(/</g, '&lt;');
    NoteTitle = NoteTitle.replace(/>/g, '&gt;');
    const attachArray = JSON.stringify(attachSet);
    let NoteDescription = sendNoteDescription.replace(/&/g, '&amp;');
    NoteDescription = NoteDescription.replace(/</g, '&lt;');
    NoteDescription = NoteDescription.replace(/>/g, '&gt;');
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const username = keyValue;
        fetch(`${GLOBALS.PARENT_URL}InsertAdminNotes`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<InsertAdminNotes xmlns="http://www.m2hinfotech.com//">
 <senderNo>${username}</senderNo>
 <roleId>${to}</roleId>
 <title>${NoteTitle}</title>
 <description>${NoteDescription}</description>
 <branchId>${branchId}</branchId>
 <sendSms>${sendSms}</sendSms>
 <attachs>${attachArray}</attachs>
 <templateId>${templateId}</templateId>
</InsertAdminNotes>
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
              'InsertAdminNotesResult',
            )[0].childNodes[0].nodeValue;

            console.log('sendNoteFunction output', output);
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
              NoteAccess();
              setattachSet([]);
              setisModalVisible(false);
            }
          });
      },
      error => {
        setspinnerVisible(false);
        console.log(error); //Display error
      },
    );
    setattachSet([]);
    setisModalVisible(false);
  };
  const getMultiDivisions = () => {
    let array = classId;
    let arrayJoined = '';
    if (array.length !== 0) {
      arrayJoined = array.join();
    }

    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.PARENT_URL}MultiSelectDivisions`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
 <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
 <MultiSelectDivisions xmlns="http://www.m2hinfotech.com//">
 <branchId>${branchId}</branchId>
 <classId>${arrayJoined}</classId>
 </MultiSelectDivisions>
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
              'MultiSelectDivisionsResult',
            )[0].childNodes[0].nodeValue;
            if (ccc === 'failure') {
            } else {
              const output = JSON.parse(ccc);
              let dropdownData = output;
              const dropData = dropdownData.map(element => ({
                value: element.BranchClassId,
                label: element.DivCode,
              }));
              setdropdownSource1(dropData);
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

  const checkboxPress = value => {
    switch (value) {
      case 'parents':
        setparentChecked(!parentChecked);
        break;
      case 'teachers':
        setteacherChecked(!teacherChecked);
        break;
      case 'others':
        setotherChecked(!otherChecked);
        break;
      case 'sendSms':
        setsendSms(!sendSms);
        smsBalance();
        break;
      default:
        break;
    }
  };

  const onSelectedItemsChange = selectedItems => {
    setBranchClassId(selectedItems);
  };

  const onSelectedItemsChange2 = selectedItems => {
    setclassId(selectedItems);
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
  const sendBranchwise = () => {
    if (sendSms === true) {
      if (templateId === 0) {
        Alert.alert('Warning!', 'Please Select Template!');
      } else {
        if (sendNoteDescription.length === 0 || sendNoteDescription === '') {
          Alert.alert('Empty Note!', 'Please fill all details!');
        } else {
          sendNoteBranchervice();
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
          sendNoteBranchervice();
        }
      } else {
        if (sendNoteDescription.length === 0 || sendNoteDescription === '') {
          Alert.alert('Empty Note!', 'Please fill all details!');
        } else {
          sendNoteBranchervice();
        }
      }
    }
  };
  // const sendBranchwise = () => {
  // if (sendSms === true) {
  // if (templateId === 0) {
  // Alert.alert('Warning!', 'Please Select Template!');
  // } else {
  // if (templateId === 0) {
  // if (
  // sendNoteTitle.length === 0 ||
  // sendNoteDescription.length === 0 ||
  // sendNoteTitle === '' ||
  // sendNoteDescription === ''
  // ) {
  // Alert.alert('Empty Note!', 'Please fill all details!');
  // } else {
  // sendNoteBranchervice();
  // }
  // }
  // }
  // } else {
  // if (templateId === 0) {
  // if (
  // sendNoteTitle.length === 0 ||
  // sendNoteDescription.length === 0 ||
  // sendNoteTitle === '' ||
  // sendNoteDescription === ''
  // ) {
  // Alert.alert('Empty Note!', 'Please fill all details!');
  // } else {
  // sendNoteBranchervice();
  // }
  // } else {
  // sendNoteBranchervice();
  // }
  // }
  // };
  const sendNoteBranchervice = () => {
    if (teacherChecked === true && parentChecked !== true) {
      to = 'ROL_005';
    } else if (parentChecked === true && teacherChecked !== true) {
      to = 'ROL_004';
    } else if (parentChecked === true && teacherChecked === true) {
      to = 'ROL_004,ROL_005';
    } else {
      to = '';
    }
    setspinnerVisible(true);
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
        let array = BranchClassId;
        const attachArray = JSON.stringify(attachSet);
        let arrayJoined = array.join();
        fetch(`${GLOBALS.PARENT_URL}InsertAdminNotesBranchWise`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<InsertAdminNotesBranchWise xmlns="http://www.m2hinfotech.com//">
 <senderNo>${username}</senderNo>
 <branchId>${branchId}</branchId>
 <branchClassId>${arrayJoined}</branchClassId>
 <title>${sendNoteTitle}</title>
 <description>${sendNoteDescription}</description>
 <sendSms>${sendSms}</sendSms>
 <attachs>${attachArray}</attachs>
 <templateId>${templateId}</templateId>
</InsertAdminNotesBranchWise>
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
              'InsertAdminNotesBranchWiseResult',
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
              setBranchClassId('');
              setisClasswiseModalVisible(false);

              setTimeout(() => {
                Alert.alert('Success!', 'Note Sent Successfully');
              }, 1000);
              NoteAccess();
            }
          });
      },
      error => {
        setspinnerVisible(false);
        console.log(error); //Display error
      },
    );
    setisClasswiseModalVisible(false);
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
  const uploadDocument = () => {
    Alert.alert(' ', 'Please select file type', [
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

  const renderAttachItems = ({item, index}) => (
    <Pressable
      style={styles.renderPressable}
      onPress={() => {
        downloadAttachment(item.FileName, item.Path);
      }}>
      <Text style={styles.renderText2}>{item.FileName}</Text>
      <Icon name="download" size={wp('3%')} color="#CFCFCF" />
    </Pressable>
  );

  const downloadAttachment = (name, path) => {
    const {dirs} = RNFetchBlob.fs;
    const imagePath = `${dirs.DownloadDir}${'/'}${moment(new Date()).format(
      'DDMMYYYYhhmm',
    )}${name}`;
    const imagePathIos = `${dirs.CacheDir}${'/'}${moment(new Date()).format(
      'DDMMYYYYhhmm',
    )}${name}`;
    const paths = encodeURI(path);
    RNFetchBlob.config({
      path: Platform.OS === 'ios' ? imagePathIos : imagePath,
      fileCache: true,
    })
      .fetch('GET', `${imagePreUrl}${paths}`, {})
      .then(res => {
        if (Platform.OS === 'android') {
          FileViewer.open(res.path(), {
            showOpenWithDialog: true,
          });
        } else {
          FileViewer.open(res.path(), {
            showOpenWithDialog: true,
          });
          //RNFetchBlob.ios.openDocument(res.data)
        }
      });
  };

  const uploadDocuments = async (type, i) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      let path =
        Platform.OS === 'ios' ? res.uri.replace('file://', '') : res[0].uri;
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
      {loading ? (
        <Loader />
      ) : (
        <View>
          <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => {
              Keyboard.dismiss();
            }}>
            <SafeAreaView style={{flex: 1}}>
              <ScrollView keyboardShouldPersistTaps="always">
                <KeyboardAvoidingView
                  style={{flex: 1}}
                  behavior="padding"
                  keyboardVerticalOffset={10}>
                  <View style={styles.ModalContainer}>
                    <View style={styles.containerColoum}>
                      <Text style={styles.Modaltext}>To:</Text>

                      <View style={{width: '60%', flexDirection: 'row'}}>
                        <View style={{marginLeft: -20}}>
                          <CheckBox
                            title="Parents"
                            textStyle={{fontSize: 11, fontStyle: 'normal'}}
                            containerStyle={{
                              backgroundColor: 'white',
                              borderColor: 'white',
                            }}
                            size={16}
                            onPress={() => checkboxPress('parents')}
                            checked={parentChecked}
                          />
                        </View>
                        <View style={{marginLeft: -20}}>
                          <CheckBox
                            size={16}
                            onPress={() => checkboxPress('teachers')}
                            containerStyle={{
                              backgroundColor: 'white',
                              borderColor: 'white',
                            }}
                            textStyle={{fontSize: 11, fontStyle: 'normal'}}
                            title="Teachers"
                            checked={teacherChecked}
                          />
                        </View>
                        <View style={{marginLeft: -20}}>
                          <CheckBox
                            size={16}
                            onPress={() => checkboxPress('others')}
                            containerStyle={{
                              backgroundColor: 'white',
                              borderColor: 'white',
                            }}
                            textStyle={{fontSize: 11, fontStyle: 'normal'}}
                            title="N-Teachers"
                            checked={otherChecked}
                          />
                        </View>
                      </View>
                      <View>
                        <Text style={styles.Modaltext}>Template</Text>
                        <Dropdown
                          icon="chevron-down"
                          baseColor="transparent"
                          underlineColor="transparent"
                          containerStyle={[styles.dropdownpickerStyle, {}]}
                          data={templateData}
                          searchInputPlaceholderText="ddd"
                          value={templatevalue}
                          onChangeText={(value, index) => {
                            settemplatevalue(value);
                            setsendNoteDescription(
                              templateData[index].Template,
                            );
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
                        value={sendNoteDescription}
                        textAlignVertical={'top'}
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
                      <View style={{marginLeft: -20, flexDirection: 'row'}}>
                        <CheckBox
                          title="Send SMS"
                          textStyle={{fontSize: 12, fontStyle: 'normal'}}
                          containerStyle={{
                            backgroundColor: 'white',
                            borderColor: 'white',
                          }}
                          size={16}
                          onPress={() => checkboxPress('sendSms')}
                          checked={sendSms}
                        />
                        {sendSms ? (
                          <Text
                            style={{
                              alignSelf: 'center',
                              marginLeft: 30,
                              fontSize: 12,
                            }}>{`Sms Balance: ${smsCount}`}</Text>
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
          <Modal
            isVisible={isClasswiseModalVisible}
            onBackdropPress={() => {
              Keyboard.dismiss();
            }}>
            <SafeAreaView style={{flex: 1}}>
              <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="always">
                <KeyboardAvoidingView
                  style={{flex: 1}}
                  behavior="padding"
                  keyboardVerticalOffset={10}>
                  <View style={styles.ModalContainer}>
                    <View style={styles.containerColoum}>
                      <Text style={styles.Modaltext}>Class:</Text>
                      <View style={{width: '100%'}}>
                        <MultiSelect
                          hideTags
                          items={dropdownSource}
                          uniqueKey="value"
                          onSelectedItemsChange={item =>
                            onSelectedItemsChange2(item)
                          }
                          selectText=""
                          selectedItems={classId}
                          searchInputPlaceholderText="Class"
                          onChangeInput={text => console.log(text)}
                          tagRemoveIconColor="#CCC"
                          tagBorderColor="#CCC"
                          tagTextColor="black"
                          selectedItemTextColor="#13C0CE"
                          selectedItemIconColor="#13C0CE"
                          itemTextColor="#000"
                          displayKey="label"
                          searchInputStyle={{color: '#CCC'}}
                          submitButtonColor="#13C0CE"
                          submitButtonText="Submit"
                          itemFontSize={16}
                          fontSize={16}
                          onClearSelector={() => getMultiDivisions()}
                          onConfirm={() => getMultiDivisions()}
                        />
                      </View>

                      <Text style={styles.Modaltext}>Divisions:</Text>
                      <View style={{width: '100%'}}>
                        <MultiSelect
                          hideTags
                          items={dropdownSource1}
                          uniqueKey="value"
                          onSelectedItemsChange={item =>
                            onSelectedItemsChange(item)
                          }
                          selectText=""
                          selectedItems={BranchClassId}
                          searchInputPlaceholderText="Divisions"
                          onChangeInput={text => console.log(text)}
                          tagRemoveIconColor="#CCC"
                          tagBorderColor="#CCC"
                          tagTextColor="black"
                          selectedItemTextColor="#13C0CE"
                          selectedItemIconColor="#13C0CE"
                          itemTextColor="#000"
                          displayKey="label"
                          searchInputStyle={{color: '#CCC'}}
                          submitButtonColor="#13C0CE"
                          submitButtonText="Submit"
                          itemFontSize={16}
                          fontSize={16}
                          onConfirm={() => {
                            console.log('clickedHere');
                          }}
                        />
                      </View>
                      <View>
                        <Text style={styles.Modaltext}>Template</Text>
                        <Dropdown
                          icon="chevron-down"
                          baseColor="transparent"
                          underlineColor="transparent"
                          containerStyle={[styles.dropdownpickerStyle, {}]}
                          data={templateData}
                          value={templatevalue}
                          onChangeText={(value, index) => {
                            settemplatevalue(value);
                            setsendNoteDescription(
                              templateData[index].Template,
                            );
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
                        value={sendNoteDescription}
                        textAlignVertical={'top'}
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
                      <View style={{marginLeft: -20, flexDirection: 'row'}}>
                        <CheckBox
                          title="Send SMS"
                          textStyle={{fontSize: 12, fontStyle: 'normal'}}
                          containerStyle={{
                            backgroundColor: 'white',
                            borderColor: 'white',
                          }}
                          size={16}
                          onPress={() => checkboxPress('sendSms')}
                          checked={sendSms}
                        />
                        {sendSms ? (
                          <Text
                            style={{
                              alignSelf: 'center',
                              marginLeft: 30,
                              fontSize: 12,
                            }}>{`Sms Balance: ${smsCount}`}</Text>
                        ) : null}
                      </View>
                      <View style={styles.Buttoncontainer}>
                        <Pressable
                          onPress={() => sendBranchwise()}
                          style={styles.ModalButtonLeft}>
                          <Text style={styles.MOdalButtontext}>SEND</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            setisClasswiseModalVisible(false);
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
          {dataerror ? (
            <Text style={{textAlign: 'center', marginTop: 10}}>
              No data found.
            </Text>
          ) : (
            <>
              <FlatList
                data={data}
                renderItem={({item}) => (
                  <View style={styles.card}>
                    <View style={styles.cardin}>
                      <View style={styles.cardtitleView}>
                        <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                          <Text style={styles.cardtitle}>{item.Title} </Text>
                        </Hyperlink>
                      </View>
                      <View style={styles.cardDateView}>
                        <Text style={styles.carddate}>
                          {' '}
                          {moment(item.NotificationDate).format(
                            'DD-MM-YYYY',
                          )}{' '}
                        </Text>
                      </View>
                    </View>
                    <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                      <Text style={styles.carddesc}>{item.Description}</Text>
                    </Hyperlink>
                    <FlatList
                      data={item.attachments}
                      style={{paddingBottom: wp('2%')}}
                      renderItem={renderAttachItems}
                    />
                    <View style={styles.cardinrow}>
                      <Text style={styles.cardintext}>Sent to: </Text>
                      <Text style={styles.cardintext2}>{item.Reciever}</Text>
                    </View>
                    <View style={styles.cardinrow}>
                      <Text style={styles.cardintext}>Sent by: </Text>
                      <Text style={styles.cardintext}>{item.Sender}</Text>
                    </View>
                  </View>
                )}
              />
            </>
          )}
        </View>
      )}

      <Spinner visibility={spinnerVisible} color="#607D8B" />
      <FloatingAction
        actions={actions}
        color="#4CB050"
        onPressItem={name => {
          if (name === 'All') {
            setattachSet([]);
            setisModalVisible(true);
          } else if (name === 'Classwise') {
            setattachSet([]);
            setisClasswiseModalVisible(true);
            setsendNoteTitle('');
            setsendNoteDescription('');
          } else {
            navigation.navigate('SendIndividualNotes');
          }
        }}
      />
    </View>
  );
};

export default WebNotes;

const styles = StyleSheet.create({
  containerColoum: {
    flex: 1,
    margin: wp('7%'),
    flexDirection: 'column',
    // alignItems: 'flex-start',
  },
  ModalContainer: {
    backgroundColor: '#FFFFFF',
  },
  Modaltext: {
    paddingBottom: wp('1.5%'),
  },
  Modaltext2: {
    paddingBottom: wp('1.5%'),
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  ModalButtonLeft: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: wp('9.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('1%'),
  },
  MOdalButtonRight: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    height: wp('9.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('1%'),
  },
  MOdalButtontext: {
    color: '#FFFFFF',
    fontSize: wp('4.5%'),
    fontWeight: '200',
  },
  textinputtitleView: {
    alignSelf: 'stretch',
    alignContent: 'stretch',
    height: wp('11%'),
    borderWidth: wp('0.35%'),
    borderRadius: 3,
    flexDirection: 'row',
    borderColor: '#607D8B',
    marginBottom: wp('1.5%'),
  },
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('78%'),
    flex: 1,
  },
  renderText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: '#607D8B',
    paddingTop: wp('2%'),
    width: wp('65%'),
    textAlign: 'left',
  },
  renderView: {
    alignContent: 'space-between',
    width: wp('78%'),
    flexDirection: 'row',
  },
  dropdownpickerStyle: {
    height: wp('11%'),
    flex: 0.5,
    paddingTop: wp('3.5%'),
    paddingLeft: wp('0%'),
    justifyContent: 'center',
    alignItems: 'stretch',
    margin: wp('0%'),
    borderWidth: wp('0.5%'),
    borderRadius: 3,
    borderColor: '#607D8B',
    width: wp('75%'),
  },
  browseButton: {
    backgroundColor: '#607D8B',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('1%'),
    margin: wp('2%'),
  },
  TextInputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    height: wp('45%'),
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#607D8B',
  },
  Buttoncontainer: {
    flexDirection: 'row',
    marginBottom: wp('7%'),
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  card: {
    padding: wp('1%'),
    margin: wp('3.5%'),
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
    padding: wp('1.5%'),
    flex: 1,
    // backgroundColor:'red',
  },
  cardinrow: {
    // flexDirection: 'row',
    // flex: 1,
    // padding: wp('1.5%'),
    flexDirection: 'row',
    flex: 1,
    width: wp('85%'),
    padding: wp('1.5%'),
    // backgroundColor:'red',
  },
  cardtitleView: {
    flexGrow: 0.85,
    alignItems: 'flex-start',
    // width: wp('60%'),
    // // height: wp('10%'),
    // alignItems: 'flex-start',
    // backgroundColor: 'red',
  },
  cardDateView: {
    flexGrow: 0.25,
    alignItems: 'flex-end',
    // width: wp('30%'),
    // alignItems: 'flex-end',
    // textAlignVertical: 'top',
    // backgroundColor:'blue',
  },
  cardintext: {
    fontSize: wp('3.5%'),
    color: '#8A8A8A',
  },
  cardintext2: {
    fontSize: wp('4%'),
    color: '#8A8A8A',
    marginRight: wp('9%'),
  },
  cardtitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  pickerStyle: {
    borderWidth: 0.5,
    borderColor: 'grey',
    height: wp('11%'),
    paddingLeft: 3,
    paddingBottom: 10,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 3,
    alignItems: 'stretch',
    marginBottom: 10,
  },
  carddate: {
    fontSize: wp('5%'),
    textAlignVertical: 'top',
  },
  carddesc: {
    fontSize: wp('5%'),
    padding: wp('1.5%'),
    flexWrap: 'wrap',
  },
  buttonSENTALL: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 0.5,
    borderRadius: 4,
    borderColor: '#13C0CE',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#13C0CE',
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    marginTop: 5,
  },
  renderPressable: {
    paddingHorizontal: 5,
    paddingBottom: 1,
    width: wp('90%'),
    paddingTop: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  renderText2: {
    fontSize: wp('3%'),
    fontWeight: '500',
    marginRight: wp('2%'),
    color: '#607D8B',
    textAlign: 'left',
  },
});
