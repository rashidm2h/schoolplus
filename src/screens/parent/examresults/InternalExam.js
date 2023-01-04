import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Platform, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const InternalExam = () => {
  const [loading, setloading] = useState(true);
  const [dropdownData, setdropdownData] = useState([]);
  const [exam, setexam] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  const [examId, setexamId] = useState('');
  let stdId = '';

  useEffect(() => {
    getExams();
  }, []);

  const getExams = () => {
    AsyncStorage.getItem('StdID').then(keyValue => {
      stdId = keyValue;
      fetch(`${GLOBALS.PARENT_URL}GetStudentExamListNew`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <GetStudentExamListNew xmlns="http://www.m2hinfotech.com//">
              <stdId>${stdId}</stdId>
              <type>2</type>
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
          setloading(false);
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response);
          const v = xmlDoc.getElementsByTagName(
            'GetStudentExamListNewResult',
          )[0].childNodes[0].nodeValue;
          if (v === 'failure') {
            setexam(false);
          } else {
            const rslt = JSON.parse(v);
            const rslt1 = rslt[0].ExamId;
            setexamId(rslt1);
            let datahere = rslt;
            const dropData = datahere.map(element => ({
              value: element.ExamId,
              label: element.ExamName,
            }));
            setdropdownData(dropData);
            getExamMarks(rslt1);
          }
        })
        .catch(error => {
          setloading(false);
          console.log(error);
        });
    });
  };

  const getExamMarks = examId => {
    fetch(`${GLOBALS.PARENT_URL}GetStdExmMarks`, {
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
        setloading(false);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response);
        const v = xmlDoc.getElementsByTagName('GetStdExmMarksResult')[0]
          .childNodes[0].nodeValue;
        if (v === 'failure') {
        } else {
          const rslt = JSON.parse(v);
          setdata(rslt);
        }
      })
      .catch(error => {
        console.log(error);
        setloading(false);
      });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <View style={styles.verticalView}>
          <Text style={styles.textStyle1}>Select Exam:</Text>
          <Dropdown
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            data={dropdownData}
            value={examId}
            containerStyle={styles.pickerStyle}
            onChangeText={value => {
              setexamId(value);
              getExamMarks(value);
            }}
          />
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableRowItemHead}>
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
              keyExtractor={(item, index) => index.toString()}
              data={data}
              renderItem={({item}) => (
                <View style={styles.tableRowflatlist}>
                  <View style={styles.tableRowItem}>
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
      )}
    </View>
  );
};

export default InternalExam;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  noDataView: {
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  progressBar: {
    flex: 1,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  textStyle1: {
    margin: 10,
    fontSize: 15,
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
    borderWidth: 0.5,
    borderColor: 'grey',
    justifyContent: 'center',
    borderRadius: 3,
    // padding: 5,
    // paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        height: 40,
      },
      android: {
        height: 35,
      },
    }),
  },
  pickerStyleout: {
    ...Platform.select({
      android: {
        height: 35,
        borderWidth: 1,
        borderColor: '#badc58',
        flex: 0.5,
        borderRadius: 3,
        elevation: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
      },
    }),
  },
  table: {
    marginTop: 5,
    flexDirection: 'column',
    flex: 1,
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
    height: 40,
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  tableRowItemHeadSubject: {
    paddingLeft: 10,
    elevation: 5,
    height: 40,
    flex: 2,
    backgroundColor: '#B866C6',
    // alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },

  tableRowItemHeadLast: {
    elevation: 5,
    height: 40,
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
    paddingLeft: 10,
    flex: 2,
    borderRightWidth: Platform.OS === 'ios' ? 0.003 : 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    // alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'center',
  },
  tableRowflatlist: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        backgroundColor: '#FFFFFF',
        borderColor: 'gray',
        borderWidth: 0.6,
      },
    }),
  },
  textWhite: {
    fontSize: 14,
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
    margin: 1,
    borderWidth: 0.5,
    borderColor: 'gray',
    flex: 1,
    flexDirection: 'column',
  },
});
