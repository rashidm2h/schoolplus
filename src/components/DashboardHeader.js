import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, Pressable, Alert, View} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import GLOBALS from '../config/Globals';
import IconBadge from 'react-native-icon-badge';
const Header = props => {
  const navigation = useNavigation();
  const [count, setcount] = useState('');
  const [role, setrole] = useState('');
  const isFocused = useIsFocused();
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  const [activeDashboard, setactiveDashboard] = useState('');
  const parser = new DOMParser();
  useEffect(() => {
    AsyncStorage.getItem('role').then(rol => {
      setrole(rol);
    });
    Notification()
  }, [props.homePress, isFocused]);
useEffect(() => {
  accessNotification()
  accessNotificationteach()
})


    const Notification = () => {
    AsyncStorage.getItem('Dashboard').then(active => {
        setactiveDashboard(active);
      let noticount;
      let rslt;
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          if (active === 'AH') {
            AsyncStorage.getItem('BranchID').then(
              keyValue2 => {
                fetch(
                  `http://10.25.25.124:85/EschoolWebService.asmx?op=RetrieveAdminSentNoteAsNotification`,
                  {
                    method: 'POST',
                    body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
              <RetrieveAdminSentNoteAsNotification xmlns="http://www.m2hinfotech.com//">
                <MobileNo>${keyValue}</MobileNo>
                <BranchId>${keyValue2}</BranchId>
              </RetrieveAdminSentNoteAsNotification>
              </soap12:Body>
            </soap12:Envelope>`,
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'text/xml; charset=utf-8',
                    },
                  },
                )
                  .then(response => response.text())
                  .then(response => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(response);
                    const v = xmlDoc.getElementsByTagName(
                      'RetrieveAdminSentNoteAsNotificationResult',
                    )[0].childNodes[0].nodeValue;
                    if (v === 'failure') {
                      setcount(0);
                    } else {
                      rslt = JSON.parse(v);
                      noticount = rslt.length;
                      try {
                        const notificationIds = rslt.map(notification => notification.NotificationId);
                        AsyncStorage.setItem('notificationIdsadmin', JSON.stringify(notificationIds))
                      } catch (error) {
                        console.log('somthing went');
                      }
                      setdata(rslt);
                    }
                  });
              },
              error => {
                console.log(error);
              },
            );
          } else if (active === 'NTS') {
            AsyncStorage.getItem('BranchID').then(
              keyValue2 => {
                fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetNonTStaffsNotes`, {
                  method: 'POST',
                  body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
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
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(response);
                    const v = xmlDoc.getElementsByTagName(
                      'GetNonTStaffsNotesResult',
                    )[0].childNodes[0].nodeValue;
                    if (v === 'failure') {
                      setcount(0);
                    } else {
                      rslt = JSON.parse(v);
                      noticount = rslt.length;
                      rslt = JSON.parse(v);
                      setcount(rslt.length)
                    }
                  });
              },
              error => {
                console.log(error);
              },
            );
          } else {
            AsyncStorage.getItem('StdID').then(keyValue2 => {
              fetch(
                `${
                  active === 'PH'
                    ? `http://10.25.25.124:85/EschoolWebService.asmx?op=`
                    : active === 'TH'
                    ? `http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=`
                    : `http://10.25.25.124:85/EschoolWebService.asmx?op=`
                }Getcount`,
                {
                  method: 'POST',
                  body: `
  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
  <Getcount xmlns="http://www.m2hinfotech.com//">
  <PhoneNo>${keyValue}</PhoneNo>
  ${active === 'PH' && `<studentId>${keyValue2}</studentId> `}
  </Getcount>
  </soap12:Body>
  </soap12:Envelope>
  `,
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'text/xml; charset=utf-8',
                  },
                },
              )
                .then(response => response.text())
                .then(response => {
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(response);
                  const v =
                    xmlDoc.getElementsByTagName('GetcountResult')[0]
                      .childNodes[0].nodeValue;
                  if (v === 'failure') {
                    setcount('');
                  } else {
                    rslt = JSON.parse(v);
                    noticount = rslt[1].count;
                    setcount(rslt[1].count)
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            });
          }
        },
        error => {
          console.log(error); //Display error
        },
      );
    });
    // NTS SSP TH PH AS ASH AH EH
  }

  const bellPress = () => {
    AsyncStorage.getItem('Dashboard').then(active => {
    removeNotification()
    if (active === 'TH'){
    navigation.navigate('TeacherNotifications')
    }
    else if (active === 'PH'){
      navigation.navigate('ParentNotifications')
    }
    // else if (active === 'AH'){
    //   navigation.navigate('Notifications')
    // }
    else{
         navigation.navigate('Notifications');
    }
  })
  }
  const accessNotification = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const phno = keyValue;
        AsyncStorage.getItem('StdID').then(value => {
          studentID = value;
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=RetrieveAllParentNotifications`, {
        method: 'POST',
        body: `
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <RetrieveAllParentNotifications xmlns="http://www.m2hinfotech.com//">
              <recieverNo>${phno}</recieverNo>
              <studentId>${studentID}</studentId>
            </RetrieveAllParentNotifications>
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
              setloading(false);
      const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response);
              const v = xmlDoc.getElementsByTagName(
                'RetrieveAllParentNotificationsResult',
              )[0].childNodes[0].nodeValue;
              if (v === 'failure') {
        setdataerror(true);
      } else {
                const rslt = JSON.parse(v);
                try {
        const notificationIds = rslt.map(notification => notification.NotificationId);
                  AsyncStorage.setItem('notificationIdsparent1', JSON.stringify(notificationIds))
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

  const accessNotificationteach = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`http://10.25.25.124:85//EschoolTeacherWebService.asmx?op=RetrieveAllTeacherNotifications`, {
          method: 'POST',
          body: `
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <RetrieveAllTeacherNotifications xmlns="http://www.m2hinfotech.com//">
            <recieverNo>${keyValue}</recieverNo>
          </RetrieveAllTeacherNotifications>
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
            setloading(false);
            const xmlDoc = parser.parseFromString(response);
            const result = xmlDoc.getElementsByTagName(
              'RetrieveAllTeacherNotificationsResult',
            )[0].childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(result);
              const notificationIds = rslt.map(notification => notification.NotificationId);
              AsyncStorage.setItem('notificationIds', JSON.stringify(notificationIds))
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

  const removeNotification = async () => {
    try {
      const active = await AsyncStorage.getItem('Dashboard');
      const keyValue = await AsyncStorage.getItem('acess_token');
      let notificationIdKey = '';
  
      if (active === 'TH') {
        notificationIdKey = 'notificationIds';
      } else if (active === 'PH') {
        notificationIdKey = 'notificationIdsparent1';
      } else {
        notificationIdKey = 'notificationIdsadmin';
      }
  
      const notificationId = await AsyncStorage.getItem(notificationIdKey);

      
  
      if (notificationId) {
        const response = await fetch(
          `http://10.25.25.124:85/EschoolWebService.asmx?op=UpdateNoticount`,
          {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <UpdateNoticount xmlns="http://www.m2hinfotech.com//">
                  <PhoneNo>${keyValue}</PhoneNo>
                  <Status>1</Status>
                  <NotificationId>${notificationId}</NotificationId>
                </UpdateNoticount>
              </soap12:Body>
            </soap12:Envelope>`,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'text/xml; charset=utf-8',
            },
          }
        );
  
        const result = await response.text();
        if (response.ok) {
          await Notification(); 
        } 
      }
    } catch (error) {
      console.log(error);
    }
  };
  



  const swapPress = () => {
    if (role === 'PT' || role === 'PPT') {
      if (activeDashboard === 'TH') {
        props.swapPress(role !== 'PPT' ? 'ParentHome' : 'SwitchStudent');
        AsyncStorage.setItem('Dashboard', 'PH');
        Alert.alert(
          'Account Switched',
          'You have been switched to parent account!',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
          
        );
      } else if (activeDashboard === 'PH'){
        props.swapPress('TeacherHome');
        AsyncStorage.setItem('Dashboard', 'TH');
        Alert.alert(
          'Account Switched',
          'You have been switched to teacher account!',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    } else if (role === 'SP' || role === 'SPP') {
      if (activeDashboard === 'NTS') {
        navigation.navigate(role !== 'SPP' ? 'ParentHome' : 'SwitchStudent');
        AsyncStorage.setItem('Dashboard', 'PH');
        Alert.alert(
          'Account Switched',
          'You have been switched to parent account!',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      } else {
        navigation.navigate('NonTeachingHome');
        AsyncStorage.setItem('Dashboard', 'NTS');
        Alert.alert(
          'Account Switched',
          'You have been switched to Non Teaching Staff account!',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    }
  };
  return (
    <View style={styles.header}>
      <View style={styles.start}>
        <Pressable
          style={styles.menu}
          onPressIn={() => navigation.openDrawer()}>
          <Icon name="menu" size={30} color="white" />
        </Pressable>
        <Text style={styles.text}>School Plus</Text>
      </View>
      <View style={styles.end}>
        <Pressable onPressIn={props.homePress} style={styles.home}>
          <Icon name="home" size={30} color="white" />
        </Pressable>
        {(role === 'PPT' ||
          role === 'PT' ||
          role === 'SP' ||
          role === 'SPP') && (
          <Pressable onPressIn={swapPress} style={styles.bell}>
            <Icon name="swap-horizontal" size={34} color="white" />
          </Pressable>
        )}
        {(role === 'PPT' ||
          role === 'PP' ||
          role === 'SPP' ||
          role === 'PPT' ||
          role === 'APP') &&
          activeDashboard === 'PH' && (
            <Pressable onPressIn={props.studSwitch} style={styles.bell}>
              <Icon name="face-man" size={30} color="white" />
            </Pressable>
          )}
        {(role === 'AA' || role === 'AA,P') && activeDashboard === 'AH' && (
          <Pressable onPressIn={props.branchSwitch} style={styles.bell}>
            <Icon name="source-branch" size={30} color="white" />
          </Pressable>
        )}
        <Pressable onPressIn= {bellPress} style={styles.bell}>
          <Icon name="bell" size={30} color="white" />

          {count !== '' &&
            count !== undefined &&
            count !== 0 &&
            count !== '0' &&  (
              <View style={styles.container}>
                <View style={styles.IconBadgeStyle}>
                  <IconBadge
                    BadgeElement={
                      <Text style={styles.iconbadgetext}>{count}</Text>
                    }
                    IconBadgeStyle={styles.iconBadge}
                    Hidden={count === 0 || count < 0}
                  />
                </View>
              </View>
            )}
        </Pressable>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    height: wp('15%'),
    backgroundColor: '#13C0CE',
    alignItems: 'center',
    elevation: 5,
  },
  start: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
  },
  menu: {
    marginLeft: wp('3.5%'),
  },
  end: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    position: 'absolute',
    right: wp('0%'),
  },
  home: {
    // alignSelf: 'flex-end',
    marginRight: wp('0.5%'),
  },
  bell: {
    // alignSelf: 'flex-end',
    marginRight: wp('1%'),
  },
  text: {
    marginLeft: wp('7%'),
    color: 'white',
    fontSize: wp('7%'),
    position: 'absolute',
    left: wp('7%'),
  },
  container: {
    flex: 1,
  },
  iconbadgetext: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
  },
  iconBadge: {
    elevation: 2,
    width: wp('6.5%'),
    height: wp('6.5%'),
    marginTop: wp('-11.5%'),
    // marginLeft:20,
    backgroundColor: '#EA1E63',
  },
  IconBadgeStyle: {},
});
