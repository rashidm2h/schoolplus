import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Platform,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import {DOMParser} from 'xmldom';
import RNFetchBlob from 'rn-fetch-blob';
import Hyperlink from 'react-native-hyperlink';
import FileViewer from 'react-native-file-viewer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const IndividualNotes = () => {
  const [data, setdata] = useState('');
  const [imagePreUrl, setimagePreUrl] = useState('');
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      const pre = `http://${value}`;
      setimagePreUrl(pre);
    });
    NoteAccess();
  }, []);

  const NoteAccess = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const username = keyValue; //Display key value
        fetch(`${GLOBALS.PARENT_URL}GetIndividualParentNotesByAdmin`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetIndividualParentNotesByAdmin xmlns="http://www.m2hinfotech.com//">
                <senderNo>${username}</senderNo>
                <branchId>${branchId}</branchId>
              </GetIndividualParentNotesByAdmin>
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
              'GetIndividualParentNotesByAdminResult',
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

  const renderAttachItems = ({item}) => (
    <Pressable
      style={styles.renderPressable}
      onPress={() => {
        downloadAttachment(item.FileName, item.Path);
      }}>
      <Text style={styles.renderText}>{item.FileName}</Text>
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
    console.log(path, 'path');
    console.log(`${imagePreUrl}${paths}`, imagePath, imagePathIos);
    RNFetchBlob.config({
      path: Platform.OS === 'ios' ? imagePathIos : imagePath,
      fileCache: true,
    })
      .fetch('GET', `${imagePreUrl}${paths}`, {})
      .then(res => {
        console.log(res, 'res');
        if (Platform.OS === 'android') {
          FileViewer.open(res.path(), {
            showOpenWithDialog: true,
          });
        } else {
          FileViewer.open(res.path(), {
            showOpenWithDialog: true,
          });
        }
      });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={{textAlign: 'center', marginTop: 10}}>
              No data found.
            </Text>
          ) : (
            <>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
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
                          {item.NotificationDate}{' '}
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
                      <Text style={styles.cardintext}>Sent By: </Text>
                      <Text style={styles.cardintext}>{item.SentBy}</Text>
                    </View>
                    <View style={styles.cardinrow}>
                      <Text style={styles.cardintext}>Send To: </Text>
                      <Text style={styles.cardintext}>{item.SentTo}</Text>
                    </View>
                  </View>
                )}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default IndividualNotes;

const styles = StyleSheet.create({
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
  cardinrow: {
    flexDirection: 'row',
    flex: 1,
    padding: 5,
  },
  cardtitleView: {
    flexGrow: 0.85,
    alignItems: 'flex-start',
  },
  cardDateView: {
    flexGrow: 0.25,
    alignItems: 'flex-end',
  },
  cardintext: {
    color: 'gray',
  },
  cardtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  carddate: {
    fontSize: 16,
  },
  carddesc: {
    fontSize: 14,
    padding: 5,
    flexWrap: 'wrap',
  },
  renderPressable: {
    paddingHorizontal: 5,
    paddingBottom: 1,
    paddingTop: wp('2%'),
    width: wp('90%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  renderText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    marginRight: wp('2%'),
    color: '#607D8B',
    textAlign: 'left',
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
});
