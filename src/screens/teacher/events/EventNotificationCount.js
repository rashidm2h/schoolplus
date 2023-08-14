import React, {useState, useEffect} from 'react';
import {DOMParser} from 'xmldom';
import IconBadge from 'react-native-icon-badge';
import {View, Text, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../config/Globals';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const EventNotificationCount = () => {
  const [countevent, setcountevent] = useState('');
  const parser = new DOMParser();

  useEffect(() => {
    countEvent();
  }, []);

  const countEvent = () => {
    AsyncStorage.getItem('StdID').then(
      keyValue => {
        AsyncStorage.getItem('acess_token').then(
          keyValue2 => {
            fetch(`${GLOBALS.PARENT_URL}Getcount`, {
              method: 'POST',
              body: `
                 <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                 <soap12:Body>
                     <Getcount xmlns="http://www.m2hinfotech.com//">
                         <PhoneNo>${keyValue2}</PhoneNo>
                         <studentId>${keyValue}</studentId>
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
                  console.log('Failure');
                } else {
                  const rslt = JSON.parse(result);
                  setcountevent(rslt[0].count);
                  try {
                    AsyncStorage.setItem(
                      'removecountEvent',
                      JSON.stringify(this.state.countevent),
                    );
                  } catch (error) {
                    console.log('somthing went');
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
      },
      error => {
        console.log(error); //Display error
      },
    );
  };

  return (
    <View style={styles.container}>
      <IconBadge
        BadgeElement={<Text style={styles.iconbadgetext}>{countevent}</Text>}
        IconBadgeStyle={styles.iconBadge}
        Hidden
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconbadgetext: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
  },
  iconBadge: {
    elevation: 2,
    width: wp('5.4%'),
    height: wp('5.4%'),
    marginTop: wp('-12%'),
    backgroundColor: '#EA1E63',
  },
});

export default EventNotificationCount;
