import React, {useState, useEffect} from 'react';
import {DOMParser} from 'xmldom';
import {useIsFocused} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, FlatList, Text, View, Pressable} from 'react-native';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

let branchId = '';
let academicId = '';

const PendingEvaluation = ({navigation}) => {
  const isFocused = useIsFocused();
  const [data, setdata] = useState('');
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const parser = new DOMParser();

  useEffect(() => {
    loadList();
  }, [isFocused]);

  const loadList = () => {
    AsyncStorage.getItem('BranchID')
      .then(keyValue2 => {
        branchId = keyValue2;
      })
      .catch(error => {
        console.log(error);
      });
    AsyncStorage.getItem('FinancialYear')
      .then(keyValue2 => {
        academicId = keyValue2;
      })
      .catch(error => {
        console.log(error);
      });
    AsyncStorage.getItem('acess_token').then(
      keyValue2 => {
        fetch(`${GLOBALS.PARENT_URL}HodEvaluationTeachersList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <HodEvaluationTeachersList xmlns="http://www.m2hinfotech.com//">
                  <academicId>${academicId}</academicId>
                  <branchId>${branchId}</branchId>
                  <mobileNo>${keyValue2}</mobileNo>
                </HodEvaluationTeachersList>
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
            const result = parser
              .parseFromString(response)
              .getElementsByTagName('HodEvaluationTeachersListResult')[0]
              .childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(result);
              setdata(output.Table);
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
                    {item.SubmitStatus === 'C' ? (
                      <View>
                        <Pressable
                          onPress={() =>
                            navigation.navigate('EvaluatorEditQuestions', {
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
                    ) : null}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  item: {
    marginLeft: 5,
  },
  line: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'grey',
  },
  nameText: {
    fontSize: 16,
    margin: 10,
  },
});
export default PendingEvaluation;
