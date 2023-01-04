import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Header from '../../components/DashboardHeader';
import IconBadge from 'react-native-icon-badge';
import ParentNotificationCount from './notification/ParentNotificationCount';
import {useIsFocused} from '@react-navigation/native';
const ParentDashboard = ({navigation}) => {
  // let mobile = '';
  let branch = '';
  // let studentId = '';
  const isFocused = useIsFocused();
  const [countEvent, setcountEvent] = useState(0);
  const [notecount, setnotecount] = useState(0);
  const [CountNoteTotal, setCountNoteTotal] = useState(0);
  const [CountEventTotal, setCountEventTotal] = useState(0);
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
    // getStudentId();
    AsyncStorage.getItem('domain').then(data => {
      setdomain(data);
    });
    getRole();
  }, [isFocused]);
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
        AsyncStorage.getItem('schoolBranchName').then(
          keyValue2 => {
            const Branch = keyValue2;

            fetch(`${GLOBALS.PARENT_URL}GetStudIdForParent`, {
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
                  AsyncStorage.setItem('StdID', resultparse[0].StudentId);
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
        AsyncStorage.getItem('schoolBranchName').then(
          keyValue2 => {
            const Branch = keyValue2;

            fetch(`${GLOBALS.PARENT_URL}GetStudIdForParent`, {
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
    let parentNo;
    let StudentID;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        parentNo = keyValue; //Display key value
        AsyncStorage.getItem('StdID').then(
          keyValue2 => {
            StudentID = keyValue2;

            fetch(`${GLOBALS.PARENT_URL}RetrieveParentNoteHistory`, {
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
                // console.log('to countNoteBadge');
                setdataSource(rslt);
                setloading(false);
                setrn_visible(false);
                setnotecount(rslt[0].count);
                countNoteBadge(rslt[0].count);

                try {
                  AsyncStorage.setItem(
                    'NoteCount',
                    JSON.stringify(rslt[0].count),
                  );
                  // AsyncStorage.setItem('NoteCount', JSON.stringify(notecount));
                } catch (error) {
                  console.log('somthing went wrong');
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
      },
      error => {
        console.log(error);
      },
    );
  };

  const countNoteBadge = c => {
    let AsynCount = 0;
    let removecount = 0;
    let count1;
    let count2;
    AsyncStorage.getItem('removeNoteCount').then(
      keyValue2 => {
        removecount = keyValue2;
        if (c >= keyValue2) {
          AsynCount = c;
          count1 = AsynCount - keyValue2;
          setCountNoteTotal(count1);
        } else {
          removecount = 0;
          count2 = AsynCount - removecount;
          setCountNoteTotal(count2);
        }
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
            fetch(`${GLOBALS.PARENT_URL}Getcount`, {
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
                setalertEvent(rslt);
                setalertNotes(rslt[0].Alert);
                setalertNotification(rslt[2].Alert);
                setcountEvent(rslt[0].count);
                setcountNote(rslt[1].count);
                setcountNotif(rslt[2].count);
                noteCount();
                countEventBadge(rslt[0].count);
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
  const countEventBadge = c => {
    let AsynECount = 0;
    let removeEcount = 0;
    let count;
    AsyncStorage.getItem('removecountEvent').then(
      keyValue3 => {
        removeEcount = keyValue3;
        AsynECount = c;
        if (AsynECount >= keyValue3) {
          count = AsynECount - keyValue3;
          setCountEventTotal(count);
        } else {
          removeEcount = 0;
          count = AsynECount - removeEcount;
          setCountEventTotal(count);
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
        style={[styles.box, {backgroundColor: '#FEC107'}]}
        onPress={() => {
          navigation.navigate('ParentStudentDetails');
        }}>
        <Icon name="school" size={34} color="white" />
        <Text style={styles.title}>STUDENT DETAILS</Text>
      </Pressable>
      <Pressable
        style={[styles.box, {backgroundColor: '#4CB050'}]}
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
        style={[styles.box, {backgroundColor: '#EA1E63'}]}>
        <Icon name="calendar-range-outline" size={34} color="white" />

        <Text style={styles.title}>TIME TABLE</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate('ParentExam');
        }}
        style={[styles.box, {backgroundColor: '#673BB7'}]}>
        <Icon name="file-document" size={34} color="white" />

        <Text style={styles.title}>EXAM</Text>
      </Pressable>
      {domain !== 'avk.schoolplusapp.com' && (
        <Pressable
          style={[styles.box, {backgroundColor: '#DD2C00'}]}
          onPress={() => {
            navigation.navigate('ParentFee');
          }}>
          <Icon name="currency-usd" size={34} color="white" />

          <Text style={styles.title}>FEES MANAGEMENT</Text>
        </Pressable>
      )}
      <View style={styles.lastBox}>
        <Pressable
          onPress={() => {
            navigation.navigate('ParentEvents');
          }}
          style={[styles.smallBox, {backgroundColor: '#8CC447'}]}>
          {/* <Icon name="calendar" size={30} color="white" />
          <Text style={styles.title}>EVENTS</Text> */}
          <IconBadge
            MainElement={
              <View style={styles.imagetextcenter}>
                <Icon name="calendar" size={34} color="white" />
                <Text style={styles.title}>EVENTS</Text>
              </View>
            }
            BadgeElement={
              <Text style={styles.iconbadgetext}>{CountEventTotal}</Text>
            }
            IconBadgeStyle={styles.iconBadge}
            Hidden={CountEventTotal === 0 || CountEventTotal < 0}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate('ParentNotes');
          }}
          style={[styles.smallBox, {backgroundColor: '#607D8B'}]}>
          {/* <Icon name="message-processing-outline" size={30} color="white" />
          <Text style={styles.title}>NOTES</Text> */}
          <IconBadge
            MainElement={
              <View style={[styles.imagetextcenter, {width: 107}]}>
                <Icon
                  name="message-processing-outline"
                  size={34}
                  color="white"
                />
                <Text style={styles.title}>NOTES</Text>
              </View>
            }
            BadgeElement={
              <Text style={styles.iconbadgetext}>{CountNoteTotal}</Text>
            }
            IconBadgeStyle={styles.iconBadge}
            Hidden={CountNoteTotal === 0}
          />
        </Pressable>
      </View>
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
  imagetextcenter: {
    marginTop: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 115,
    height: 30,
  },
  iconbadgetext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  IconBadgeStyle: {
    height: 30,
    width: 30,
  },
});
