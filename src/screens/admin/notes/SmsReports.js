import React, {useState} from 'react';
import {
  Text,
  View,
  Platform,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import {DOMParser} from 'xmldom';
import Hyperlink from 'react-native-hyperlink';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const SmsReports = () => {
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  const [fromDateVisible, setfromDateVisible] = useState(false);
  const [toDateVisible, settoDateVisible] = useState(false);
  const [dropdownSource] = useState([
    {
      label: 'Attendance',
      value: 'Attendance',
    },
    {label: 'Event', value: 'Event'},
    {label: 'Notes', value: 'Notes'},
  ]);
  const [dropdownValue, setdropdownValue] = useState('Attendance');
  const [dropdownSource1] = useState([
    {
      label: 'Teachers',
      value: 'ROL_005',
    },
    {label: 'Parents', value: 'ROL_004'},
  ]);
  const [dropdownValue1, setdropdownValue1] = useState('ROL_005');
  const [fromDate, setfromDate] = useState('');
  const [toDate, settoDate] = useState('');
  const [fromDateSend, setfromDateSend] = useState('');
  const [toDateSend, settoDateSend] = useState('');

  const NoteAccess = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      () => {
        fetch(`${GLOBALS.PARENT_URL}SmsReport`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <SmsReport xmlns="http://www.m2hinfotech.com//">
                <branchId>${branchId}</branchId>
                <type>${dropdownValue}</type>
                <reciever>${dropdownValue1}</reciever>
                <fromDate>${fromDateSend}</fromDate>
                <toDate>${toDateSend}</toDate>
              </SmsReport>
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
            const v =
              xmlDoc.getElementsByTagName('SmsReportResult')[0].childNodes[0]
                .nodeValue;
            if (v === 'failure') {
              setdata('');
              setdataerror(true);
            } else {
              const rslt = JSON.parse(v);
              setdata(rslt);
              setdataerror(false);
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

  const onDatePickedFunction = date => {
    setfromDate(moment(date).format('DD-MM-YYYY'));
    setfromDateSend(moment(date).format('MM-DD-YYYY'));
  };

  const onDatePickedFunction2 = date => {
    settoDate(moment(date).format('DD-MM-YYYY'));
    settoDateSend(moment(date).format('MM-DD-YYYY'));
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Type:</Text>

            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdownSource}
              value={dropdownValue}
              onChangeText={value => {
                setdropdownValue(value);
              }}
            />
          </View>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>Receiver:</Text>
            <Dropdown
              icon="chevron-down"
              baseColor="transparent"
              underlineColor="transparent"
              containerStyle={styles.pickerStyle}
              data={dropdownSource1}
              value={dropdownValue1}
              onChangeText={value => {
                setdropdownValue1(value);
              }}
            />
          </View>
        </View>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>From date:</Text>
            <View style={styles.pickerStyle}>
              <Pressable onPress={() => setfromDateVisible(true)}>
                <View style={styles.datePicker}>
                  <Text style={styles.datePickerText}>{fromDate}</Text>
                </View>
              </Pressable>
              <DateTimePickerModal
                isVisible={fromDateVisible}
                mode="date"
                onCancel={() => setfromDateVisible(false)}
                onConfirm={date => onDatePickedFunction(date)}
              />
            </View>
          </View>
          <View style={styles.verticalView}>
            <Text style={styles.textStyle1}>To date:</Text>
            <View style={styles.pickerStyle}>
              <Pressable onPress={() => settoDateVisible(true)}>
                <View style={styles.datePicker}>
                  <Text style={styles.datePickerText}>{toDate}</Text>
                </View>
              </Pressable>
              <DateTimePickerModal
                isVisible={toDateVisible}
                mode="date"
                onCancel={() => settoDateVisible(false)}
                onConfirm={date => onDatePickedFunction2(date)}
              />
            </View>
          </View>
        </View>
        <View style={styles.horizontalView}>
          <View style={styles.verticalView}>
            <Text style={styles.hideText}>{''}</Text>
            <View style={styles.button}>
              <Pressable onPress={() => NoteAccess()}>
                <Text style={styles.buttonText}>SUBMIT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      {dataerror ? (
        <Text style={styles.noReports}>No reports found!</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={styles.cardin}>
                <View style={styles.cardtitleView}>
                  <Text style={styles.cardtitle}>{item.FatherMobNo} </Text>
                </View>
                <View style={styles.cardDateView}>
                  <Text style={styles.carddate}> {item.CreatedDate} </Text>
                </View>
              </View>
              <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                <Text style={styles.carddesc}>{item.MessageText}</Text>
              </Hyperlink>
              <View style={styles.cardinrow}>
                <Text style={styles.cardintext}>{item.Status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default SmsReports;

const styles = StyleSheet.create({
  noReports: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  card: {
    padding: 3,
    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 2,
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
  cardin: {
    flexDirection: 'row',
    padding: 5,
    flex: 1,
  },
  cardinrow: {
    flexDirection: 'row',
    flex: 1,
    padding: 5,
  },
  cardtitleView: {
    flexGrow: 0.85,
    alignItems: 'flex-start',
  },
  cardDateView: {
    flexGrow: 0.25,
    alignItems: 'flex-end',
  },
  cardintext: {
    fontSize: 16,
  },
  cardtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  carddate: {
    fontSize: 16,
  },
  carddesc: {
    fontSize: 14,
    padding: 5,
    flexWrap: 'wrap',
  },
  pickerview: {
    ...Platform.select({
      ios: {
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
      },
      android: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        flexDirection: 'row',
        flex: 1,
        borderWidth: 0.5,
        borderRadius: 4,
        borderColor: '#000000',
      },
    }),
  },
  downarrow: {
    flex: 0.5,
    borderRadius: 3,
    elevation: 5,
    height: 35,
    width: 45,
    backgroundColor: '#13C0CE',
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    marginTop: 5,
    color: 'red',
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  pickerView: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
      ios: {
        flex: 1,
        marginRight: 10,
      },
    }),
  },
  pickerStyle: {
    ...Platform.select({
      android: {
        paddingTop: wp('4%'),
        borderWidth: wp('0.3%'),
        borderColor: 'grey',
        height: wp('10.3%'),
        justifyContent: 'center',
        borderRadius: wp('0.3%'),
        marginLeft: wp('1.5%'),
        marginRight: wp('1.5%'),
        paddingLeft: wp('0.3%'),
        marginBottom: wp('1.5%'),
      },
      ios: {
        borderWidth: 0.5,
        paddingTop: 10,
        paddingLeft: 5,
        borderColor: 'grey',
        height: 30,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
    }),
  },
  textStyle1: {
    marginLeft: wp('2%'),
    marginBottom: wp('2%'),
  },
  button: {
    height: 35,
    width: '50%',
    marginTop: -20,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#17BED0',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hideText: {
    marginLeft: 5,
    marginBottom: 5,
    color: 'black',
  },
  datePicker: {
    height: wp('11%'),
    justifyContent: 'center',
    borderRadius: wp('1.3%'),
    marginLeft: wp('1.3%'),
    marginRight: wp('1.3%'),
  },
});
