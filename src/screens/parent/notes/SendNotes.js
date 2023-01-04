import React, {useState} from 'react';
import {
  Text,
  View,
  Alert,
  Platform,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {DOMParser} from 'xmldom';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';
import Spinner from '../../../components/Spinner';

const SendNotes = () => {
  const [loading, setloading] = useState(false);
  const [attachSet, setattachSet] = useState([]);
  const [branchName, setbranchName] = useState('');
  const [parentSendNotetitle, setparentSendNotetitle] = useState('');
  const [parentSendNotedescribtion, setparentSendNotedescribtion] =
    useState('');

  AsyncStorage.getItem('schoolBranchName').then(value => {
    setbranchName(value);
  });

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
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.containerColoum}>
          {branchName === 'Vetturnimadam' ? (
            <Text style={styles.NoteTitle}>
              This feature is not available yet!
            </Text>
          ) : (
            <View style={styles.containerColoum}>
              <Spinner visibility={loading} color="#607D8B" />
              <Text style={styles.NoteTitle}>Note Title</Text>
              <TextInput
                maxLength={30}
                placeholder="max length 30"
                style={styles.textinputtitleView}
                underlineColorAndroid="transparent"
                onChangeText={text => setparentSendNotetitle(text)}
                value={parentSendNotetitle}
              />
              <Text style={styles.NoteTitle}>Details</Text>
              <TextInput
                style={styles.TextInputContainer}
                maxLength={300}
                multiline={true}
                autoGrow={true}
                maxHeight={180}
                textAlignVertical={'top'}
                underlineColorAndroid="transparent"
                value={parentSendNotedescribtion}
                onChangeText={text => setparentSendNotedescribtion(text)}
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
              <View style={styles.Buttoncontainer}>
                <Pressable
                  onPress={navigation => {
                    if (
                      parentSendNotetitle.length === 0 ||
                      parentSendNotedescribtion.length === 0
                    ) {
                      Alert.alert('NOTES', 'Please enter the input fields...!');
                    } else {
                      setloading(true);
                      AsyncStorage.getItem('acess_token').then(
                        keyValue => {
                          const senderNo = keyValue;
                          const attachArray = JSON.stringify(attachSet);
                          AsyncStorage.getItem('StdID').then(
                            keyValue2 => {
                              const studentID = keyValue2;
                              const title = parentSendNotetitle.replace(
                                /&/g,
                                '&amp;',
                              );
                              const description =
                                parentSendNotedescribtion.replace(
                                  /&/g,
                                  '&amp;',
                                );
                              fetch(`${GLOBALS.PARENT_URL}InsertParentNotes`, {
                                method: 'POST',
                                body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<InsertParentNotes xmlns="http://www.m2hinfotech.com//">
<senderNo>${senderNo}</senderNo>
<studentId>${studentID}</studentId>
<title>${title}</title>
<description>${description}</description>
<attachs>${attachArray}</attachs>
</InsertParentNotes>
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
                                  setloading(false);
                                  setattachSet([]);
                                  const parser = new DOMParser();
                                  const xmlDoc =
                                    parser.parseFromString(response);
                                  const output = xmlDoc.getElementsByTagName(
                                    'InsertParentNotesResult',
                                  )[0].childNodes[0].nodeValue;
                                  if (output === 'failure') {
                                    Alert.alert(
                                      'Try Again',
                                      'Note Send Failed',
                                    );
                                  } else {
                                    setparentSendNotetitle('');
                                    setparentSendNotedescribtion('');
                                    Alert.alert(
                                      'Success',
                                      'Note Sent Successfully',
                                    );
                                  }
                                });
                            },
                            error => {
                              setloading(false);
                              console.log(error);
                            },
                          );
                        },
                        error => {
                          setloading(false);
                          console.log(error);
                        },
                      );
                    }
                  }}
                  style={styles.button}>
                  <Text style={styles.buttonText}>SEND NOTES</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default SendNotes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 1,
    flexGrow: 0.15,
    shadowColor: '#FFFFFF',
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
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
      },
    }),
  },
  button: {
    backgroundColor: '#607D8B',
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerColoum: {
    flex: 1,
    width: wp('82%'),
    margin: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  NoteTitle: {},
  Buttoncontainer: {
    flexDirection: 'row',
  },
  TextInputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 170,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#607D8B',
    marginVertical: 10,
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
  directionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  MOdalButtontext: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '200',
  },
  textinputtitleView: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 3,
    flexDirection: 'row',
    borderColor: '#607D8B',
    marginVertical: 10,
    ...Platform.select({
      ios: {
        height: 40,
      },
    }),
  },
});
