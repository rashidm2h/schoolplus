import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, Pressable, View} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {DOMParser} from 'xmldom';
import IconBadge from 'react-native-icon-badge';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import GLOBALS from '../config/Globals';
import {useIsFocused} from '@react-navigation/native';
const Header = props => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [count, setcount] = useState('');
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  useEffect(() => {
    Notification();
  }, [props.homePress, isFocused]);
  useEffect(() => {
    accessNotification();
    accessNotificationteach();
  }, []);
  const Notification = () => {
    AsyncStorage.getItem('Dashboard').then(active => {
      let noticount;
      let rslt;
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          if (active === 'AH') {
            AsyncStorage.getItem('BranchID').then(
              keyValue2 => {
                fetch(
                  `${GLOBALS.PARENT_SERVICE}RetrieveAdminSentNoteAsNotification`,
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
                        AsyncStorage.setItem(
                          'AdminNotificationCount',
                          JSON.stringify(rslt.length),
                        );
                      } catch (error) {
                        console.log('somthing went');
                      }
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
                fetch(`${GLOBALS.PARENT_SERVICE}GetNonTStaffsNotes`, {
                  method: 'POST',
                  body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
              <GetNonTStaffsNotes xmlns="http://www.m2hinfotech.com//">
                <MobileNo>${keyValue}</MobileNo>
                <BranchId>${keyValue2}</BranchId>
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
                      setcount(rslt.length);
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
                    ? `${GLOBALS.PARENT_SERVICE}`
                    : active === 'TH'
                    ? `${GLOBALS.TEACHER_SERVICE}`
                    : `${GLOBALS.PARENT_SERVICE}`
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
                    setcount(rslt[1].count, active);
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
  };

  const bellPress = () => {
    AsyncStorage.getItem('Dashboard').then(active => {
      removeNotification();
      if (active === 'TH') {
        navigation.navigate('TeacherNotifications');
      } else if (active === 'PH') {
        navigation.navigate('ParentNotifications');
      } else if (active === 'AH') {
        navigation.navigate('Notifications');
      }
    });
  };

  const accessNotification = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        const phno = keyValue;
        AsyncStorage.getItem('StdID').then(value => {
          const studentID = value;
          fetch(`${GLOBALS.PARENT_SERVICE}RetrieveAllParentNotifications`, {
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
                  const notificationIds = rslt.map(
                    notification => notification.NotificationId,
                  );
                  AsyncStorage.setItem(
                    'notificationIdsparent1',
                    JSON.stringify(notificationIds),
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

  const accessNotificationteach = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_SERVICE}RetrieveAllTeacherNotifications`, {
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
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const result = xmlDoc.getElementsByTagName(
              'RetrieveAllTeacherNotificationsResult',
            )[0].childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            } else {
              const rslt = JSON.parse(result);
              const notificationIds = rslt.map(
                notification => notification.NotificationId,
              );
              AsyncStorage.setItem(
                'notificationIds',
                JSON.stringify(notificationIds),
              );
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
          `${GLOBALS.PARENT_SERVICE}UpdateNoticount`,
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
          },
        );

        const result = await response.text();
        if (response.ok) {
          Notification();
        } else {
          console.log('Error updating notification count:', result);
        }
      }
    } catch (error) {
      console.log('Error in removeNotification:', error);
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
        <Pressable onPressIn={bellPress} style={styles.bell}>
          <Icon name="bell" size={30} color="white" />
          {count !== '' &&
            count !== undefined &&
            count !== 0 &&
            count !== '0' && (
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
          {/* {screen === 'TH' ? (
            <View>
              <TeacherNotificationCount> </TeacherNotificationCount>
            </View>
          ) : screen === 'PH' ? (
            <View>
              <ParentNotificationCount> </ParentNotificationCount>
            </View>
          ) : screen === 'AH' ? (
            <View>
              <AdminNotificationCount> </AdminNotificationCount>
            </View>
          ) : null} */}
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
  },
  menu: {
    marginLeft: 10,
  },
  end: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  home: {
    // alignSelf: 'flex-end',
    marginRight: 10,
  },
  bell: {
    // alignSelf: 'flex-end',
    marginRight: 10,
  },
  text: {
    marginLeft: 20,
    color: 'white',
    fontSize: 22,
  },
  container: {
    flex: 1,
  },
  iconbadgetext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  iconBadge: {
    elevation: 2,
    width: 16,
    height: 16,
    marginTop: -40,
    // marginLeft:20,
    backgroundColor: '#EA1E63',
  },
  IconBadgeStyle: {},
});
