import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  FlatList,
  TextInput,
  ScrollView,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import {CheckBox} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const TeacherFeePay = ({route, navigation}) => {
  const checked = useState(false);
  const [isSuccess, setisSuccess] = useState(false);
  const [buttonState, setbuttonState] = useState(false);
  const [isVisbledata, setisVisbledata] = useState(false);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [dataSource, setdataSource] = useState([]);
  const [number, setnumber] = useState('');
  const [lstdates, setlstdates] = useState('');
  const [discounts, setdiscounts] = useState('');
  const [amntnedopay, setamntnedopay] = useState('');
  const [feeAmountitem, setfeeAmountitem] = useState('');
  const [Selected_StdId, setSelected_StdId] = useState('');
  const parser = new DOMParser();

  useEffect(() => {
    const Stdid = route.params.Stdid;
    BackHandler.addEventListener('hardwareBackPress', () =>
      navigation.navigate('TeacherFeeStructure', {Stdid}),
    );
    retriveStdFee();
    setTimeout(() => setisVisbledata(false), 3000);
  }, []);

  const onData = arr => {
    fetch(`${GLOBALS.TEACHER_URL}InsertStdFeeReact`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
	 <InsertStdFeeReact xmlns="http://www.m2hinfotech.com//">
		 <JasonOutPut>${JSON.stringify(arr)}</JasonOutPut>
	 </InsertStdFeeReact>
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
        const output = parser
          .parseFromString(response)
          .getElementsByTagName('InsertStdFeeReactResult')[0]
          .childNodes[0].nodeValue;
        if (output === 'success') {
          setisVisbledata(false);
          setbuttonState(false);
          Alert.alert(
            'Fee Payment',
            'Successfully!',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
          retriveStdFee();
        } else if (output === 'failure') {
          setisVisbledata(false);
          Alert.alert(
            'Fee Payment',
            'failure',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        } else {
          setisVisbledata(false);
          Alert.alert(
            'Fee Payment',
            'Oops! something went wrong!',
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  const onclickthat = (value, index) => {
    const studid = route.params.Stdid;
    const fee = route.params.feeids;
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        setnumber(keyValue);
      },
      error => {
        console.log(error);
      },
    );
    let newarray = dataSource;
    const datasu = newarray[index].AmountNeedToPay;
    let dataobj = value;
    if (datasu === dataobj || datasu.toString() === dataobj) {
      setisSuccess(true);
      newarray[index].AmountPaid = dataobj;
      newarray[index].StudentID = studid;
      newarray[index].FeeId = fee;
      newarray[index].TeacherNo = number;
      setdataSource(newarray);
    } else {
      setisSuccess(false);
    }
  };
  const onFinalPress = () => {
    setbuttonState(true);
    setisVisbledata(true);
    if (isSuccess === true) {
      onData(dataSource);
    } else {
      setisVisbledata(false);
      setbuttonState(false);
      Alert.alert('Amount', 'Incorrect Amount........!');
    }
  };

  const retriveStdFee = () => {
    fetch(`${GLOBALS.TEACHER_URL}RetrieveStdFee`, {
      method: 'POST',
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
	 <RetrieveStdFee xmlns="http://www.m2hinfotech.com//">
		 <StdIds>${route.params.Stdid}</StdIds>
		 <feeId>${route.params.feeids}</feeId>
	 </RetrieveStdFee>
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
        const result = parser
          .parseFromString(response)
          .getElementsByTagName('RetrieveStdFeeResult')[0]
          .childNodes[0].nodeValue;
        if (result === 'failure') {
          console.log('failure');
        } else {
          const output = JSON.parse(result);
          setdataSource(output);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
  const whenselectmoth = itemP => {
    setSelected_StdId(itemP.TimePeriod);
    setfeeAmountitem(itemP.FeeAmount);
    setdiscounts(itemP.DiscountedAmount);
    setlstdates(itemP.LastDateOfPay);
    setamntnedopay(itemP.DateOfPayment);
    showModal();
  };

  const showModal = () => {
    setisModalVisible(true);
  };

  const _hideModal = () => setisModalVisible(false);

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('TeacherDashboard')}
        bellPress={() => navigation.navigate('TeacherNotifications')}
      />
      <View style={styles.containerTable}>
        <View style={styles.headingTableView}>
          <View style={styles.headbox}>
            <Text style={styles.textcs}>MONTH</Text>
          </View>
          <View style={styles.headboxlast}>
            <Text style={styles.textcs}>AMOUNT</Text>
          </View>
        </View>
        <View style={styles.flatlistView}>
          {isVisbledata && (
            <ActivityIndicator
              style={styles.progressBar}
              color="#C00"
              size="large"
            />
          )}
          <FlatList
            data={dataSource}
            renderItem={({item, index}) => (
              <TouchableOpacity onPress={() => whenselectmoth(item)}>
                <View style={styles.flatitemStyles}>
                  <View style={styles.itemBoxmnth}>
                    <Text style={styles.flatitems}>{item.TimePeriod}</Text>
                  </View>
                  <View style={styles.itemlast}>
                    <View style={styles.flatitemamountView}>
                      <Text style={styles.flatiteminput}>
                        {item.AmountNeedToPay}
                      </Text>
                    </View>
                    {item.AmountPaid === '0' || item.AmountPaid === 0 ? (
                      <View style={styles.flatiteminputView}>
                        <TextInput
                          style={styles.flatiteminput}
                          returnKeyType="next"
                          keyboardType="numeric"
                          underlineColorAndroid="transparent"
                          onChangeText={inputValue =>
                            onclickthat(inputValue, index)
                          }>
                          {item.AmountPaid}
                        </TextInput>
                      </View>
                    ) : (
                      <View style={styles.flatiteminputView}>
                        <Text style={styles.flatiteminput}>
                          {item.AmountPaid}
                        </Text>
                      </View>
                    )}
                    {item.AmountPaid === '0' || item.AmountPaid === 0 ? (
                      <View style={styles.itemBOx}>
                        <CheckBox
                          checked={checked}
                          containerStyle={styles.containerStyle}
                        />
                      </View>
                    ) : (
                      <View style={styles.itemBOx}>
                        <CheckBox
                          checked={!checked}
                          containerStyle={styles.containerStyle}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        <Modal
          isVisible={isModalVisible}
          onBackButtonPress={() => setisModalVisible(false)}>
          <View style={styles.container}>
            <ScrollView>
              <View style={styles.containercreat}>
                <View style={styles.containerImageTextcreat}>
                  <Text style={styles.texticoncreat}>FEE DETAILS</Text>
                </View>
                <View style={styles.containerTabcreat}>
                  <View style={styles.ViewInColcreat}>
                    <Text style={styles.textcreat}>MONTH :</Text>
                    <Text style={styles.textcreatscnd}>{Selected_StdId}</Text>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewInColcreat}>
                      <Text style={styles.textcreat}>FEE AMOUNT :</Text>
                      <Text style={styles.textcreatscnd}>{feeAmountitem}</Text>
                    </View>
                  </View>

                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewInColcreat}>
                      <Text style={styles.textcreat}>Discount Amount :</Text>
                      <Text style={styles.textcreatscnd}>{discounts}</Text>
                    </View>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewInColcreat}>
                      <Text style={styles.textcreat}>
                        Last Date Of Payment :
                      </Text>
                      <Text style={styles.textcreatscnd}>{lstdates}</Text>
                    </View>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewInColcreat}>
                      <Text style={styles.textcreat}>Amount Paid Date :</Text>
                      <Text style={styles.textcreatscnd}>{amntnedopay}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={_hideModal}
                    style={styles.ButtonAddExamcreat}>
                    <Text style={styles.textWhitecreat}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        <TouchableOpacity
          disabled={buttonState}
          style={styles.buttonstyle}
          onPress={onFinalPress}>
          <Icon
            name="check"
            size={27}
            style={styles.topcontentimagelogo}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerStyle: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  containerTable: {
    elevation: 0.5,
    flex: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: wp('0.3%'),
    },
    shadowRadius: wp('1%'),
    shadowOpacity: 0.5,
  },
  headingTableView: {
    height: wp('12.5%'),
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  headbox: {
    flex: 0.5,
    borderRightWidth: wp('0.4%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
  },
  headboxlast: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
  },
  itemlast: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  textcs: {
    fontSize: wp('4.3%'),
    color: '#FFFFFF',
  },
  flatitemStyles: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
  },
  itemBoxmnth: {
    flex: 0.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderRightColor: '#C7C7C7',
    flexShrink: 1,
  },
  flatitems: {
    marginLeft: wp('3.5%'),
    flexWrap: 'nowrap',
  },
  itemBOx: {
    marginLeft: wp('3.5%'),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatiteminputView: {
    width: wp('31%'),
    height: wp('10%'),
    flex: 1,
    margin: wp('1.5%'),
    borderWidth: wp('0.2%'),
    borderRadius: 5,
  },
  flatitemamountView: {
    width: wp('32%'),
    height: wp('9%'),
    flex: 1,
    margin: wp('1%'),
    borderRadius: 5,
  },
  flatiteminput: {
    textAlign: 'center',
    height: wp('11%'),
  },
  buttonstyle: {
    position: 'absolute',
    height: wp('16%'),
    width: wp('16%'),
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    left: wp('9%'),
    bottom: wp('9%'),
  },
  topcontentimagelogo: {
    height: wp('9%'),
    width: wp('9%'),
    resizeMode: 'contain',
  },
  containercreat: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? wp('7%') : 0,
    backgroundColor: '#FFFFFF',
  },
  texticoncreat: {
    marginLeft: wp('8%'),
    color: '#FFFFFF',
    fontSize: wp('6.7%'),
    fontWeight: '200',
  },
  containerImageTextcreat: {
    height: wp('18%'),
    alignItems: 'center',
    backgroundColor: '#13C0CE',
    flex: 1,
    flexDirection: 'row',
  },
  containerTabcreat: {
    flex: 7,
    flexDirection: 'column',
  },
  ViewInColcreat: {
    flex: 1,
    marginVertical: wp('3.5%'),
    flexDirection: 'row',
    marginLeft: wp('3.5%'),
  },
  textcreat: {
    flex: 0.6,
    alignItems: 'flex-start',
    fontSize: wp('5%'),
    fontWeight: 'normal',
    color: 'gray',
  },
  textcreatscnd: {
    flex: 0.5,
    alignItems: 'flex-end',
    fontSize: wp('5.5%'),
    fontWeight: 'normal',
    color: 'gray',
  },
  ViewInRowcreat: {
    marginVertical: wp('0.3%'),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ButtonAddExamcreat: {
    flex: 1,
    backgroundColor: '#034951',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp('24%'),
    height: wp('8.5%'),
    elevation: 3,
  },
  textWhitecreat: {
    color: '#FFFFFF',
  },
});
export default TeacherFeePay;
