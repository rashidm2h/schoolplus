import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import NotificationCount from './NotificationCount';
// import ParentToolbarSwitchStd from './ParentToolbarSwitchStd';
// import ParentToolbarSwitchPT from './ParentToolbarSwitchPT';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const ParentFeeStructure = ({route, navigation}) => {
  const [dataSource, setdataSource] = useState(' ');
  const [visible, setvisible] = useState(false);
  const [isloadingfeeStructure, setisloadingfeeStructure] = useState(true);
  const [studentId, setstudentId] = useState('');
  const [noDataView, setnoDataView] = useState(true);

  useEffect(() => {
    // const {navigate} = navigation;
    // BackHandler.addEventListener('hardwareBackPress', () =>
    //   navigate('ParentDashboard'),
    // );
    stdFeeStructure();
    setTimeout(() => setisloadingfeeStructure(false), 9000);
  }, []);
  //   componentWillUnmount() {
  //     const {navigate} = this.props.navigation;
  //     BackHandler.removeEventListener('hardwareBackPress', () =>
  //       navigate('Parent_Dashboard'),
  //     );
  //   }
  const toast = () => {
    Alert.alert(
      'Alert Title',
      'No data',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  };
  const stdFeeStructure = () => {
    AsyncStorage.getItem('StdID').then(
      keyValue => {
        setstudentId(keyValue);
        fetch(`${GLOBALS.TEACHER_URL}StudentFeeStructure`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <StudentFeeStructure xmlns="http://www.m2hinfotech.com//">
          <StdIds>${keyValue}</StdIds>
        </StudentFeeStructure>
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
            const rslt = xmlDoc.getElementsByTagName(
              'StudentFeeStructureResult',
            )[0].childNodes[0].nodeValue;
            if (rslt === 'failure') {
              setisloadingfeeStructure(false);
              setnoDataView(false);
            } else {
              const output = JSON.parse(rslt);
              setdataSource(output);
              setisloadingfeeStructure(false);
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

  return noDataView === false ? (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      <View style={styles.containerTab}>
        <View style={styles.noDataView}>
          <Text style={styles.notDataText}>No Fees Available</Text>
        </View>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      <View style={styles.containerTab}>
        {isloadingfeeStructure && (
          <ActivityIndicator
            style={styles.progressBar}
            color="#C00"
            size="large"
          />
        )}
        <FlatList
          data={dataSource}
          renderItem={({item}) => (
            <View style={styles.itemStyle}>
              <TouchableOpacity
                style={styles.buttonstyle}
                onPress={() => {
                  const feeids = item.FeeId;
                  navigation.navigate('ParentPayFee', {feeids});
                }}>
                <Text style={styles.textButton}>{item.FeeName}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: wp('22%'),
    width: wp('22%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'column',
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
    width: wp('3.5%'),
    height: wp('11.5%'),
  },
  HeaderText: {
    marginLeft: 25,
    color: '#E6FAFF',
    fontSize: 20,
    fontWeight: '400',
  },
  containerImageText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DD2C00',
    flex: 2,
    flexDirection: 'column',
  },

  Textincontainer: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  containerTab: {
    borderTopColor: '#DD2C00',
    borderTopWidth: wp('0.5%'),
    flex: 8,
  },
  topcontentimage: {
    justifyContent: 'center',
    height: wp('11.5%'),
    width: wp('11.5%'),
  },
  itemStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  buttonstyle: {
    backgroundColor: '#034951',
    height: wp('16.5%'),
    width: wp('95%'),
    marginVertical: wp('7%'),
    marginHorizontal: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: wp('5%'),
    fontWeight: 'normal',
  },
});
export default ParentFeeStructure;
