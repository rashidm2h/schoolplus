import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/Ionicons';
import GLOBALS from '../../../../config/Globals';
import Loader from '../../../../components/ProgressIndicator';
import {useIsFocused} from '@react-navigation/native';
const MyIcon = <Icon name="ios-arrow-down" size={25} color="black" />;
const MyIcon2 = <Icon name="ios-arrow-up" size={25} color="black" />;

const CompletedEvaluation = ({navigation}) => {
  const isFocused = useIsFocused();
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  const [data2, setdata2] = useState('');
  const [data3, setdata3] = useState('');

  useEffect(() => {
    loadList();
  }, [isFocused]);

  const loadList = () => {
    let branchId = '';
    let academicId = '';
    let department = '';
    AsyncStorage.getItem('BranchID')
      .then(keyValue2 => {
        branchId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('FinancialYear')
      .then(keyValue2 => {
        academicId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('Department')
      .then(keyValue2 => {
        department = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });
    AsyncStorage.getItem('acess_token').then(
      keyValue2 => {
        let username = keyValue2;
        fetch(`${GLOBALS.PARENT_URL}PrincipalEvaluationTeachersList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <PrincipalEvaluationTeachersList xmlns="http://www.m2hinfotech.com//">
                  <academicId>${academicId}</academicId>
                  <branchId>${branchId}</branchId>
                  <subjectId>${department}</subjectId>
                  <mobileNo>${username}</mobileNo>
                </PrincipalEvaluationTeachersList>
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
            const ccc = xmlDoc.getElementsByTagName(
              'PrincipalEvaluationTeachersListResult',
            )[0].childNodes[0].nodeValue;
            if (ccc === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(ccc);
              const it = [];
              if (
                output.Table1 !== null &&
                output.Table1 !== undefined &&
                output.Table1 !== ''
              ) {
                output.Table1.map(item => {
                  if (item.SubmitStatus === 'C') {
                    it.push(item);
                  }
                });
              }
              setdata(it);
              setdata2(output.Table);
              setdata3(output.Table2);
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      error => {
        console.log(error);
      },
    );
  };
  const iconPress = (item, index) => {
    if (item.expanded) {
      let datahere = [...data];
      datahere[index].expanded = false;
      setdata(datahere);
    } else {
      let datahere = [...data];
      datahere[index].expanded = true;
      setdata(datahere);
    }
  };

  const dataAvailable = id => {
    let dataExists = false;
    let datahere = [...data2];
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        dataExists = true;
      }
    });
    return dataExists;
  };

  const evaluatorDetails = (id, type) => {
    let datahere = [...data2];
    let value = '';
    datahere.forEach(element => {
      if (id === element.TeacherId) {
        if (type === 'marks') {
          value = element.ExternalEvalMark;
        } else {
          value = element.EvalRemarks;
        }
      }
    });
    if (value === null) {
      value = '';
    }
    return value;
  };

  const hodDetails = (id, type) => {
    let datahere = [...data2];
    let memos = [...data3];
    let array = [];
    let value = '';

    if (type === 'warnings') {
      memos.forEach(element => {
        if (id === element.TeacherId) {
          array.push(element.Warnings);
        }
      });

      value = array.join('\n');
    } else {
      datahere.forEach(element => {
        if (id === element.TeacherId) {
          if (type === 'marks') {
            value = element.HODMark;
          } else {
            value = element.HODRemarks;
          }
        }
      });
    }
    if (value === null) {
      value = '';
    }

    return value;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <View style={{flex: 1}}>
          {dataerror ? (
            <Text style={styles.notDataText}>No data found.</Text>
          ) : (
            <>
              <FlatList
                data={data}
                renderItem={({item, index}) => {
                  return (
                    <View>
                      <View style={styles.card}>
                        <View style={styles.row}>
                          <View style={{width: '80%'}}>
                            <Pressable
                              onPress={() =>
                                navigation.navigate('EvaluatorEditQuestions', {
                                  TeacherId: item.TeacherId,
                                })
                              }>
                              <Text
                                style={
                                  styles.nameText
                                }>{`${item.Name} -${item.Answer} Marks`}</Text>
                            </Pressable>
                          </View>
                          <View style={{width: '20%'}}>
                            <Pressable
                              onPress={() => iconPress(item, index)}
                              style={{justifyContent: 'center'}}>
                              <View
                                style={{alignSelf: 'center', marginTop: 10}}>
                                {item.expanded ? MyIcon2 : MyIcon}
                              </View>
                            </Pressable>
                          </View>
                        </View>
                        {item.expanded && dataAvailable(item.TeacherId) ? (
                          <View>
                            <Text
                              style={{
                                margin: 10,
                              }}>{`Evaluator Marks: ${evaluatorDetails(
                              item.TeacherId,
                              'marks',
                            )}`}</Text>
                            <Text
                              style={{
                                margin: 10,
                              }}>{`Evaluator Remarks: ${evaluatorDetails(
                              item.TeacherId,
                              'remarks',
                            )}`}</Text>
                            <Text
                              style={{
                                margin: 10,
                              }}>{`HOD Marks: ${hodDetails(
                              item.TeacherId,
                              'marks',
                            )}`}</Text>
                            <Text
                              style={{
                                margin: 10,
                              }}>{`HOD Remarks: ${hodDetails(
                              item.TeacherId,
                              'remarks',
                            )}`}</Text>
                            <Text
                              style={{
                                margin: 10,
                              }}>{`HOD Warnings: ${hodDetails(
                              item.TeacherId,
                              'warnings',
                            )}`}</Text>
                          </View>
                        ) : null}
                        {index !== data.length - 1 ? (
                          <View style={styles.line} />
                        ) : null}
                      </View>
                    </View>
                  );
                }}
                // ItemSeparatorComponent={()=><View style={styles.line}></View> }
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default CompletedEvaluation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#BA69C8',
    elevation: 3,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: 10,
    marginTop: 10,
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: 10,
    marginTop: 10,
  },
  textcontaintwo: {
    flex: 2,
  },
  textcontainthree: {
    flex: 1.25,
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  itemone: {
    flex: 2,
    paddingTop: 10,
    paddingBottom: 10,
    // alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 1.25,
    paddingTop: 10,
    paddingBottom: 10,
    // marginLeft: 10,
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  item: {
    marginLeft: 5,
  },
  line: {
    width: '100%',
    borderTopWidth: 0.75,
    borderTopColor: 'grey',
  },

  nameText: {
    fontSize: 16,
    margin: 10,
  },
});
