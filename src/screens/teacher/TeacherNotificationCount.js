import React, {useState, useEffect} from 'react';
import {DOMParser} from 'xmldom';
import IconBadge from 'react-native-icon-badge';
import {View, Text, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../config/Globals';

const TeacherNotificationCount = () => {
  const [icon_Count, seticon_Count] = useState(0);
  const parser = new DOMParser();

  useEffect(() => {
    notificationCount();
  }, []);

  const notificationCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=Getcount`, {
          method: 'POST',
          body: `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
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
              seticon_Count(0);
            } else {
              const resultParse = JSON.parse(result);
              AsyncStorage.setItem(
                'TeachernotifCount',
                JSON.stringify(resultParse[2].count),
              );
              count();
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

  const count = () => {
    AsyncStorage.getItem('TeachernotifCount').then(
      keyValue => {
        AsyncStorage.getItem('removeteacherNotifCount').then(
          keyValue2 => {
            const Count = keyValue - keyValue2;
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

  return (
    <View style={styles.container}>
      <IconBadge
        BadgeElement={<Text style={styles.iconbadgetext}>{icon_Count}</Text>}
        IconBadgeStyle={styles.iconBadge}
        Hidden={icon_Count === 0 || icon_Count < 0}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconbadgetext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  iconBadge: {
    width: 16,
    height: 16,
    elevation: 2,
    marginTop: -40,
    backgroundColor: '#EA1E63',
  },
});

export default TeacherNotificationCount;
