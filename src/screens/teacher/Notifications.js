import React, {useState, useEffect} from 'react';
import {DOMParser} from 'xmldom';
import Hyperlink from 'react-native-hyperlink';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet, FlatList, Platform, Text, View} from 'react-native';
import GLOBALS from '../../config/Globals';
import Header from '../../components/Header';
import Loader from '../../components/ProgressIndicator';

const Notifications = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const text_from = useState('');
  const [data, setdata] = useState('');
  const parser = new DOMParser();

  useEffect(() => {
    accessNotification();
  }, []);

  const accessNotification = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}RetrieveAllTeacherNotifications`, {
          method: 'POST',
          body: `
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <RetrieveAllTeacherNotifications xmlns="http://www.m2hinfotech.com//">
            <recieverNo>${keyValue}</recieverNo>
          </RetrieveAllTeacherNotifications>
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
            const xmlDoc = parser.parseFromString(response);
            const result = xmlDoc.getElementsByTagName(
              'RetrieveAllTeacherNotificationsResult',
            )[0].childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(result);
              const removeteacherNotifCount = rslt[0].count;
              AsyncStorage.setItem(
                'removeteacherNotifCount',
                JSON.stringify(removeteacherNotifCount),
              );
              setdata(rslt);
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
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      {loading === true ? (
        <Loader />
      ) : (
        <View style={styles.container}>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No notifications found!</Text>
          ) : (
            <View style={styles.containerTab}>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                renderItem={({item}) => (
                  <View style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardtitle}>{item.Title}</Text>
                      <Text style={styles.cardDate}>
                        {item.NotificationDate}
                      </Text>
                    </View>
                    <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                      <Text style={styles.cardDesc}>{item.Description}</Text>
                    </Hyperlink>
                    <View style={styles.cardBottomView}>
                      <Text style={styles.cardtextFrom}>{text_from} </Text>
                      <Text style={styles.cardtextFrom}>{item.FirstName}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
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
  icon: {
    width: 10,
    height: 40,
  },
  card: {
    padding: 3,
    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 1,
    flexGrow: 0.15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
    ...Platform.select({
      android: {
        borderRadius: 4,
      },
      ios: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
      },
    }),
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
    padding: 10,
  },
  cardtextFrom: {
    fontSize: 16,
  },
  containerTab: {
    borderTopColor: '#4D6975',
    elevation: 3,
    borderTopWidth: 1,
    flex: 7,
  },
});

export default Notifications;
