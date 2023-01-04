import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../../config/Globals';
import Loader from '../../../../components/ProgressIndicator';
import {useIsFocused} from '@react-navigation/native';

const PendingEvaluation = ({navigation}) => {
  const isFocused = useIsFocused();
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
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
        const username = keyValue2;
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
                  if (item.SubmitStatus === 'P') {
                    it.push(item);
                  }
                });
              }
              setdata(it);
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
                renderItem={({item, index}) => (
                  <View>
                    <View>
                      <Pressable
                        onPress={() =>
                          navigation.navigate('EvaluatorQuestions', {
                            TeacherId: item.TeacherId,
                          })
                        }>
                        <View style={styles.card}>
                          <Text style={styles.nameText}>{item.Name}</Text>
                        </View>
                      </Pressable>
                      {index !== data.length - 1 ? (
                        <View style={styles.line} />
                      ) : null}
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

export default PendingEvaluation;

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
