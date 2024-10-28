import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';
import Header from '../../../components/Header';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const Teachers2 = ({route, navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [gender, setgender] = useState('');
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [address, setaddress] = useState('');
  const [dob, setdob] = useState('');
  const [qualification, setqualification] = useState('');
  const [experience, setexperience] = useState('');
  const [email, setemail] = useState('');
  const [mobile, setmobile] = useState('');
  useEffect(() => {
    accessData();
  }, []);

  const accessData = () => {
    AsyncStorage.getItem('BranchID').then(
      keyValue => {
        let value = route.params.itemId.toString();
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=GetNonTeachStaffsDetails`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetNonTeachStaffsDetails xmlns="http://www.m2hinfotech.com//">
                <staffId>${value}</staffId>
              </GetNonTeachStaffsDetails>
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
            setloading(false);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName(
              'GetNonTeachStaffsDetailsResult',
            )[0].childNodes[0].nodeValue;
            console.log(v);
            if (v === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(v);
              setemail(rslt[0].Email);
              setmobile(rslt[0].PhoneNo);
              setexperience(rslt[0].Experience);
              setqualification(rslt[0].Qualification);
              setaddress(rslt[0].Address);
              setdob(rslt[0].DOB);
              setgender(rslt[0].Gender);
              setlastName(rslt[0].LastName);
              setfirstName(rslt[0].FirstName);
            }
          })
          .catch(error => {
            console.log(error);
          }); //Display key value
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No data found!</Text>
          ) : (
            <>
              <Header
                homePress={() => navigation.navigate('AdminDashboard')}
                bellPress={() => navigation.navigate('Notifications')}
              />
              <View style={styles.P_SD_top}>
                <View style={styles.P_SD_top_Row}>
                  <View style={styles.P_SD_Top_TextColumn}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={{color: '#1E4341', fontSize: 20}}>
                        {`${firstName} ${lastName}`}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text>Gender: </Text>
                      <Text>{gender}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text>Mobile: </Text>
                      <Text>{mobile}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.P_SD_BottomScroll}>
                <View style={styles.P_SD_Bottom}>
                  <View style={styles.P_SD_BottomRow}>
                    <Text style={styles.textbold}>Address:</Text>
                    <Text style={styles.textLight}>{address}</Text>
                  </View>
                  <View style={styles.P_SD_BottomRow}>
                    <Text style={styles.textbold}>DOB:</Text>
                    <Text style={styles.textLight}>{dob}</Text>
                  </View>
                  <View style={styles.P_SD_BottomRow}>
                    <Text style={styles.textbold}>Qualification:</Text>
                    <Text style={styles.textLight}>{qualification}</Text>
                  </View>
                  <View style={styles.P_SD_BottomRow}>
                    <Text style={styles.textbold}>Experience:</Text>
                    <Text style={styles.textLight}>{experience}</Text>
                  </View>
                  <View style={[styles.P_SD_BottomRow, {marginBottom: 40}]}>
                    <Text style={styles.textbold}>Email:</Text>
                    <Text style={styles.textLight}>{email}</Text>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default Teachers2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabheadingTextcolor: {
    color: '#FFFFFF',
  },
  noDataView: {
    marginTop: wp('22%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('5%'),
  },
  progressBar: {
    flex: 1,
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
  },
  flatlistStyle: {
    marginLeft: 15,
    marginRight: 15,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  P_SD_top: {
    backgroundColor: '#E0E0E0',
    flexGrow: 0.05,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 4,
    shadowOpacity: 0.5,
  },
  P_SD_top_Row: {
    margin: wp('1.5%'),
    marginLeft: wp('5%'),
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
  },
  P_SD_Top_image: {
    height: wp('22%'),
    width: wp('22%'),
    borderRadius: 80 / 2,
  },
  P_SD_Top_TextColumn: {
    justifyContent: 'flex-end',
    marginLeft: wp('1.5%'),
    flexDirection: 'column',
  },
  P_SD_PD_container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  P_SD_Bottom: {
    marginLeft: wp('3.5%'),
    flexGrow: 0.95,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  P_SD_BottomScroll: {
    flexGrow: 0.95,
    backgroundColor: '#FFFFFF',
  },
  P_SD_BottomRow: {
    padding: wp('1.5%'),
    margin: wp('1.5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  P_SD_Bottom0: {
    flexDirection: 'column',
    margin: wp('3.5%'),
    flex: 0.5,
  },
  P_SD_Bottom1: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: wp('3.5%'),
    flexGrow: 0.5,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#23B6CA',
    borderBottomWidth: wp('1%'),
  },
  P_SD_Bottom2: {
    flexDirection: 'column',
    margin: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexGrow: 0.5,
    backgroundColor: '#FFFFFF',
  },
  dwnld: {
    borderRadius: 3,
    elevation: 5,
    height: 35,
    width: 45,
    backgroundColor: '#5F7D8B',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  P_SD_PickerView: {
    flexDirection: 'row',
    margin: 10,
    flex: 1,
    flexGrow: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#fbc531',
  },
  pickerArea: {
    flexDirection: 'row',
  },
  pickerStyleout: {
    margin: 5,
    ...Platform.select({
      android: {
        height: 35,
        borderWidth: 1,
      },
    }),

    borderColor: '#C7C7C7',
    flex: 0.5,
    borderRadius: 3,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    //  backgroundColor: '#9c88ff',
  },
  pickerStyle: {
    ...Platform.select({
      ios: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 40,
      },
      android: {
        height: 35,
      },
    }),

    //
    justifyContent: 'center',
    borderRadius: 3,
    marginLeft: 5,
    marginRight: 5,
  },
  P_SD_Top_attendence: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0.2,
    //  backgroundColor: '#9c88ff',
  },
  P_SD_Bottom_Attendence: {
    flex: 1,
    flexGrow: 0.8,
    flexDirection: 'column',
  },
  P_SD_Bottom_Row: {
    flexDirection: 'row',
  },
  P_SD_Bottom_Attendencebox: {
    elevation: 3,
    flex: 0.5,
    height: 40,
    backgroundColor: '#AF67BD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#EDE7EA',
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
  text_white: {
    color: '#F5F5F5',
    fontSize: 15,
  },
  textbold: {
    color: '#000000',
    flex: 0.45,
    fontWeight: 'bold',
    fontSize: wp('4%'),
  },
  textLight: {
    flex: 0.55,
    fontSize: wp('4%'),
    fontWeight: '100',
  },
});
