import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  FlatList,
  View,
  Platform,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
// import IOSPicker from '@react-native-ios-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-element-dropdown';
const myIcon = <Icon name="download" size={25} color="white" />;

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const Attendance = () => {
  const [selectedMonth, setselectedMonth] = useState(
    (new Date().getMonth() + 1).toString(),
  );
  const [selectedYear, setselectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [data, setdata] = useState('');
  useEffect(() => {
    attendenceList();
  }, []);
  const attendenceList = () => {
    AsyncStorage.getItem('StdID').then(
      keyValue => {
        const Stdid = keyValue;
        fetch(`${GLOBALS.PARENT_SERVICE}RetrieveStdAttDetails`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
 <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<RetrieveStdAttDetails xmlns="http://www.m2hinfotech.com//">
<Month>${selectedMonth}</Month>
<Year>${selectedYear}</Year>
<studentId>${Stdid}</studentId>
</RetrieveStdAttDetails>
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
            const v = xmlDoc.getElementsByTagName(
              'RetrieveStdAttDetailsResult',
            )[0].childNodes[0].nodeValue;
            if (v === 'failure') {
              setdata('');
            } else {
              const rslt = JSON.parse(v);
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
      <View style={styles.topView}>
        <View style={styles.pickerView}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue, itemIndex) =>
              setselectedMonth(itemValue)
            }>
            <Picker.Item label="January" value="1" />
            <Picker.Item label="February" value="2" />
            <Picker.Item label="March" value="3" />
            <Picker.Item label="April" value="4" />
            <Picker.Item label="May" value="5" />
            <Picker.Item label="June" value="6" />
            <Picker.Item label="July" value="7" />
            <Picker.Item label="August" value="8" />
            <Picker.Item label="September" value="9" />
            <Picker.Item label="October" value="10" />
            <Picker.Item label="November" value="11" />
            <Picker.Item label="December" value="12" />
          </Picker>
        </View>
        <View style={styles.pickerView}>
          <Picker
            style={styles.picker}
            selectedValue={selectedYear}
            onValueChange={(itemValue, itemIndex) =>
              setselectedYear(itemValue)
            }>
            <Picker.Item
              label={new Date().getFullYear().toString()}
              value={new Date().getFullYear().toString()}
            />
            <Picker.Item
              label={(new Date().getFullYear() - 1).toString()}
              value={(new Date().getFullYear() - 1).toString()}
            />
          </Picker>
        </View>
        <Pressable style={styles.button} onPress={() => attendenceList()}>
          {myIcon}
        </Pressable>
      </View>
      <View style={styles.headerView}>
        <View style={styles.section}>
          <Text style={styles.headerText}>DATE</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.headerText}>STATUS</Text>
        </View>
      </View>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={data}
        renderItem={({item}) => (
          <View style={styles.P_SD_Bottom_Flatlist}>
            {item.STATUS === 'A' ||
            item.STATUS === 'A-AN' ||
            item.STATUS === 'A-FN' ? (
              <View style={styles.P_SD_Bottom_FlatlistRowLeftRed}>
                <Text>{item.DATE}</Text>
              </View>
            ) : (
              <View style={styles.P_SD_Bottom_FlatlistRowLeft}>
                <Text>{item.DATE}</Text>
              </View>
            )}
            {item.STATUS === 'A' ||
            item.STATUS === 'A-AN' ||
            item.STATUS === 'A-FN' ? (
              <View style={styles.P_SD_Bottom_FlatlistRowRightRed}>
                <Text>{item.STATUS}</Text>
              </View>
            ) : (
              <View style={styles.P_SD_Bottom_FlatlistRowRight}>
                <Text>{item.STATUS}</Text>
              </View>
            )}
          </View>
        )}

        // renderItem={({item}) => (
        //   <View style={{flexDirection: 'row'}}>
        //     <View style={styles.flatsection}>
        //       <Text>{item.DATE}</Text>
        //     </View>
        //     <View style={styles.flatsection}>
        //       <Text>{item.STATUS}</Text>
        //     </View>
        //   </View>
        // )}
      />
    </View>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topView: {
    flexDirection: 'row',
  },
  pickerView: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 10,
    width: '35%',
    height: 40,
    justifyContent: 'center',
  },
  P_SD_Bottom_Flatlist: {
    flex: 1,
    flexGrow: 0.65,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  P_SD_Bottom_FlatlistRowLeftRed: {
    flex: 1,
    flexGrow: 0.5,
    height: 40,
    alignItems: 'center',
    backgroundColor: '#DD2C00',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 1,
    borderColor: '#C5C5C5',
  },
  P_SD_Bottom_FlatlistRowLeft: {
    flex: 1,
    flexGrow: 0.5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 1,
    borderColor: '#C5C5C5',
  },
  P_SD_Bottom_FlatlistRowRightRed: {
    flex: 1,
    flexGrow: 0.5,
    height: 40,
    alignItems: 'center',
    backgroundColor: '#DD2C00',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderColor: '#C5C5C5',
  },
  P_SD_Bottom_FlatlistRowRight: {
    flex: 1,
    flexGrow: 0.5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderLeftWidth: 0.5,
    borderColor: '#C5C5C5',
  },
  button: {
    margin: 10,
    height: 40,
    justifyContent: 'center',
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#607D8B',
    width: '15%',
  },
  headerView: {
    flexDirection: 'row',
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AF67BD',
  },
  section: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: 'white',
  },
  flatsection: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  headerText: {
    color: 'white',
    textAlign: 'center',
  },
});
