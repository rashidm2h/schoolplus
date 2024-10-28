import React, {Component, useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import IconBadge from 'react-native-icon-badge';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';

const NonTeachingNotificationCount = () => {
  const [icon_Count, seticon_Count] = useState('');
  const [notifCount_notview, setnotifCount_notview] = useState('');
  const [phoneNo, setphoneNo] = useState('');
  const [StudentId, setStudentId] = useState('');
  const [BranchID, setBranchID] = useState('');
  React.useEffect(() => {
    notificationCount();
  }, []);

  const count = c => {
    let notifcountViewed = 0;
    AsyncStorage.getItem('NonTeacherNotifCount').then(
      keyValue => {
        const countNotViewed = c;
        AsyncStorage.getItem('NonTeacherNotifRead').then(
          keyValue2 => {
            notifcountViewed = keyValue2;
            const Count = countNotViewed - notifcountViewed;
            seticon_Count(Count);
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
    let noticount;
    let rslt;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('BranchID').then(
          keyValue2 => {
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?opGetNonTStaffsNotes`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
        <GetNonTStaffsNotes xmlns="http://www.m2hinfotech.com//">
          <mobileNo>${keyValue}</mobileNo>
          <BranchID>${keyValue2}</BranchID>
        </GetNonTStaffsNotes>
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
                  'GetNonTStaffsNotesResult',
                )[0].childNodes[0].nodeValue;
                if (v === 'failure') {
                  seticon_Count(0);
                } else {
                  rslt = JSON.parse(v);
                  noticount = rslt.length;
                  try {
                    AsyncStorage.setItem(
                      'NonTeacherNotifCount',
                      JSON.stringify(rslt.length),
                    );
                  } catch (error) {
                    console.log('somthing went');
                  }
                  count(rslt.length);
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

export default NonTeachingNotificationCount;
