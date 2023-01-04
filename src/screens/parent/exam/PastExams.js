import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const PastExams = () => {
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);

  useEffect(() => {
    StdExamDetailPast();
  }, []);

  const StdExamDetailPast = () => {
    AsyncStorage.getItem('StdID').then(
      keyValue => {
        const Stdid = keyValue;
        const status = 'old';
        fetch(`${GLOBALS.PARENT_URL}GetStdExamDtls`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <GetStdExamDtls xmlns="http://www.m2hinfotech.com//">
            <StdId>${Stdid}</StdId>
            <status>${status}</status>
          </GetStdExamDtls>
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
            const rslt2 = xmlDoc.getElementsByTagName('GetStdExamDtlsResult')[0]
              .childNodes[0].nodeValue;
            if (rslt2 === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(rslt2);
              setdata(output);
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
  return (
    <View style={styles.container}>
      {dataerror ? (
        <Text style={styles.notDataText}>No Exams Found</Text>
      ) : (
        <>
          <View style={styles.containermiddel}>
            <View style={styles.textcontaineone}>
              <Text style={styles.textc}>EXAM NAME</Text>
            </View>
            <View style={styles.textcontainthree}>
              <Text style={styles.textc}>DATE</Text>
            </View>
            <View style={styles.textcontainthree}>
              <Text style={styles.textc}>TIME</Text>
            </View>
            <View style={styles.textcontaineone}>
              <Text style={styles.textc}>SUBJECT</Text>
            </View>
          </View>

          <View style={styles.esscontainerbottom}>
            <View style={styles.flatlistStyle}>
              <FlatList
                keyExtractor={(item, index) => index}
                data={data}
                style={{marginBottom: 50}}
                renderItem={({item}) => (
                  <View style={styles.itemStyle}>
                    <View style={styles.itemone}>
                      <Text style={styles.item}>{item.ExamName}</Text>
                    </View>
                    <View style={styles.itemthree}>
                      <Text style={styles.item}>{item.DateOfExam}</Text>
                    </View>
                    <View style={styles.itemthree}>
                      <Text style={styles.item}>
                        {item.StartTime}to{item.EndTime}
                      </Text>
                    </View>
                    <View style={styles.itemone}>
                      <Text style={styles.item}>{item.SubName}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </>
      )}
      {loading ? <Loader /> : null}
    </View>
  );
};

export default PastExams;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noDataView: {
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
    textAlign: 'center',
  },
  containermiddel: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  textcontaineone: {
    flex: 1.5,
    height: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontainthree: {
    flex: 1.3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  textc: {
    fontSize: 14,
    color: '#BA69C8',
  },
  ///////faltlist styles/////////////
  esscontainerbottom: {
    flexGrow: 7,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },

  itemStyle: {
    height: 38,
    flexDirection: 'row',
    borderColor: '#D3D3D3',
    borderBottomWidth: 1,
  },
  item: {
    flexWrap: 'wrap',
    fontSize: 13,
    textAlign: 'center',
    color: '#808080',
  },
  itemone: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemthree: {
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
});
