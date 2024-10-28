import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Loader from '../../components/ProgressIndicator';
import Header from '../../components/Header';
import { widthPercentageToDP as wp,
heightPercentageToDP as hp } from 'react-native-responsive-screen';

const TimeTable = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const parser = new DOMParser();

  useEffect(() => {
    TimeTableData();
  }, []);

  const TimeTableData = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('schoolBranchName').then(keyValue2 => {
//           console.log(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=RetrieveTeacherTimeTable`,`
// 			<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
//   <soap12:Body>
//     <RetrieveTeacherTimeTable xmlns="http://www.m2hinfotech.com//">
//       <PhoneNo>${keyValue}</PhoneNo>
//       <Branch>${keyValue2}</Branch>
//     </RetrieveTeacherTimeTable>
//   </soap12:Body>
// </soap12:Envelope>
// 		      `)
          fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=RetrieveTeacherTimeTable`, {
            method: 'POST',
            body: `
			<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <RetrieveTeacherTimeTable xmlns="http://www.m2hinfotech.com//">
      <PhoneNo>${keyValue}</PhoneNo>
      <Branch>${keyValue2}</Branch>
    </RetrieveTeacherTimeTable>
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
              const result = JSON.parse(
                parser
                  .parseFromString(response)
                  .getElementsByTagName('RetrieveTeacherTimeTableResult')[0]
                  .childNodes[0].nodeValue,
              );
              setdata(result);
            })
            .catch(error => {
              console.log(error);
            });
        });
      },
      error => {
        console.log(error);
      },
    );
  };
  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      {loading ? (
        <Loader />
      ) : (
        <>
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
              keyExtractor={(item, index) => index}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerTableTop: {
    flex: 1,
    flexDirection: 'row',
    elevation: 3,
    backgroundColor: '#AF67BD',
    paddingHorizontal: wp('1%')
  },
  textWhiteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRightWidth: 1,
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
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  textBoxLast: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    borderBottomWidth: 1,
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
    height: 60,
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
  },
  textBlue: {
    color: '#77728B',
  },
});

export default TimeTable;
