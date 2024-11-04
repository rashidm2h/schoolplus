import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View, BackHandler} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Header from '../../components/DashboardHeader';
import IconBadge from 'react-native-icon-badge';
import {useIsFocused} from '@react-navigation/native';

const NonTeachingDashboard = ({navigation}) => {
  const isFocused = useIsFocused();
  const [EventTCount, seteventTCount] = useState(0);
  const [NoteTCount, setnoteTCount] = useState(0);
  const [CountTEventTotal, setCountTEventTotal] = useState(0);
  const [CountTNoteTotal, setCountTNoteTotal] = useState(0);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack() && isFocused) {  
        BackHandler.exitApp();
        return true; 
      } else {
        
        navigation.goBack();
        return true; 
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isFocused, navigation]);
  useEffect(() => {
    getEventNotificationCount();
    getNoteNotificationCount();
  }, [isFocused]);
  const getEventNotificationCount = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      // branchId = BranchID;

      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          // username = keyValue; //Display key value
          const string = 'new';
          fetch(`http://10.25.25.124:85//EschoolWebService.asmx?op=GetEventDetails`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetNonTStaffsEvents xmlns="http://www.m2hinfotech.com//">
                <mobileNo>${keyValue}</mobileNo>
                <BranchID>${BranchID}</BranchID>
                <status>${string}</status>
              </GetNonTStaffsEvents>
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
                'GetNonTStaffsEventsResult',
              )[0].childNodes[0].nodeValue;
              if (ccc === 'failure') {
                // setdataerror(true);
              } else {
                const rslt = JSON.parse(ccc);
                eventTCount(rslt.length);
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
    });
  };
  const eventTCount = c => {
    let AsynCount = 0;
    let removecount = 0;
    let count;
    AsyncStorage.getItem('removecountEvent').then(
      keyValue2 => {
        removecount = keyValue2;
        AsynCount = c;
        count = AsynCount - removecount;
        if (AsynCount >= removecount) {
          count = AsynCount - removecount;
        } else {
          removecount = 0;
          count = AsynCount - removecount;
        }
        setCountTEventTotal(count);
      },
      error => {
        console.log(error);
      },
    );
  };

  const getNoteNotificationCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=ViewParentNotes`, {
          method: 'POST',
          body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
						<soap12:Body>
	     <ViewParentNotes xmlns="http://www.m2hinfotech.com//">
	       <teacherMobile>${keyValue}</teacherMobile>
	     </ViewParentNotes>
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
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const v = xmlDoc.getElementsByTagName('ViewParentNotesResult')[0]
              .childNodes[0].nodeValue;
            if (v === 'failure') {
              seteventTCount(0);
            } else {
              const rslt = JSON.parse(v);
              setnoteTCount(rslt[0].count);
              noteTCount(rslt[0].count);
              // this.setState({eventTCount: rslt[0].count}, function () {
              //   this.noteTCount();
              //   this.eventTCount();
              // });
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
  const noteTCount = c => {
    let AsynCount;
    let removecount;
    let count;
    AsyncStorage.getItem('removeTeacherNoteCount').then(
      keyValue2 => {
        removecount = keyValue2;
        AsynCount = c;
        if (AsynCount >= removecount) {
          count = AsynCount - removecount;
          setCountTNoteTotal(count);
          // this.setState({CountTNoteTotal: count});
        } else {
          removecount = 0;
          count = AsynCount - removecount;
          setCountTNoteTotal(count);
        }
      },
      error => {
        console.log(error);
      },
    );
  };
  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('NonTeachingDashboard')}
        bellPress={() => {
          navigation.navigate('Notifications');
        }}
        swapPress={page => {
          navigation.navigate(page);
        }}
      />

      <Pressable
        style={[styles.box, {backgroundColor: '#FEC107'}]}
        onPress={() => {
          navigation.navigate('Events');
        }}>
        <IconBadge
          MainElement={
            <View style={styles.imagetextcenter}>
              <Icon name="calendar" size={34} color="white" />
              <Text style={styles.title}>EVENTS</Text>
            </View>
          }
          BadgeElement={
            <Text style={styles.iconbadgetext}>{CountTEventTotal}</Text>
          }
          IconBadgeStyle={styles.iconBadge}
          Hidden={CountTEventTotal === 0 || CountTEventTotal < 0}
        />
        {/* <Icon name="calendar" size={30} color="white" />
        <Text style={styles.title}>EVENTS</Text> */}
      </Pressable>
      <Pressable
        style={[styles.box, {backgroundColor: '#4CB050'}]}
        onPress={() => {
          navigation.navigate('Notes');
        }}>
        <IconBadge
          MainElement={
            <View style={[styles.imagetextcenter, {width: 107}]}>
              <Icon name="message-processing-outline" size={34} color="white" />
              <Text style={styles.title}>NOTES</Text>
            </View>
          }
          BadgeElement={
            <Text style={styles.iconbadgetext}>{CountTNoteTotal}</Text>
          }
          IconBadgeStyle={styles.iconBadge}
          Hidden={CountTNoteTotal === 0 || CountTNoteTotal < 0}
        />
        {/* <Icon name="checkbox-marked-circle-outline" size={30} color="white" />
        <Text style={styles.title}>NOTES</Text> */}
      </Pressable>
    </View>
  );
};

export default NonTeachingDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  box: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '30%',
    paddingLeft: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  lastBox: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  smallBox: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    paddingLeft: 20,
    alignItems: 'center',
  },
  iconbadgetext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  iconBadge: {
    marginLeft: 20,
    width: 20,
    height: 20,
    backgroundColor: '#EA1E63',
  },
  imagetextcenter: {
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 115,
    height: 30,
  },
});
