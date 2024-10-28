import React, {useEffect, useState} from 'react';
import {DOMParser} from 'xmldom';
import IconBadge from 'react-native-icon-badge';
import {useIsFocused} from '@react-navigation/native';
import {BackHandler, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../config/Globals';
import Header from '../../components/DashboardHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const TeacherDashboard = ({navigation}) => {
  const isFocused = useIsFocused();
  const [domainName, setdomainName] = useState('');
  const [CountTEventTotal, setCountTEventTotal] = useState(0);
  const [CountTNoteTotal, setCountTNoteTotal] = useState(0);
  const parser = new DOMParser();
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
    getNoteCount();
    AsyncStorage.getItem('domain').then(
      keyValue => {
        setdomainName(keyValue);
      },
      error => {
        console.log(error);
      },
    );
  }, [isFocused]);

  const buttonpress = () => {
     removeNotification();
      navigation.navigate('TeacherNotes');
  };

  const getEventNotificationCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=Getcount`, {
          method: 'POST',
          body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
						<soap12:Body>
	     <Getcount xmlns="http://www.m2hinfotech.com//">
	       <PhoneNo>${keyValue}</PhoneNo>
	     </Getcount>
	   </soap12:Body>
	 </soap12:Envelope>`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/xml; charset=utf-8',
          },
        })
          .then(response => response.text())
          .then(response => {
            const xmlDoc = parser.parseFromString(response);
            const result =
              xmlDoc.getElementsByTagName('GetcountResult')[0].childNodes[0]
                .nodeValue;
            if (result !== 'failure') {
              const rslt = JSON.parse(result);
              eventTCount(rslt[0].count);
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

  const eventTCount = result => {
    AsyncStorage.getItem('removeTeacherEventCount').then(
      keyValue2 => {
        setCountTEventTotal(result >= keyValue2 ? result - keyValue2 : result);
      },
      error => {
        console.log(error);
      },
    );
  };

  // const noteTCount = result => {
  //   AsyncStorage.getItem('removeTeacherNoteCount').then(
  //     keyValue2 => {
  //       setCountTNoteTotal(result >= keyValue2 ? result - keyValue2 : result);
  //     },
  //     error => {
  //       console.log(error);
  //     },
  //   );
  // };

  const getNoteCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
      //   console.log(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=ViewParentNotes`, `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      //     <soap12:Body>
      //  <ViewParentNotes xmlns="http://www.m2hinfotech.com//">
      //  <teacherMobile>${keyValue}</teacherMobile>
      //  </ViewParentNotes>
      //  </soap12:Body>
      //  </soap12:Envelope>
      //  `)
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
            const xmlDoc = parser.parseFromString(response);
            const result = xmlDoc.getElementsByTagName(
              'ViewParentNotesResult',
            )[0].childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            }
            else{
              const rslt = JSON.parse(result);
              setCountTNoteTotal(rslt.Table[0].count);
           
            try {
              const notificationIds = rslt.Table.map(notification => notification.NotificationId);
              // console.log("Notification IDs.................:", notificationIds);
              AsyncStorage.setItem('notificationIdsteach', JSON.stringify(notificationIds))
              // AsyncStorage.setItem('NoteCount', JSON.stringify(notecount));
            } catch (error) {
              console.log('somthing went wrong');
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
  };
  const removeNotification = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('notificationIdsteach')
        .then(
          keyValue2 => {
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=UpdateNotescount`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
              <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                  <UpdateNotescount xmlns="http://www.m2hinfotech.com//">
                    <PhoneNo>${keyValue}</PhoneNo>
                    <Status>${1}</Status>
                    <NotificationId>${keyValue2}</NotificationId>
                  </UpdateNotescount>
                </soap12:Body>
              </soap12:Envelope>`,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'text/xml; charset=utf-8',
              },
            })
              .then(response => response.text())
              .then(() => {
                getNoteCount(); 
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
      console.log(error);
    },
  );
};


  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => {
          navigation.navigate('TeacherNotifications');
        }}
        swapPress={page => {
          navigation.navigate(page);
        }}
      />
      <Pressable
        style={[styles.box, {backgroundColor: '#FEC107'}]}
        onPress={() => {
          navigation.navigate('TeacherStudentDetails');
        }}>
        <Icon name="school" size={34} color="white" />
        <Text style={styles.title}>STUDENT DETAILS</Text>
      </Pressable>
      <Pressable
        style={[styles.box, {backgroundColor: '#3c914b'}]}
        onPress={() => {
          navigation.navigate('TeacherAttendance');
        }}>
        <Icon name="checkbox-marked-circle-outline" size={34} color="white" />

        <Text style={styles.title}>ATTENDANCE</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('TeacherTimeTable');
        }}
        style={[styles.box, {backgroundColor: '#EA1E63'}]}>
        <Icon name="calendar-range-outline" size={34} color="white" />

        <Text style={styles.title}>TIME TABLE</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('TeacherExam');
        }}
        style={[styles.box, {backgroundColor: '#673BB7'}]}>
        <Icon name="file-document" size={34} color="white" />

        <Text style={styles.title}>EXAM</Text>
      </Pressable>
      {/* {domainName !== 'avk.schoolplusapp.com' ? (
        <Pressable
          style={[styles.box, {backgroundColor: '#DD2C00'}]}
          onPress={() => {
            navigation.navigate('TeacherFee');
          }}>
          <Icon name="currency-usd" size={34} color="white" />

          <Text style={styles.title}>FEES MANAGEMENT</Text>
        </Pressable>
      ) : null} */}

      {/* <View style={styles.lastBox}> */}
        <Pressable
          onPress={() => {
            navigation.navigate('TeacherEvents');
          }}
          style={[styles.box, {backgroundColor: '#8CC447'}]}>
                <Icon name="calendar" size={34} color="white" />
                <Text style={styles.title}>EVENTS</Text>

          <IconBadge
            BadgeElement={
              <Text style={styles.iconbadgetext}>{CountTEventTotal}</Text>
            }
            IconBadgeStyle={styles.iconBadge}
            Hidden={CountTEventTotal === 0 || CountTEventTotal < 0}
          />
        </Pressable>
        <Pressable
          onPress={buttonpress}
          style={[styles.box, {backgroundColor: '#607D8B'}]}>
                <Icon
                  name="message-processing-outline"
                  size={34}
                  color="white"
                />
                <Text style={styles.title}>NOTES</Text>
          <IconBadge
            BadgeElement={
              <Text style={styles.iconbadgetext}>{CountTNoteTotal}</Text>
            }
            IconBadgeStyle={styles.iconBadge}
            Hidden={CountTNoteTotal === 0 || CountTNoteTotal < 0}
          />
        </Pressable>
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  box: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    paddingLeft: hp('3%'),
  },
  title: {
    color: 'white',
    fontSize: wp('5%'),
    marginLeft: wp('1.5%'),
  },
  lastBox: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  smallBox: {
    flex: 1,
    flexDirection: 'row',
    height: hp('16%'),
    paddingLeft: hp('0.7%'),
    alignItems: 'center',
  },
  iconbadgetext: {
    fontSize: wp('5%'),
    color: '#FFFFFF',
  },
  iconBadge: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: 50,
    backgroundColor: '#EA1E63',
    top:-wp('8%'),
    left:wp('1%')
  },
  imagetextcenter: {
    margin: hp('2.7%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: wp('100%'),
    height: wp('21.7%'),
  },
});

export default TeacherDashboard;
