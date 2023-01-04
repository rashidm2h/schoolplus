import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const myIcon = <Icon name="source-branch" size={25} color="white" />;
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../config/Globals';

const SwitchBranch = ({navigation}) => {
  const [branchIds, setbranchIds] = useState([]);
  const [dataSource, setdataSource] = useState('');
  useEffect(() => {
    loadBranch();
  }, []);

  const loadBranch = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue2 => {
        const mobile = keyValue2;
        fetch(`${GLOBALS.PARENT_URL}GetBranchDetailes`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
                <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                  <soap12:Body>
                    <GetBranchDetailes xmlns="http://www.m2hinfotech.com//">
                      <mobileNo>${mobile}</mobileNo>
                    </GetBranchDetailes>
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
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const ccc = xmlDoc.getElementsByTagName(
              'GetBranchDetailesResult',
            )[0].childNodes[0].nodeValue;
            if (ccc === 'failure') {
              Alert.alert(
                '',
                '  No Data Available',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
              );
            } else {
              let branchIdArray = [];
              const output = JSON.parse(ccc);
              output.forEach(element => {
                setbranchIds([...branchIds, element.BranchId]);
              });
              setdataSource(output);
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
    try {
      AsyncStorage.setItem('schoolBranchName', item.BranchName);
      AsyncStorage.setItem('BranchID', item.BranchId);
      console.log('item', item.BranchId);
      navigation.navigate('AdminHome');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.esscontainermiddle}>
        {myIcon}
        <Text style={styles.dashtext}>CHOOSE BRANCH</Text>
      </View>

      <FlatList
        data={dataSource}
        renderItem={({item, index}) => (
          <TouchableOpacity onPress={() => navigate(item)}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#607D8B',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                width: '80%',
                marginTop: 15,
                height: 50,
                flexDirection: 'row',
              }}>
              <Text style={{color: 'white'}}>{item.BranchName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SwitchBranch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  esscontainermiddle: {
    height: 95,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    marginBottom: 20,
  },
  containertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  dashtext: {
    justifyContent: 'center',
    fontSize: 18,
    marginLeft: 25,
    color: '#FFFFFF',
  },
});
