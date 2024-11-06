import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DOMParser } from 'xmldom';
import GLOBALS from '../../config/Globals';
import Header from '../../components/DashboardHeader';
import IconBadge from 'react-native-icon-badge';
import ParentNotificationCount from './notification/ParentNotificationCount';
import { useIsFocused } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const ParentDashboard = ({ navigation }) => {
  // let mobile = '';
  let branch = '';
  // let studentId = '';
  const isFocused = useIsFocused();
  const [countEvent, setcountEvent] = useState(0);
  const [notecount, setnotecount] = useState(0);
  const [CountNoteTotal, setCountNoteTotal] = useState(0);
  const [CountTEventTotal, setCountTEventTotal] = useState(0);
  const [dataSource, setdataSource] = useState('');
  const [loading, setloading] = useState(false);
  const [rn_visible, setrn_visible] = useState('');
  const [alertEvent, setalertEvent] = useState('');
  const [alertNotes, setalertNotes] = useState('');
  const [alertNotification, setalertNotification] = useState('');
  const [countNote, setcountNote] = useState(0);
  const [countNotif, setcountNotif] = useState(0);
  const [roLe, setroLe] = useState('');
  const [mobile, setmobile] = useState('');
  const [domain, setdomain] = useState('');
  const [StudentId, setStudentId] = useState('');

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
    // getStudentId();
    AsyncStorage.getItem('domain').then(data => {
      setdomain(data);
    });
    getRole();
    noteCount();

  }, [isFocused]);

  const buttonpress = () => {
     removeNotification(); 
      navigation.navigate('ParentNotes')
  };
  
  const getRole = () => {
    AsyncStorage.getItem('role').then(
      keyValue => {
        setroLe(keyValue);
        if (keyValue === 'P') {
          getStudentId();
        } else if (keyValue === 'PT') {
          getStudentIdForPT();
          countData();
          noteCount();
        } else if (keyValue === 'SP') {
          getStudentIdForPT();
        } else {
          // console.log('PPT');
          countData();
          noteCount();
        }
      },
      error => {
        console.log(error); //Display error
      },
    );
  };

  const getStudentIdForPT = () => {
    // console.log('PT');
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        console.log(keyValue, 'key');
        setmobile(keyValue);
        AsyncStorage.getItem('BranchID').then(
          keyValue2 => {
            const Branch = keyValue2;
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStudIdForParent`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
		      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <GetStudIdForParent xmlns="http://www.m2hinfotech.com//">
      <mobile>${keyValue}</mobile>
      <Branch>${keyValue2}</Branch>
    </GetStudIdForParent>
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
                const result = xmlDoc.getElementsByTagName(
                  'GetStudIdForParentResult',
                )[0].childNodes[0].nodeValue;
                const resultparse = JSON.parse(result);
                const studentId = resultparse[0].StudentId;
                setStudentId(studentId);
                try {
                  AsyncStorage.setItem('StdID', studentId);
                } catch (error) {
                  console.log('somthing went wrong');
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
      },
      error => {
        console.log(error); //Display error
      },
    );
  };
  const getStudentId = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        setmobile(keyValue);
        AsyncStorage.getItem('BranchID').then(
          keyValue2 => {
            const Branch = keyValue2;
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStudIdForParent`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
		      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <GetStudIdForParent xmlns="http://www.m2hinfotech.com//">
      <mobile>${keyValue}</mobile>
      <Branch>${Branch}</Branch>
    </GetStudIdForParent>
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
                const result = xmlDoc.getElementsByTagName(
                  'GetStudIdForParentResult',
                )[0].childNodes[0].nodeValue;
                const resultparse = JSON.parse(result);
                const studentId = resultparse[0].StudentId;
                setStudentId(studentId);
                try {
                  AsyncStorage.setItem('StdID', studentId);
                } catch (error) {
                  console.log('somthing went wrong');
                }
                countData();
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
        console.log(error); //Display error
      },
    );
  };
  const noteCount = () => {
    // let parentNo;
    // let StudentID;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        // parentNo = keyValue; //Display key value
        AsyncStorage.getItem('StdID').then(
          keyValue2 => {
            // StudentID = keyValue2;

            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=RetrieveParentNoteHistory`, {
              method: 'POST',
              body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
					 <soap12:Body>
						 <RetrieveParentNoteHistory xmlns="http://www.m2hinfotech.com//">
							 <parentNo>${keyValue}</parentNo>
							 <studentId>${keyValue2}</studentId>
						 </RetrieveParentNoteHistory>
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
                const v = xmlDoc.getElementsByTagName(
                  'RetrieveParentNoteHistoryResult',
                )[0].childNodes[0].nodeValue;
                const rslt = JSON.parse(v);
                setdataSource(rslt);
                setloading(false);
                setrn_visible(false);
                setnotecount(rslt.Table[0].count);

                try {
                  const notificationIds = rslt.Table.map(notification => notification.NotificationId);
                  AsyncStorage.setItem('notificationIdsparent', JSON.stringify(notificationIds))
                  // AsyncStorage.setItem('NoteCount', JSON.stringify(notecount));
                } catch (error) {
                  console.log('somthing went wrong');
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
      },
      error => {
        console.log(error);
      },
    );
  };
  const countData = () => {
    let phoneNo;
    let StdId;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        phoneNo = keyValue;
        AsyncStorage.getItem('StdID').then(
          keyValue2 => {
            StdId = keyValue2;
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=Getcount`, {
              method: 'POST',
              body: `
				 <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
				 <soap12:Body>
					 <Getcount xmlns="http://www.m2hinfotech.com//">
						 <PhoneNo>${phoneNo}</PhoneNo>
						 <studentId>${StdId}</studentId>
					 </Getcount>
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
                const v =
                  xmlDoc.getElementsByTagName('GetcountResult')[0].childNodes[0]
                    .nodeValue;
                const rslt = JSON.parse(v);
                setdataSource(rslt);
                eventTCount(rslt[0].count);
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
  const eventTCount = result => {
    AsyncStorage.getItem('removecountEvent').then(
      keyValue2 => {
        setCountTEventTotal(result >= keyValue2 ? result - keyValue2 : result);
      },
      error => {
        console.log(error);
      },
    );
  };
    
  const removeNotification = () => {
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          AsyncStorage.getItem('notificationIdsparent')
          .then(
            keyValue2 => {
              fetch(
                `http://10.25.25.124:85/EschoolWebService.asmx?op=UpdateNotescount`,
                {
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
                  }
                }
              )
              .then(response => response.text())
              .then(() => {
                noteCount(); 
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
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => {
          navigation.navigate('ParentNotifications');
        }}
        // notificationCount={() => {
        //   navigation.navigate('NotificationCount');
        // }}
        studSwitch={() => {
          navigation.navigate('SwitchStudent');
        }}
        swapPress={page => {
          navigation.navigate(page);
        }}
        notificationCount={<ParentNotificationCount />}
      />

      <Pressable
        style={[styles.box, { backgroundColor: '#FEC107' }]}
        onPress={() => {
          navigation.navigate('ParentStudentDetails');
        }}>
        <Icon name="school" size={34} color="white" />
        <Text style={styles.title}>STUDENT DETAILS</Text>
      </Pressable>
      <Pressable
        style={[styles.box, { backgroundColor: '#4CB050' }]}
        onPress={() => {
          navigation.navigate('ParentExamResults');
        }}>
        <Icon name="checkbox-marked-circle-outline" size={34} color="white" />

        <Text style={styles.title}>RESULTS</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('ParentTimeTable');
        }}
        style={[styles.box, { backgroundColor: '#EA1E63' }]}>
        <Icon name="calendar-range-outline" size={34} color="white" />

        <Text style={styles.title}>TIME TABLE</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('ParentExam');
        }}
        style={[styles.box, { backgroundColor: '#673BB7' }]}>
        <Icon name="file-document" size={34} color="white" />

        <Text style={styles.title}>EXAM</Text>
      </Pressable>
      {/* {domain !== 'avk.schoolplusapp.com' && (
        <Pressable
          style={[styles.box, {backgroundColor: '#DD2C00'}]}
          onPress={() => {
            navigation.navigate('ParentFee');
          }}>
          <Icon name="currency-usd" size={34} color="white" />

          <Text style={styles.title}>FEES MANAGEMENT</Text>
        </Pressable>
      )} */}
      {/* <View style={styles.lastBox}> */}
      <Pressable
        onPress={() => {
          navigation.navigate('ParentEvents');
        }}
        style={[styles.box, { backgroundColor: '#8CC447' }]}>
        <Icon name="calendar" size={34} color="white" />
        <Text style={styles.title}>EVENTS</Text>
        <IconBadge
          BadgeElement={
              <Text style={styles.iconbadgetext}>{CountTEventTotal}</Text>
          }
          IconBadgeStyle={styles.iconBadge}
            Hidden={CountTEventTotal === 0 || CountTEventTotal < 0}
          
        />
          {console.log(CountTEventTotal,"jjj")}
      </Pressable>
      <Pressable
        onPress={buttonpress}
        style={[styles.box, { backgroundColor: '#607D8B' }]}>
        <Icon
          name="message-processing-outline"
          size={34}
          color="white"
        />
        <Text style={styles.title}>NOTES</Text>
        {/* <Icon name="message-processing-outline" size={30} color="white" />
          <Text style={styles.title}>NOTES</Text> */}
        <IconBadge
          BadgeElement={
            <Text style={styles.iconbadgetext}>{notecount}</Text>
          }
          IconBadgeStyle={styles.iconBadge}
          Hidden={notecount === 0}
        />
      </Pressable>
      {/* </View> */}
    </View>
  );
};

export default ParentDashboard;

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
    height: hp('15%'),
  },
  title: {
    color: 'white',
    fontSize: wp('5%'),
    marginLeft: wp('1.3%'),
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
  imagetextcenter: {
    marginTop: wp('5%'),
    marginBottom: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: wp('100%'),
    height: wp('10%'),
  },
  iconbadgetext: {
    fontSize: wp('3.5%'),
    color: '#FFFFFF',
  },
  iconBadge: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: 50,
    backgroundColor: '#EA1E63',
    top: -wp('8%'),
    left: wp('1%')
  },
  IconBadgeStyle: {
    height: wp('3.5%'),
    width: wp('3.5%'),
  },
});
