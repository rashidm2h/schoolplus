import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Platform, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';
let avkexamIdStatus = true;
let avkexamId = '';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const CommonExam = () => {
  const [loading, setloading] = useState(true);
  const [dataSource, setdataSource] = useState('');
  const [SelectedExam, setSelectedExam] = useState('');
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  const [dataSourceExamMark, setdataSourceExamMark] = useState([]);
  const [keys, setkeys] = useState('');
  const [domain, setdomain] = useState('');
  let stdId = '';

  useEffect(() => {
    getExams();
  }, []);
  const getExams = () => {
    AsyncStorage.getItem('domain').then(keyValue => {
      setdomain(keyValue);
      //avk.schoolplusapp.com
      if (keyValue === 'avk.schoolplusapp.com') {
        // this.setState({
        //   examType: 'avkpt'
        // });

        AsyncStorage.getItem('StdID').then(keyValue => {
          stdId = keyValue;
          getMarkSheet();
        });
      } else {
        AsyncStorage.getItem('StdID').then(keyValue => {
          stdId = keyValue;
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStudentExamListNew`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <GetStudentExamListNew xmlns="http://www.m2hinfotech.com//">
              <stdId>${stdId}</stdId>
              <type>1</type>
            </GetStudentExamListNew>
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
              const v = xmlDoc.getElementsByTagName(
                'GetStudentExamListNewResult',
              )[0].childNodes[0].nodeValue;
              if (v === 'failure') {
                setdataSource('');
              } else {
                const rslt = JSON.parse(v);
                const rslt1 = rslt[0].ExamId;
                let dropdownData = rslt;
                const dropData = dropdownData.map(element => ({
                  value: element.ExamId,
                  label: element.ExamName,
                }));
                setdataSource(rslt);
                setSelectedExam(rslt1);
                setdropdownSource(dropData);
                setdropdownValue(dropdownData[0].ExamId);
                getExamMarks(rslt1);
              }
            })
            .catch(error => {
              console.log(error);
            });
        });
      }
    });
  };

  const getMarkSheet = () => {
    // if (examId > 4 ){
    //   this.setState({
    //     examType: 'avkt'
    //   });
    // }
    // else {
    //   this.setState({
    //     examType: 'avkpt'
    //   });

    // }
    let branchId = '';

    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      // this.setState({
      //   BranchID,
      //   upcmgEventLoading: true,
      // });
      fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=RetrieveAllMarksheet`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <RetrieveAllMarksheet xmlns="http://www.m2hinfotech.com//">
                <studentId>${stdId}</studentId>
                <brnachId>${branchId}</brnachId>
              </RetrieveAllMarksheet>
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
          const v = xmlDoc.getElementsByTagName('RetrieveAllMarksheetResult')[0]
            .childNodes[0].nodeValue;
          console.log('v', v);
          if (v === 'failure') {
            setdataSourceExamMark('');
          } else {
            const rslt = JSON.parse(v);
            console.log(rslt[0]);
            let keys = Object.keys(rslt[0]);
            console.log(rslt, 'rslt 2');
            setdataSourceExamMark(rslt);
            setkeys(keys);

            // this.setState({
            //   dataSourceExamMark: rslt,
            //   keys,
            //   status: 'success',
            //   isLoading: false,
            //   visible: true,
            // });
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  const getExamMarks = examId => {
    fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStdExmMarks`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<GetStdExmMarks xmlns="http://www.m2hinfotech.com//">
<StdId>${stdId}</StdId>
<ExamId>${examId}</ExamId>
</GetStdExmMarks>
</soap12:Body>
</soap12:Envelope>
 `,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/soap+xml; charset=utf-8',
      },
    })
      .then(response => response.text())
      .then(response => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response);
        const v = xmlDoc.getElementsByTagName('GetStdExmMarksResult')[0]
          .childNodes[0].nodeValue;
        if (v === 'failure') {
          console.log('failure');
          // this.setState({
          //   visible: false,
          //   dataSourceExamMark: ' ',
          // });
          setdataSourceExamMark('');
        } else {
          const rslt = JSON.parse(v);
          console.log(rslt);
          console.log(rslt, 'rslt 2');
          setdataSourceExamMark(rslt);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const avkPTHeader = (item, exam, index) => {
    console.log('Hello');
    if (item !== avkexamId) {
      avkexamIdStatus = true;
      avkexamId = item;
    } else {
      avkexamIdStatus = false;
    }

    return item > 4 ? (
      <View>
        {dataSourceExamMark[index !== 0 ? index - 1 : 0][keys[0]] !== item ||
        index === 0 ? (
          <View>
            <View
              style={{
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                backgroundColor: 'white',
              }}>
              <Text style={{fontSize: 16, color: '#B866C6'}}>{exam}</Text>
            </View>
            <View style={styles.tableRow}>
              <View
                style={[
                  styles.tableRowItemHeadSubject,
                  {flex: 2, paddingLeft: 3},
                ]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>
                  {keys[2]}
                </Text>
              </View>
              <View style={[styles.tableRowItemHead, {flex: 0.8}]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>
                  {keys[6]}
                </Text>
              </View>
              <View style={[styles.tableRowItemHead, {flex: 2}]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>
                  {keys[7]}
                </Text>
              </View>
              <View style={[styles.tableRowItemHead, {flex: 0.8}]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>
                  {keys[8]}
                </Text>
              </View>
              <View style={[styles.tableRowItemHead, {flex: 0.9}]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>
                  {keys[9]}
                </Text>
              </View>
              <View style={[styles.tableRowItemHead, {flex: 0.9}]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>
                  {keys[10]}
                </Text>
              </View>
              <View style={[styles.tableRowItemHeadLast, {flex: 0.9}]}>
                <Text style={[styles.textWhite, {fontSize: 13}]}>Grade</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    ) : (
      <View>
        {dataSourceExamMark[index !== 0 ? index - 1 : 0][keys[0]] !== item ||
        index === 0 ? (
          <View>
            <View
              style={{
                marginTop: 10,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                backgroundColor: 'white',
              }}>
              <Text style={{fontSize: 16, color: '#B866C6'}}>{exam}</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableRowItemHeadSubject}>
                <Text style={styles.textWhite}>{keys[2]}</Text>
              </View>
              <View style={styles.tableRowItemHead}>
                <Text style={styles.textWhite}>{keys[3]}</Text>
              </View>
              <View style={styles.tableRowItemHead}>
                <Text style={styles.textWhite}>{keys[4]}</Text>
              </View>
              <View style={styles.tableRowItemHeadLast}>
                <Text style={styles.textWhite}>{keys[5]}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  };
  return (
    <View style={{flex: 1}}>
      {domain === 'avk.schoolplusapp.com' ? (
        <FlatList
          data={dataSourceExamMark}
          renderItem={({item, index}) => (
            <View style={styles.table}>
              {avkPTHeader(item[keys[0]], item[keys[1]], index)}
              {item[keys[0]] > 4 ? (
                <View style={styles.tableRowflatlist}>
                  <View
                    style={[
                      styles.tableRowItemSubject,
                      {flex: 2, paddingLeft: 3},
                    ]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {item[keys[2]]}
                    </Text>
                  </View>
                  <View style={[styles.tableRowItem, {flex: 0.8}]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {item[keys[6]]}
                    </Text>
                  </View>
                  <View style={[styles.tableRowItem, {flex: 2}]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {item[keys[7]]}
                    </Text>
                  </View>
                  <View style={[styles.tableRowItem, {flex: 0.8}]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {item[keys[8]]}
                    </Text>
                  </View>
                  <View style={[styles.tableRowItem, {flex: 0.9}]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {item[keys[9]]}
                    </Text>
                  </View>
                  <View style={[styles.tableRowItem, {flex: 0.9}]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {item[keys[10]]}
                    </Text>
                  </View>
                  <View style={[styles.tableRowItem, {flex: 0.9}]}>
                    <Text style={[styles.textBlack, {fontSize: 12}]}>
                      {!item[keys[11]]
                        ? item[keys[11]]
                        : String.prototype.trim.call(item[keys[11]])}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.tableRowflatlist}>
                  <View style={styles.tableRowItemSubject}>
                    <Text style={styles.textBlack}>{item[keys[2]]}</Text>
                  </View>
                  <View style={styles.tableRowItem}>
                    <Text style={styles.textBlack}>{item[keys[3]]}</Text>
                  </View>
                  <View style={styles.tableRowItem}>
                    <Text style={styles.textBlack}>{item[keys[4]]}</Text>
                  </View>
                  <View style={styles.tableRowItem}>
                    <Text style={styles.textBlack}>
                      {!item[keys[5]]
                        ? item[keys[5]]
                        : String.prototype.trim.call(item[keys[5]])}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.container}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Select Exam:</Text>

            <Dropdown
              data={dropdownSource}
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              value={dropdownValue}
              onChangeText={value => {
                setdropdownValue(value);
                if (domain === 'avk.schoolplusapp.com') {
                  getMarkSheet(value);
                } else {
                  setSelectedExam(value);
                  getExamMarks(value);
                }
              }}
            />

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableRowItemHeadSubject}>
                  <Text style={styles.textWhite}>SUBJECT</Text>
                </View>
                <View style={styles.tableRowItemHead}>
                  <Text style={styles.textWhite}>MARK</Text>
                </View>
                <View style={styles.tableRowItemHead}>
                  <Text style={styles.textWhite}>MAX MARK</Text>
                </View>
                <View style={styles.tableRowItemHeadLast}>
                  <Text style={styles.textWhite}>GRADE</Text>
                </View>
              </View>
              <FlatList
                data={dataSourceExamMark}
                keyExtractor={(item, index) => index.toString()}
                extraData={dataSourceExamMark}
                renderItem={({item, index}) => (
                  <View style={styles.tableRowflatlist}>
                    <View style={styles.tableRowItemSubject}>
                      <Text style={styles.textBlack}>{item.SubName}</Text>
                    </View>
                    <View style={styles.tableRowItem}>
                      <Text style={styles.textBlack}>{item.StudentMark}</Text>
                    </View>
                    <View style={styles.tableRowItem}>
                      <Text style={styles.textBlack}>{item.MaxMark}</Text>
                    </View>
                    <View style={styles.tableRowItem}>
                      <Text style={styles.textBlack}>
                        {!item.GradeName
                          ? item.GradeName
                          : String.prototype.trim.call(item.GradeName)}
                      </Text>
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CommonExam;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },

  textStyle1: {
    margin: wp('3.3%'),
    fontSize: wp('4.5%'),
  },
  pickerStyleView: {
    // ...Platform.select({
    //   android: {
    //     borderWidth: 0.5,
    //     borderColor: 'grey',
    //     justifyContent: 'center',
    //     borderRadius: 3,
    //     marginLeft: 5,
    //     marginRight: 5,
    //     height: 35,
    //   }
    // })
  },
  pickerStyle: {
    borderWidth: wp('0.4%'),
    borderColor: 'grey',
    paddingTop: wp('2.9%'),
    justifyContent: 'center',
    borderRadius: 3,
    marginLeft: wp('3.5%'),
    marginRight: wp('3.5%'),
    ...Platform.select({
      ios: {
        height: wp('11%'),
      },
      android: {
        height: wp('11%'),
      },
    }),
  },
  table: {
    marginTop: wp('3%'),
    flexDirection: 'column',
    // flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowRadius: 4,
        shadowOpacity: 0.5,
        shadowOffset: {
          width: 0,
          height: 1,
        },
      },
      android: {
        backgroundColor: '#FFFFFF',
      },
    }),
  },
  tableRowItemHead: {
    elevation: 5,
    height: wp('12.5%'),
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.5%'),
    borderRightColor: '#FFFFFF',
  },
  tableRowItemHeadSubject: {
    paddingLeft: wp('3.5%'),
    elevation: 5,
    height: wp('12.5%'),
    flex: 2,
    backgroundColor: '#B866C6',
    // alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.5%'),
    borderRightColor: '#FFFFFF',
  },

  tableRowItemHeadLast: {
    elevation: 5,
    height: wp('12.5%'),
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tableRowItem: {
    flex: 1,
    borderRightWidth: Platform.OS === 'ios' ? 0.003 : 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'center',
  },
  tableRowItemSubject: {
    paddingLeft: wp('3.5%'),
    flex: 2,
    borderRightWidth: Platform.OS === 'ios' ? 0.003 : 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    // alignItems: 'center',
    paddingTop: wp('1.5%'),
    paddingBottom: wp('1.5%'),
    justifyContent: 'center',
  },
  tableRowflatlist: {
    borderBottomWidth: wp('0.5%'),
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        backgroundColor: '#FFFFFF',
        borderColor: 'gray',
        borderWidth: wp('0.5%'),
      },
    }),
  },
  textWhite: {
    fontSize: wp('4.2%'),
    color: '#FFFFFF',
  },
  textBlack: {
    // alignSelf: 'center'
  },
  textRed: {
    alignSelf: 'center',
    color: '#FF0000',
  },
  flatlist: {
    margin: wp('0.5%'),
    borderWidth: wp('0.5%'),
    borderColor: 'gray',
    // flex: 1,
    flexDirection: 'column',
  },
});
