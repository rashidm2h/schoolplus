import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const TeacherFeeStructure = ({route, navigation}) => {
  const [nodata, setnodata] = useState(true);
  const [isLoading, setisLoading] = useState(true);
  const [dataSource, setdataSource] = useState(' ');
  const parser = new DOMParser();

  useEffect(() => {
    StdFeelist();
  }, []);

  const StdFeelist = () => {
    fetch(`${GLOBALS.TEACHER_URL}StudentFeeStructure`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <StudentFeeStructure xmlns="http://www.m2hinfotech.com//">
      <StdIds>${route.params.Stdid}</StdIds>
    </StudentFeeStructure>
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
        var result = parser
          .parseFromString(response)
          .getElementsByTagName('StudentFeeStructureResult')[0]
          .childNodes[0].nodeValue;
        if (result === 'failure') {
          setnodata(false);
        } else {
          var output = JSON.parse(result);
          setdataSource(output);
          setisLoading(false);
          setnodata(true);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  return nodata === false ? (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.flatlistView}>
        <View style={styles.noDataView}>
          <Text style={styles.notDataText}>No Fee Available</Text>
        </View>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.flatlistView}>
        {isLoading && (
          <ActivityIndicator
            style={styles.progressBar}
            color="#C00"
            size="large"
          />
        )}
        <FlatList
          data={dataSource}
          renderItem={({item}) => (
            <View style={styles.itemStyle}>
              <TouchableOpacity
                style={styles.buttonstyle}
                onPress={() => {
                  const feeids = item.FeeId;
                  const Stdid = route.params.Stdid;
                  navigation.navigate('TeacherPayFee', {Stdid, feeids});
                }}>
                <Text style={styles.textst}>{item.FeeName}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noDataView: {
    marginTop: wp('24%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('5%'),
  },
  flatlistView: {
    flex: 8,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  esscontainermiddel: {
    flexGrow: 0.5,
    flex: 3,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  itemStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  buttonstyle: {
    backgroundColor: '#034951',
    height: wp('16%'),
    width: wp('96%'),
    marginVertical: wp('8%'),
    marginHorizontal: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textst: {
    color: '#CAD5D6',
    textAlign: 'center',
    fontSize: wp('5%'),
    fontWeight: 'normal',
  },
});
export default TeacherFeeStructure;
