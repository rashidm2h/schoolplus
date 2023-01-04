import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View, Pressable} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';
import Header from '../../../components/Header';
const myIcon = <Icon name="calendar" size={25} color="white" />;

const Dashboard = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  useEffect(() => {
    loadYear();
  }, []);

  const loadYear = () => {
    AsyncStorage.getItem('BranchID').then(
      keyValue2 => {
        const branchId = keyValue2;
        fetch(`${GLOBALS.PARENT_URL}GetFinancialYear`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <GetFinancialYear xmlns="http://www.m2hinfotech.com//">
                  <branchId>${branchId}</branchId>
                </GetFinancialYear>
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
            const ccc = xmlDoc.getElementsByTagName('GetFinancialYearResult')[0]
              .childNodes[0].nodeValue;
            if (ccc === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(ccc);
              setdata(output);
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

  const navigate = item => {
    AsyncStorage.setItem('FinancialYear', item.FinYearId.toString());
    navigation.navigate('Departments');
  };

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => {
          navigation.navigate('Notifications');
        }}
      />
      <View style={styles.esscontainermiddle}>
        {myIcon}
        <Text style={styles.dashtext}>CHOOSE ACADEMIC YEAR</Text>
      </View>
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No data found!</Text>
          ) : (
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={data}
              renderItem={({item, index}) => (
                <Pressable onPress={() => navigate(item)}>
                  <View style={styles.card}>
                    <Text style={{color: 'white'}}>{item.Description}</Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  esscontainermiddle: {
    height: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    elevation: 10,
    marginBottom: 30,
  },
  containertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  dashtext: {
    justifyContent: 'center',
    fontSize: 18,
    // marginLeft: 25,
    color: 'white',
  },
  card: {
    flex: 1,
    backgroundColor: '#607D8B',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
    marginTop: 15,
    height: 50,
    flexDirection: 'row',
  },
  activityIndicator: {
    marginTop: 5,
  },
});
