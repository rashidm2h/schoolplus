import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  ActivityIndicator,
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
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

const ReceivedNotes = () => {
  const [loading, setloading] = useState(true);
  const [rn_visible, setrn_visible] = useState(false);
  const [noDataView, setnoDataView] = useState(false);
  const [dataSource, setdataSource] = useState('');
  const [imagePreUrl, setimagePreUrl] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      const pre = `http://${value}`;
      setimagePreUrl(pre);
    });
    NoteAccess();
  }, []);

  const NoteAccess = () => {
    let parentNo;
    let StudentID;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        parentNo = keyValue;
        AsyncStorage.getItem('StdID').then(
          keyValue2 => {
            StudentID = keyValue2;
            fetch(`${GLOBALS.PARENT_SERVICE}RetrieveParentNoteHistory`, {
              method: 'POST',
              body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
 <RetrieveParentNoteHistory xmlns="http://www.m2hinfotech.com//">
 <parentNo>${parentNo}</parentNo>
 <studentId>${StudentID}</studentId>
 </RetrieveParentNoteHistory>
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
                const v = xmlDoc.getElementsByTagName(
                  'RetrieveParentNoteHistoryResult',
                )[0].childNodes[0].nodeValue;
                if (v === 'failure') {
                  setloading(false);
                  setrn_visible(false);
                  setnoDataView(true);
                } else {
                  const rslt = JSON.parse(v);
                  setloading(false);
                  setrn_visible(true);
                  setnoDataView(false);
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
                  setdataSource(arraySet);
                  try {
                    AsyncStorage.setItem(
                      'removeNoteCount',
                      JSON.stringify(rslt.Table[0].count),
                    );
                  } catch (error) {
                    console.log('somthing went');
                  }
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
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  

  const renderItems = ({item, index}) => (
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
        }
      });
  };

  return (
    <View style={{flex: 1}}>
      {noDataView === true ? (
        <View style={styles.noDataView}>
          <Text style={styles.notDataText}>No New Notes</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator
              style={styles.progressBar}
              color="#C00"
              size="large"
            />
          ) : null}
          {rn_visible === true ? (
            <FlatList
              data={dataSource}
              keyboardShouldPersistTaps="never"
              keyboardDismissMode="on-drag"
              renderItem={({item}) => (
                <View style={styles.card}>
                  <View style={styles.cardin}>
                    <View style={styles.cardtitleView}>
                      <Text style={styles.cardtitle}>{item.Title}</Text>
                    </View>
                    <View style={styles.cardDateView}>
                      <Text style={styles.carddate}>{item.date}</Text>
                    </View>
                  </View>
                  <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                    <Text style={styles.carddesc}>{item.description}</Text>
                  </Hyperlink>
                  <FlatList
                    data={item.attachments}
                    style={{paddingBottom: wp('2%')}}
                    renderItem={renderItems}
                  />
                </View>
              )}
            />
          ) : null}
        </View>
      )}
    </View>
  );
};

export default ReceivedNotes;

const styles = StyleSheet.create({
  notDataText: {
    fontSize: wp('5%'),
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: wp('22.5%'),
    width: wp('22.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
  },
  noDataView: {
    marginTop: wp('22.5%'),
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  renderPressable: {
    paddingHorizontal: wp('1.5%'),
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
  card: {
    padding: wp('4.5%'),

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
  },
  cardinrow: {
    flexDirection: 'row',
    flex: 1,
    padding: wp('1.5%'),
  },
  cardtitleView: {
    flexGrow: 0.85,
    alignItems: 'flex-start',
  },
  cardDateView: {
    flexGrow: 0.25,
    alignItems: 'flex-end',
  },
  cardtitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#8A8A8A',
    flexWrap: 'wrap',
    width: wp('60%')
  },
  carddate: {
    fontSize: wp('5%'),
  },
  carddesc: {
    fontSize: wp('5%'),
    padding: wp('1.5%'),
    flexWrap: 'wrap',
  },
  renderText: {
    fontSize: wp('3%'),
    fontWeight: '500',
    color: '#607D8B',
    paddingTop: wp('2%'),
    textAlign: 'left',
  },
  text: {
    marginLeft: wp('3.5%'),
    fontSize: wp('5%'),
    marginTop: wp('1.5%'),
  },
});
