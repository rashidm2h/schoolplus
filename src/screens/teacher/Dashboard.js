import React, {useEffect, useState} from 'react';
import {DOMParser} from 'xmldom';
import IconBadge from 'react-native-icon-badge';
import {useIsFocused} from '@react-navigation/native';
import {Pressable, StyleSheet, Text, View} from 'react-native';
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

  const getEventNotificationCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}Getcount`, {
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

  const noteTCount = result => {
    AsyncStorage.getItem('removeTeacherNoteCount').then(
      keyValue2 => {
        setCountTNoteTotal(result >= keyValue2 ? result - keyValue2 : result);
      },
      error => {
        console.log(error);
      },
    );
  };

  const getNoteCount = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        fetch(`${GLOBALS.TEACHER_URL}ViewParentNotes`, {
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
            if (result !== 'failure') {
              const rslt = JSON.parse(result);
              noteTCount(rslt[0].count);
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
        style={[styles.box, {backgroundColor: '#4CB050'}]}
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
      {domainName !== 'avk.schoolplusapp.com' ? (
        <Pressable
          style={[styles.box, {backgroundColor: '#DD2C00'}]}
          onPress={() => {
            navigation.navigate('TeacherFee');
          }}>
          <Icon name="currency-usd" size={34} color="white" />

          <Text style={styles.title}>FEES MANAGEMENT</Text>
        </Pressable>
      ) : null}

      <View style={styles.lastBox}>
        <Pressable
          onPress={() => {
            navigation.navigate('TeacherEvents');
          }}
          style={[styles.smallBox, {backgroundColor: '#8CC447'}]}>
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
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate('TeacherNotes');
          }}
          style={[styles.smallBox, {backgroundColor: '#607D8B'}]}>
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
              <Text style={styles.iconbadgetext}>{CountTNoteTotal}</Text>
            }
            IconBadgeStyle={styles.iconBadge}
            Hidden={CountTNoteTotal === 0 || CountTNoteTotal < 0}
          />
        </Pressable>
      </View>
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
    marginLeft: wp('3%'),
    width: wp('21.7%'),
    height: wp('21.7%'),
    backgroundColor: '#EA1E63',
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
