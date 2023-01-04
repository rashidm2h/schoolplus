import React, {Component, useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconBadge from 'react-native-icon-badge';
import {DOMParser} from 'xmldom';
// import { NavigationEvents } from 'react-navigation';
import GLOBALS from '../../config/Globals';

const TeacherNotificationCount = () => {
  const [icon_Count, seticon_Count] = useState(0);
  const [notifCount_notview, setnotifCount_notview] = useState(0);
  const [phoneNo, setphoneNo] = useState('');

  React.useEffect(() => {
    notificationCount();
  }, []);
  const notificationCount = () => {
    let noticount;
    let rslt;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('BranchID').then(
          keyValue2 => {
            fetch(`${GLOBALS.PARENT_URL}RetrieveAdminSentNoteAsNotification`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
        <RetrieveAdminSentNoteAsNotification xmlns="http://www.m2hinfotech.com//">
          <MobileNo>${keyValue}</MobileNo>
          <BranchId>${keyValue2}</BranchId>
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
                const v = xmlDoc.getElementsByTagName(
                  'RetrieveAdminSentNoteAsNotificationResult',
                )[0].childNodes[0].nodeValue;
                if (v === 'failure') {
                  seticon_Count(0);
                } else {
                  rslt = JSON.parse(v);
                  noticount = rslt.length;
                  try {
                    AsyncStorage.setItem(
                      'AdminNotificationCount',
                      JSON.stringify(rslt.length),
                    );
                  } catch (error) {
                    console.log('somthing went');
                  }
                  Admincount(rslt.length);
                }
              });
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

  const Admincount = c => {
    let notifcountViewed = 0;
    AsyncStorage.getItem('AdminNotificationCount').then(
      keyValue => {
        console.log('notif', keyValue);
        const countNotViewed = keyValue;
        AsyncStorage.getItem('AdminNotificationReadCount').then(
          keyValue2 => {
            // console.log('notifread', keyValue2);
            notifcountViewed = keyValue2;
            const Count = countNotViewed - notifcountViewed;
            seticon_Count(Count);
            console.log('cccc', Count);
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

  return (
    <View style={styles.container}>
      <View style={styles.IconBadgeStyle}>
        <IconBadge
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
    // marginLeft:20,
    backgroundColor: '#EA1E63',
  },
  IconBadgeStyle: {},
});

export default TeacherNotificationCount;
