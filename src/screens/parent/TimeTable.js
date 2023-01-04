import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Loader from '../../components/ProgressIndicator';
import Header from '../../components/Header';

const TimeTable = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  useEffect(() => {
    timetableData();
  }, []);

  const timetableData = () => {
    AsyncStorage.getItem('StdID').then(
      keyValue => {
        const Stdid = keyValue;
        fetch(`${GLOBALS.PARENT_URL}RetrieveStdTimeTable`, {
          method: 'POST',
          body: `
		    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
		  <soap12:Body>
		    <RetrieveStdTimeTable xmlns="http://www.m2hinfotech.com//">
		      <studentId>${Stdid}</studentId>
		    </RetrieveStdTimeTable>
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
              'RetrieveStdTimeTableResult',
            )[0].childNodes[0].nodeValue;
            if (v === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(v);
              setdata(rslt);
            }
          })
          .catch(error => {
            setloading(false);
            setdataerror(true);
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
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      {loading ? (
        <Loader />
      ) : (
        <>
          <View style={styles.containerTableTop}>
            <View style={styles.textWhiteBox}>
              <Text style={styles.textwhite}>DAYS</Text>
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
            <View style={styles.textWhiteBoxlast}>
              <Text style={styles.textwhite}>8</Text>
            </View>
          </View>

          <View style={styles.containerTableBottom}>
            {!dataerror && (
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
                      <Text style={styles.textBlue}>{item.PeriodTeacher1}</Text>
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.textRed}>{item.Period2}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher2}</Text>
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.textRed}>{item.Period3}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher3}</Text>
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.textRed}>{item.Period4}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher4}</Text>
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.textRed}>{item.Period5}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher5}</Text>
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.textRed}>{item.Period6}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher6}</Text>
                    </View>
                    <View style={styles.textBox}>
                      <Text style={styles.textRed}>{item.Period7}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher7}</Text>
                    </View>
                    <View style={styles.textBoxlast}>
                      <Text style={styles.textRed}>{item.Period8}</Text>
                      <Text style={styles.textBlue}>{item.PeriodTeacher8}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default TimeTable;

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
  containerTableTop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#AF67BD',
  },
  textWhiteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  textWhiteBoxlast: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderColor: '#FFFFFF',
  },
  textBoxlast: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#C7C7C7',
    flexDirection: 'column',
  },
  textBox: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#C7C7C7',
    flexDirection: 'column',
  },
  containerTableBottom: {
    flex: 7,
    flexDirection: 'column',
  },
  containerTableBottomRow: {
    flex: 1,
    height: 60,
    flexDirection: 'row',
  },
  textwhite: {
    textAlign: 'center',
    color: '#FFFFFF',
    flex: 0,
    flexShrink: 1,
  },
  textBlack: {
    flexWrap: 'wrap',
    color: '#868686',
  },
  textRed: {
    color: '#C8717F',
    flex: 0,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  textBlue: {
    flex: 0,
    flexShrink: 1,
    flexWrap: 'wrap',
    color: '#77728B',
    fontSize: 10,
    textAlign: 'center',
  },
});
