import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
  Text,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const TeacherWise = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  let branchId = '';
  let username = '';
  useEffect(() => {
    getTeachers();
  }, []);

  const getTeachers = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          username = keyValue;
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetAllTeachers`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <GetAllTeachers xmlns="http://www.m2hinfotech.com//">
            <Branchid>${branchId}</Branchid>
          </GetAllTeachers>
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
              const ccc = xmlDoc.getElementsByTagName('GetAllTeachersResult')[0]
                .childNodes[0].nodeValue;
              console.log('cc', ccc);
              if (ccc === 'failure') {
                Alert.alert(
                  '',
                  'It seems like you there are no teachers to choose!',
                );
              } else {
                const output = JSON.parse(ccc);
                let dropdownData = output;
                const dropData = dropdownData.map(element => ({
                  value: element.TeacherId,
                  label: element.Name,
                }));
                setdropdownSource(dropData);
                setdropdownValue(dropdownData[0].TeacherId);
                TimeTableData(dropdownData[0].TeacherId);
              }
            })
            .catch(error => {
              setloading(false);
              console.log(error);
            });
        },
        error => {
          console.log(error); //Display error
        },
      );
    });
  };

  const TimeTableData = value => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('BranchID').then(keyValue2 => {
          const SchoolBranch = keyValue2;
          //Display key value
          fetch(
            `http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=RetrieveTeacherTimeTableForAdminDashBoard`,
            {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
                <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                  <soap12:Body>
                    <RetrieveTeacherTimeTableForAdminDashBoard xmlns="http://www.m2hinfotech.com//">
                      <branch>${keyValue2}</branch>
                      <teacherId>${value}</teacherId>
                    </RetrieveTeacherTimeTableForAdminDashBoard>
                  </soap12:Body>
                </soap12:Envelope>`,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'text/xml; charset=utf-8',
              },
            },
          )
            .then(response => response.text())
            .then(response => {
              setloading(false);
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response);
              const v = xmlDoc.getElementsByTagName(
                'RetrieveTeacherTimeTableForAdminDashBoardResult',
              )[0].childNodes[0].nodeValue;
              console.log(v);
              if (v === 'failure') {
                setdataerror(true);
              }
              const rslt = JSON.parse(v);
              setdata(rslt);
            })
            .catch(error => {
              setloading(false);
              console.log(error);
            });
        });
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Dropdown
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            containerStyle={styles.pickerStyle}
            data={dropdownSource}
            value={dropdownValue}
            onChangeText={value => {
              setdropdownValue(value);
              TimeTableData(value);
            }}
          />
          <View style={styles.containerTableTop}>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>Days</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>1</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>2</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>3</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>4</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>5</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>6</Text>
            </View>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>7</Text>
            </View>
            <View style={styles.textWhiteBoxLast}>
              <Text style={styles.textwhite}>8</Text>
            </View>
          </View>

          <View style={styles.containerTableBottom}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={data}
              renderItem={({item}) => (
                <View style={styles.containerTableBottomRow}>
                  <View style={styles.textBox}>
                    <Text style={styles.textBlack}>
                      {item.dayname.slice(0, 3)}
                    </Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period1}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass1}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period2}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass2}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period3}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass3}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period4}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass4}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period5}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass5}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period6}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass6}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <Text style={styles.textRed}>{item.Period7}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass7}</Text>
                  </View>
                  <View style={styles.textBoxLast}>
                    <Text style={styles.textRed}>{item.Period8}</Text>
                    <Text style={styles.textBlue}>{item.PeriodClass8}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default TeacherWise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  noDataView: {
    marginTop: wp('22%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('4.5%'),
  },
  containerTableTop: {
    flex: 1,
    flexDirection: 'row',
    elevation: 3,
    backgroundColor: '#AF67BD',
  },
  textWhiteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRightWidth: wp('0.5%'),
    borderColor: '#FFFFFF',
    flexDirection: 'row',
  },
  textWhiteBoxLast: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },

  textBox: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    // padding: 10,
    borderRightWidth: wp('0.5%'),
    borderBottomWidth: wp('0.5%'),
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  textBoxLast: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    borderBottomWidth: wp('0.5%'),
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  containerTableBottom: {
    flex: 9,
    flexDirection: 'column',
  },
  containerTableBottomRow: {
    flex: 1,
    // height: 60,
    flexDirection: 'row',
  },
  textwhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#868686',
  },
  textRed: {
    color: '#C8717F',
    textAlign: 'center',
    fontSize: wp('3.6%'),
    paddingLeft: wp('0.7%'),
    paddingRight: wp('0.5%'),
    alignSelf: 'center',
  },
  textBlue: {
    color: '#77728B',
  },
  pickerStyle: {
    height: wp('12%'),
    margin: wp('3.5%'),
    paddingLeft: wp('1.5%'),
    paddingRight: wp('1.5%'),
    paddingTop: wp('3.5%'),
    width: wp('90%'),
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: wp('1.5%'),
  },
  pickerStyle1: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        paddingLeft: 5,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
      ios: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 30,
        justifyContent: 'center',
        borderRadius: 3,
        paddingLeft: 5,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
    }),
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  textStyle1: {
    marginLeft: 5,
    marginBottom: 5,
  },
});
