import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Platform, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Hyperlink from 'react-native-hyperlink';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Loader from '../../components/ProgressIndicator';
import Header from '../../components/Header';
import moment from 'moment';

const Notifications = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  useEffect(() => {
    accessNotification();
  }, []);
  const accessNotification = () => {
    let branch = '';
    AsyncStorage.getItem('BranchID').then(keyValue => {
      branch = keyValue;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const username = keyValue;
        fetch(`${GLOBALS.PARENT_URL}RetrieveAdminSentNoteAsNotification`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <RetrieveAdminSentNoteAsNotification xmlns="http://www.m2hinfotech.com//">
        <MobileNo>${username}</MobileNo>
        <BranchId>${branch}</BranchId>
      </RetrieveAdminSentNoteAsNotification>
    </soap12:Body>
  </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            setloading(false);
            const v = xmlDoc.getElementsByTagName(
              'RetrieveAdminSentNoteAsNotificationResult',
            )[0].childNodes[0].nodeValue;
            if (v === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(v);
              const removeteacherNotifCount = rslt.length;
              AsyncStorage.setItem(
                branch,
                JSON.stringify(removeteacherNotifCount),
              );
              try {
                AsyncStorage.setItem(
                  'AdminNotificationReadCount',
                  JSON.stringify(removeteacherNotifCount),
                );
              } catch (error) {
                console.log('somthing went');
              }
              console.log(rslt);
              setdata(rslt);
            }
          })
          .catch(error => {
            setloading(false);
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
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No notifications found!</Text>
          ) : (
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={data}
              renderItem={({item}) => (
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardtitle}>{item.Title}</Text>

                    <Text style={styles.cardDate}>
                      {moment(item.NotificationDate).format('DD-MM-YYYY')}
                    </Text>
                  </View>
                  <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                    <Text style={styles.cardDesc}>{item.Description}</Text>
                  </Hyperlink>
                  <View style={styles.cardBottomView}>
                    <Text style={styles.cardtextFrom}>Sent to: </Text>
                    <Text style={styles.cardtextFrom2}>{item.Reciever}</Text>
                  </View>
                  <View style={styles.cardBottomView}>
                    <Text style={styles.cardtextFrom}>Sent by: </Text>
                    <Text style={styles.cardtextFrom}>{item.Sender}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default Notifications;

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
  navHeaderLeft: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  navHeaderLeftios: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  navHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navHeaderButton: {
    marginRight: 5,
    height: 25,
    width: 25,
  },
  navHeaderButtonios: {
    marginRight: 5,
    height: 27,
    width: 27,
  },
  icon: {
    width: 10,
    height: 40,
  },
  HeaderText: {
    marginLeft: 25,
    color: '#E6FAFF',
    fontSize: 20,
    fontWeight: '400',
  },
  containerImageText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    flex: 2,
    flexDirection: 'column',
  },
  esscontainertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  card: {
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 3,
    margin: 10,
    alignItems: 'flex-start',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    flex: 1,
    borderColor: '#000000',
  },
  cardtitle: {
    flexWrap: 'wrap',
    flex: 0.8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3ECAD8',
  },
  cardDate: {
    flexWrap: 'wrap',
    flex: 0.25,
    fontSize: 14,
  },
  cardDesc: {
    fontSize: 14,
    padding: 10,
    flexWrap: 'wrap',
  },
  cardBottomView: {
    flexDirection: 'row',
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 2,
  },
  cardtextFrom: {
    fontSize: 14,
    color: 'grey',
  },
  cardtextFrom2: {
    fontSize: 14,
    marginRight: 30,
    color: 'grey',
  },

  Textincontainer: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  containerTab: {
    borderTopColor: '#4D6975',
    borderTopWidth: 1,
    flex: 8,
  },
});
