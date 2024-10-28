import React, {useState, useEffect} from 'react';
import {DOMParser} from 'xmldom';
import {StyleSheet, FlatList, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const UpcomingEvents = () => {
  const [data, setdata] = useState('');
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const parser = new DOMParser();

  useEffect(() => {
    getUpcmgevent();
    EventTCount();
  }, []);

  const getUpcmgevent = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const string = 'new';
        console.log(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetEventDetails`, `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <GetEventDetails xmlns="http://www.m2hinfotech.com//">
              <phoneNo>${keyValue}</phoneNo>
              <status>${string}</status>
            </GetEventDetails>
          </soap12:Body>
          </soap12:Envelope>
          `)
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetEventDetails`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <GetEventDetails xmlns="http://www.m2hinfotech.com//">
        <phoneNo>${keyValue}</phoneNo>
        <status>${string}</status>
      </GetEventDetails>
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
            const result = parser
              .parseFromString(response)
              .getElementsByTagName('GetEventDetailsResult')[0]
              .childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(result);
              setdata(output);
            }
          })
          .catch(error => {
            setloading(false);
            setdataerror(true);
            console.log(error);
          });
      },
      error => {
        console.log(error);
      },
    );
  };
  const EventTCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        console.log(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=Getcount`,`<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
     <Getcount xmlns="http://www.m2hinfotech.com//">
       <PhoneNo>${keyValue}</PhoneNo>
     </Getcount>
   </soap12:Body>
 </soap12:Envelope>
     `)
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=Getcount`, {
          method: 'POST',
          body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
     <Getcount xmlns="http://www.m2hinfotech.com//">
       <PhoneNo>${keyValue}</PhoneNo>
     </Getcount>
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
            const result = parser
              .parseFromString(response)
              .getElementsByTagName('GetcountResult')[0]
              .childNodes[0].nodeValue;
            if (result === 'failure') {
            } else {
              const rslt = JSON.parse(result);
              try {
                AsyncStorage.setItem(
                  'removeTeacherEventCount',
                  JSON.stringify(rslt[0].count),
                );
              } catch (error) {
                console.log(error);
              }
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
              <View style={styles.container}>
                <View style={styles.teachercontainermiddel}>
                  <View style={styles.textcontaineone}>
                    <Text style={styles.textc}>DATE</Text>
                  </View>
                  <View style={styles.textcontaintwo}>
                    <Text style={styles.textc}>EVENT DETAILS</Text>
                  </View>
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textc}>TIME</Text>
                  </View>
                </View>
                <View style={styles.esscontainerbottom}>
                  {/* <View style={styles.flatlistStyle}> */}
                    <FlatList
                      keyExtractor={(item, index) => index}
                      data={data}
                      renderItem={({item}) => (
                        <View style={styles.itemStyle}>
                          <View style={styles.itemone}>
                            <Text style={styles.item}>{item.StartDate}</Text>
                            <Text style={styles.item}>to</Text>
                            <Text style={styles.item}>{item.EndDate}</Text>
                          </View>
                          <View style={styles.itemtwo}>
                            <Text style={styles.itemTitle}>
                              {item.EventName}
                            </Text>
                            <Text style={styles.itemDesc}>
                              {item.Description}
                            </Text>
                          </View>
                          <View style={styles.itemthree}>
                            <Text style={styles.item}>{item.StartTime}</Text>
                            <Text style={styles.item}>to</Text>
                            <Text style={styles.item}>{item.EndTime} </Text>
                          </View>
                        </View>
                      )}
                    />
                  {/* </View> */}
                </View>
              </View>
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
  notDataText: {
    fontSize: wp('5%'),
    textAlign: 'center',
  },
  teachercontainermiddel: {
    width: wp('100%'),
    height: wp('15.5%'),
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderBottomWidth: wp('0.6%'),
    borderBottomColor: '#E0E0E0',
    paddingLeft: wp('1%')
  },
  textcontaineone: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp('0.3%'),
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontainthree: {
    flex: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp('0.3%'),
  },
  texthead: {
    fontSize: wp('4.5%'),
    color: '#BA69C8',
    marginLeft: 10,
  },
  textc: {
    fontSize: wp('4.5%'),
    color: '#BA69C8',
  },
  esscontainerbottom: {
    // flex: 7,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  
  },
  flatlistStyle: {
    flex: 1,
    
  },
  itemStyle: {
    flexDirection: 'row',
    borderBottomWidth: wp('0.6%'),
    borderBottomColor: '#D3D3D3',
    paddingLeft: wp('1%')
  },
  item: {
    flex: 1,
    fontSize: wp('4%'),
    textAlign: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: wp('4%'),
    textAlign: 'center',
    marginLeft: wp('3.2%'),
  },
  itemDesc: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: wp('3.2%'),
    marginLeft: wp('3.2%'),
  },
  itemone: {
    flexDirection: 'column',
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  itemthree: {
    flexDirection: 'column',
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
});

export default UpcomingEvents;
