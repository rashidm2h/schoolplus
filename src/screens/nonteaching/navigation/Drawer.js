import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import DrawerItem from '../../../components/DrawerItem';
import GLOBALS from '../../../config/Globals';

const Drawer = ({navigation}) => {
  const [fullName, setfullName] = useState('');
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      AsyncStorage.getItem('acess_token').then(keyValue => {
        fetch(`${GLOBALS.PARENT_URL}GetNonTStaffsDetails`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetNonTStaffsDetails xmlns="http://www.m2hinfotech.com//">
                <senderNo>${keyValue}</senderNo>
                <branchId>${branchId}</branchId>
              </GetNonTStaffsDetails>
            </soap12:Body>
          </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName(
              'GetNonTStaffsDetailsResult',
            )[0].childNodes[0].nodeValue;
            if (v === 'failure') {
              console.log('failure');
            } else {
              const rslt = JSON.parse(v);
              let SubName = rslt[0].Occupation;
              if (SubName === null) {
                SubName = 'None';
              }
              let ClassName = rslt[0].Class;
              if (ClassName === null) {
                ClassName = 'None';
              }
              setfullName(rslt[0].Name);
            }
          })
          .catch(error => {
            console.log(error);
          });
      });
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{`${fullName}`}</Text>
      </View>
      <DrawerItem
        onPress={() => {
          navigation.navigate('Events');
        }}
        text="EVENTS"
        icon="calendar"
      />
      <DrawerItem
        onPress={() => {
          navigation.navigate('Notes');
        }}
        text="NOTES"
        icon="message-processing-outline"
      />
    </View>
  );
};

export default Drawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13C0CE',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#607D8B',
    height: hp('25%'),
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  class: {
    color: 'white',
    fontSize: 16,
  },
});
