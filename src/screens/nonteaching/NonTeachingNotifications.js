import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Platform, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Hyperlink from 'react-native-hyperlink';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Loader from '../../components/ProgressIndicator';
import Header from '../../components/Header';

const NonTeachingNotifications = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  const [text_from, settext_from] = useState('');
  let studentID = '';
  useEffect(() => {
    accessNotification();
  }, []);

  const accessNotification = () => {
    console.log('qqqqqq');
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const phno = keyValue;
        AsyncStorage.getItem('BranchID').then(keyValue2 => {
          const BranchID = keyValue2;
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetNonTStaffsNotes`, {
            method: 'POST',
            body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
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
              setloading(false);
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response);
              const v = xmlDoc.getElementsByTagName(
                'GetNonTStaffsNotesResult',
              )[0].childNodes[0].nodeValue;
              console.log('nts', v);
              if (v === 'failure') {
                setdataerror(true);
              } else {
                const rslt = JSON.parse(v);
                console.log('notification', rslt);
                try {
                  AsyncStorage.setItem(
                    'NonTeacherNotifRead',
                    JSON.stringify(rslt.length),
                  );
                } catch (error) {
                  console.log('somthing went');
                }
                setdata(rslt);
              }
            })
            .catch(error => {});
        });
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      {loading ? (
        <Loader />
      ) : (
        <View style={{flex: 1}}>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No notifications found!</Text>
          ) : (
            <View style={styles.containerTab}>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                renderItem={({item}) => (
                  <View style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardtitle}>{item.Title}</Text>
                      <Text style={styles.cardDate}>
                        {item.NotificationDate}
                      </Text>
                    </View>
                    <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                      <Text style={styles.cardDesc}>{item.Description}</Text>
                    </Hyperlink>
                    <View style={styles.cardBottomView}>
                      <Text style={styles.cardtextFrom}>{text_from} </Text>
                      <Text style={styles.cardtextFrom}>{item.FirstName}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeaderLeft: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  navHeaderLeftios: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  navHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navHeaderButton: {
    marginRight: 5,
    height: 25,
    width: 25,
  },
  navHeaderButtonios: {
    marginRight: 5,
    height: 27,
    width: 27,
  },
  iconBadge: {
    width: 20,
    height: 20,
    backgroundColor: '#EA1E63',
  },
  iconbadgetext: {
    color: '#FFFFFF',
  },
  IconBadgeStyle: {
    height: 30,
    width: 30,
  },
  icon: {
    width: 10,
    height: 40,
  },
  HeaderText: {
    marginLeft: 25,
    color: '#E6FAFF',
    fontSize: 20,
    fontWeight: '400',
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
  esscontainertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  noDataView: {
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  containerImageText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    flex: 2,
    flexDirection: 'column',
  },
  card: {
    padding: 3,

    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 1,
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    flex: 1,
    borderColor: '#000000',
  },
  cardtitle: {
    flexWrap: 'wrap',
    flex: 0.8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3ECAD8',
  },
  cardDate: {
    flexWrap: 'wrap',
    flex: 0.25,
    fontSize: 14,
  },
  cardDesc: {
    fontSize: 14,
    padding: 10,
    flexWrap: 'wrap',
  },
  cardBottomView: {
    flexDirection: 'row',
    flex: 1,
    padding: 10,
  },

  Textincontainer: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  cardtextFrom: {
    fontSize: 16,
  },
  containerTab: {
    borderTopColor: '#4D6975',
    elevation: 3,
    borderTopWidth: 1,
    flex: 7,
  },
});

export default NonTeachingNotifications;
