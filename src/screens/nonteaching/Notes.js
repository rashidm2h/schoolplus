import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  FlatList,
  Platform,
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
import GLOBALS from '../../config/Globals';
import Header from '../../components/Header';
import Loader from '../../components/ProgressIndicator';

const Notes = ({navigation}) => {
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

      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          AsyncStorage.getItem('StdID').then(
            keyValue2 => {
              fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetNonTStaffsNotes`, {
                method: 'POST',
                body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
 <GetNonTStaffsNotes xmlns="http://www.m2hinfotech.com//">
 <mobileNo>${keyValue}</mobileNo>
 <BranchID>${branchId}</BranchID>
 </GetNonTStaffsNotes>
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
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(response);
                  const v = xmlDoc.getElementsByTagName(
                    'GetNonTStaffsNotesResult',
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
                    setdata(rslt.Table1);
                  }
                })
                .catch(error => {
                  setloading(false);
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
    });
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
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('NonTeachingDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      {loading ? (
        <Loader />
      ) : (
        <View style={{flex: 1}}>
          {dataerror ? (
            <Text style={styles.notDataText}>No data found.</Text>
          ) : (
            <>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                keyboardShouldPersistTaps="never"
                keyboardDismissMode="on-drag"
                renderItem={({item}) => (
                  <View style={styles.card}>
                    <View style={styles.cardin}>
                      <View style={styles.cardtitleView}>
                        <Text style={styles.cardtitle}>{item.Title}</Text>
                      </View>
                      <View style={styles.cardDateView}>
                        <Text style={styles.carddate}>{item.Date}</Text>
                      </View>
                    </View>
                    <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                      <Text style={styles.carddesc}>{item.Description}</Text>
                    </Hyperlink>
                    <FlatList
                      data={item.attachments}
                      style={{paddingBottom: wp('2%')}}
                      renderItem={renderItems}
                    />
                    <Text
                      style={styles.carddesc}>{`From:  ${item.Sender}`}</Text>
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

export default Notes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    width: 10,
    height: 40,
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
  notDataText: {
    fontSize: 15,
    textAlign: 'center',
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
  cardin: {
    flexDirection: 'row',
    padding: 5,
    flex: 1,
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
  button: {
    backgroundColor: '#607D8B',
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
