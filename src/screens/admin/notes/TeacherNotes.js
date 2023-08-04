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
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import GLOBALS from '../../../config/Globals';

const TeacherNotes = () => {
  const [data, setdata] = useState('');
  const [dataerror, setDataerror] = useState(false);
  const [imagePreUrl, setimagePreUrl] = useState('');
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [dropdownValue2, setdropdownValue2] = useState('');
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [dropdownSource2, setdropdownSource2] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('domain').then(value => {
      const pre = `http://${value}`;
      setimagePreUrl(pre);
    });
    NoteAccess();
    getMonths();
  }, []);

  const getMonths = () => {
    let branchId = '';

    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      () => {
        fetch(`${GLOBALS.PARENT_URL}LatestAcademicYear`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <LatestAcademicYear xmlns="http://www.m2hinfotech.com//">
                  <branchId>${branchId}</branchId>
                </LatestAcademicYear>
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
              'LatestAcademicYearResult',
            )[0].childNodes[0].nodeValue;

            if (ccc === 'failure') {
            } else {
              const clsattpick = JSON.parse(ccc);
              let start = moment(clsattpick[0].StartDate, 'DD.MM.YYYY');
              let end = moment(clsattpick[0].EndDate, 'DD.MM.YYYY');
              monthCalculation(start, end);
            }
          });
      },
      error => {
        console.log(error);
      },
    );
  };

  const monthCalculation = (startDate, endDate) => {
    let result = [];
    let result2 = [];
    startDate.subtract(1, 'month');
    endDate.subtract(1, 'month');

    while (startDate.isBefore(endDate)) {
      startDate.add(1, 'month');
      result2.push(startDate.format('MMMM'));
      result.push({
        value: startDate.format('DD-MM-YYYY'),
        label: startDate.format('MMMM'),
      });
    }
    let currentMonth = moment().format('MMMM');
    let value = result2.includes(currentMonth);
    let firstValue = '';

    if (value) {
      let value2 = result2.indexOf(currentMonth);
      firstValue = result[value2].value;
    } else {
      firstValue = result[0].value;
    }
    setdropdownSource2(result);
    setdropdownValue2(firstValue);
  };

  const getNotes = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      () => {
        let startDate = dropdownValue2;
        let momentDate = moment(startDate, 'DD-MM-YYYY');
        let start = moment(momentDate).startOf('month').format('MM-DD-YYYY');
        let end = moment(momentDate).endOf('month').format('MM-DD-YYYY');
        fetch(`${GLOBALS.TEACHER_URL}TeachersSentNotesForAdminDashBoard`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <TeachersSentNotesForAdminDashBoard xmlns="http://www.m2hinfotech.com//">
                <branchId>${branchId}</branchId>
                <branchClassId>${dropdownValue1}</branchClassId>
                <startDate>${start}</startDate>
              <endDate>${end}</endDate>
              </TeachersSentNotesForAdminDashBoard>
            </soap12:Body>
          </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            console.log(response, 'yfd');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName(
              'TeachersSentNotesForAdminDashBoardResult',
            )[0].childNodes[0].nodeValue;
            console.log(v, 'vvv');
            if (v === 'failure') {
              setdata('');
            } else {
              const rslt = JSON.parse(v);
              const arraySet = [...rslt.Table];
              arraySet.map(i => (i.attachments = []));
              console.log(
                arraySet,
                'array',
                arraySet !== [],
                arraySet.length !== 0,
              );
              if (
                arraySet !== undefined &&
                arraySet !== null &&
                arraySet !== [] &&
                arraySet !== '' &&
                arraySet.length !== 0
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
                setdata(arraySet);
                console.log('tdy');
              } else {
                console.log('t', dataerror);
                setDataerror(true);
              }
            }
          })
          .catch(error => {
            console.log(error, 'errer');
          });
      },
      error => {
        console.log(error);
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
        let mobile = keyValue; //Display key value
        fetch(`${GLOBALS.PARENT_URL}GetAllClasses`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
              <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                  <GetAllClasses xmlns="http://www.m2hinfotech.com//">
                    <mobileNo>${mobile}</mobileNo>
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
              const clsattpick = JSON.parse(ccc);
              let dropdownData = clsattpick;
              const dropData = dropdownData.map(element => ({
                value: element.class_Id,
                label: element.Class_name,
              }));
              setdropdownSource(dropData);
              setdropdownValue(dropdownData[0].class_Id);
              getDivisions(dropdownData[0].class_Id);
            }
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
      () => {
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

  const renderItems = ({item}) => (
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
      <View style={{flex: 0.3}}>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Class:</Text>
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
          </View>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Division:</Text>
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
          </View>
        </View>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Month:</Text>
            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdownSource2}
              value={dropdownValue2}
              onChangeText={value => {
                setdropdownValue2(value);
              }}
            />
          </View>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1} />
            <View style={styles.button}>
              <Pressable
                onPress={() => {
                  getNotes();
                  console.log('test');
                }}>
                <Text style={styles.buttonText}>SUBMIT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      {dataerror === true ? (
        <Text style={styles.noReports}>No reports found!</Text>
      ) : (
        <FlatList
          data={data}
          style={{flex: 10}}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.cardin}>
                <View style={styles.cardtitleView}>
                  <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                    <Text style={styles.cardtitle}>{item.Title} </Text>
                  </Hyperlink>
                </View>
                <View style={styles.cardDateView}>
                  <Text style={styles.carddate}> {item.Date} </Text>
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
              <View style={styles.cardinrow}>
                <Text style={styles.cardintext}>Sent to: </Text>
                <Text style={styles.cardintext}>{item.PhoneNo}</Text>
              </View>
              <View style={styles.cardinrow}>
                <Text style={styles.cardintext}>Sent by: </Text>
                <Text style={styles.cardintext}>{item.TeacherName}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TeacherNotes;

const styles = StyleSheet.create({
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
    fontSize: 14,
    color: '#8A8A8A',
  },
  cardtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  pickerStyle: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        paddingLeft: 5,
        paddingTop: 10,
        borderColor: 'grey',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
      ios: {
        borderWidth: 0.5,
        paddingLeft: 5,
        borderColor: 'grey',
        height: 30,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
    }),
  },
  carddate: {
    fontSize: 16,
  },
  carddesc: {
    fontSize: 14,
    padding: 5,
    flexWrap: 'wrap',
  },
  noReports: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerview: {
    ...Platform.select({
      ios: {
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
      },
      android: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        flexDirection: 'row',
        flex: 1,
        borderWidth: 0.5,
        borderRadius: 4,
        borderColor: '#000000',
      },
    }),
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    marginTop: 5,
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  touchableView: {
    flexDirection: 'row',
  },
  pickerView: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
      ios: {
        flex: 1,
        marginRight: 10,
      },
    }),
  },
  textStyle1: {
    marginLeft: 5,
    marginBottom: 5,
  },
  button: {
    height: 36,
    width: '96%',
    marginRight: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginLeft: 5,
    backgroundColor: '#17BED0',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  containertop: {
    elevation: 3,
    height: 100,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CB050',
  },
});
