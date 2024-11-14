import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';
import Header from '../../../components/Header';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const Teachers1 = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  useEffect(() => {
    loadTeacherDetails();
  }, []);
  const loadTeacherDetails = () => {
    AsyncStorage.getItem('BranchID').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_SERVICE}GetTeachersListWithClass`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetTeachersListWithClass xmlns="http://www.m2hinfotech.com//">
          <branchId>${keyValue}</branchId>
        </GetTeachersListWithClass>
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
              'GetTeachersListWithClassResult',
            )[0].childNodes[0].nodeValue;
            console.log('cc', ccc);
            if (ccc === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(ccc);
              setdata(output);
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
  };
  const pressAction = item => {
    navigation.navigate('Teachers2', {
      itemId: item.TeacherId,
    });
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No data found!</Text>
          ) : (
            <>
              <View style={styles.flatlistTitle}>
                <View style={styles.textcontaintwo}>
                  <Text style={styles.titleText2}>NAME</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.textcontainthree}>
                  <Text style={styles.titleText3}>DESIGNATION</Text>
                </View>
              </View>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                renderItem={({item}) => (
                  <View>
                    <Pressable onPress={() => pressAction(item)}>
                      <View style={styles.itemStyle}>
                        <View style={styles.itemone}>
                          <Text style={styles.item}>{item.Name}</Text>
                        </View>
                        <View style={styles.itemtwo}>
                          <Text style={styles.item}>
                            {item.Class === null ? '' : item.Class}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
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

export default Teachers1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  line: {
    borderRightWidth: wp('0.4%'),
    borderRightColor: '#FFFFFF',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: wp('13%'),
    backgroundColor: '#BA69C8',
    elevation: 3,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: wp('3.5%'),
    marginTop: wp('3.5%'),
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: wp('3.5%'),
    marginTop: wp('3.5%'),
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
    borderBottomWidth: wp('0.5%'),
    borderBottomColor: '#D3D3D3',
  },
  itemone: {
    flex: 2,
    paddingTop: wp('3%'),
    paddingBottom: wp('3%'),
    // alignItems: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 1.25,
    paddingTop: wp('3%'),
    paddingBottom: wp('3%'),
    // marginLeft: 10,
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  item: {
    marginLeft: wp('1.5%'),
  },
});
