import React, {Component, useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconBadge from 'react-native-icon-badge';
import {DOMParser} from 'xmldom';
// import { NavigationEvents } from 'react-navigation';
import GLOBALS from '../../../config/Globals';

const ParentNotificationCount = () => {
  const [icon_Count, seticon_Count] = useState(0);
  const [notifCount_notview, setnotifCount_notview] = useState(0);
  const [phoneNo, setphoneNo] = useState('');
  const [StudentId, setStudentId] = useState('');

  useEffect(() => {
    notificationCount();
  }, []);

  const count = () => {
    let notifcountViewed = 0;
    AsyncStorage.getItem('notifCount').then(
      keyValue => {
        const countNotViewed = keyValue;
        AsyncStorage.getItem('removeNotificationCount').then(
          keyValue2 => {
            notifcountViewed = keyValue2;
            const count = countNotViewed - notifcountViewed;
            seticon_Count(count);
          },
          error => {
            console.log(error);
          },
        );
      },
      error => {
        console.log(error);
      },
    );
  };

  const notificationCount = () => {
    let v;
    let noticount;
    let rslt;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        setphoneNo(keyValue);
        AsyncStorage.getItem('StdID').then(
          keyValue2 => {
            setStudentId(keyValue2);
          },
          error => {
            console.log(error); //Display error
          },
        ); 
        fetch(`${GLOBALS.PARENT_SERVICE}Getcount`, {
          method: 'POST',
          body: `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <Getcount xmlns="http://www.m2hinfotech.com//">
      <PhoneNo>${keyValue}</PhoneNo>
      <studentId>${StudentId}</studentId>
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
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v =
              xmlDoc.getElementsByTagName('GetcountResult')[0].childNodes[0]
                .nodeValue;
            if (v === 'failure') {
              setnotifCount_notview(0);
            } else {
              rslt = JSON.parse(v);
              noticount = rslt[2].count;
              try {
                AsyncStorage.setItem('notifCount', JSON.stringify(noticount));
              } catch (error) {
                console.log('somthing went');
              }
              setnotifCount_notview(noticount);
              count();
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
      {/* <NavigationEvents
  onWillFocus={payload => notificationCount()}
/> */}
      <View style={styles.IconBadgeStyle}>
        <IconBadge
          // MainElement={
          //     <Image
          //         style={styles.navHeaderButton}
          //         source={require('../images/notificationicon.png')}
          //     />
          // }
          BadgeElement={<Text style={styles.iconbadgetext}>{icon_Count}</Text>}
          IconBadgeStyle={styles.iconBadge}
          Hidden={icon_Count === 0 || icon_Count < 0}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeaderButton: {
    marginRight: 5,
    height: 25,
    width: 25,
  },
  iconbadgetext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  iconBadge: {
    elevation: 2,
    width: 16,
    height: 16,
    marginTop: -40,
    backgroundColor: '#EA1E63',
  },
  IconBadgeStyle: {},
});
export default ParentNotificationCount;
