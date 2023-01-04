import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Image,
  FlatList,
  BackHandler,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CheckBox} from 'react-native-elements';
// import RazorpayCheckout from 'react-native-razorpay';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';
// import NotificationCount from './NotificationCount';
// import ParentToolbarSwitchStd from './ParentToolbarSwitchStd';
// import ParentToolbarSwitchPT from './ParentToolbarSwitchPT';

const FeeDetails = ({route, navigation}) => {
  const [isLoadingfeedetail, setisLoadingfeedetail] = useState(true);
  const [dataSource, setdataSource] = useState('');
  const [visible, setvisible] = useState(false);
  const [noDataView, setnoDataView] = useState(true);
  const [checked, setchecked] = useState(true);
  const [onlinePayment, setonlinePayment] = useState(false);
  const [amount, setamount] = useState(100);
  const [apiKey, setapiKey] = useState('rzp_live_yjahP8RCVuos3c');
  const [mobile, setmobile] = useState('');
  const [stdId, setstdId] = useState('');
  useEffect(() => {
    const {navigate} = navigation;
    BackHandler.addEventListener('hardwareBackPress', () =>
      navigate('ParentFee'),
    );
    setTimeout(() => setisLoadingfeedetail(false), 9000);
    AsyncStorage.getItem('acess_token')
      .then(keyValue => {
        setmobile(keyValue);
      })
      .catch(err => console.log(err));
    checkOnlinePayment();
    stdFeeRetrive();
  }, []);

  const checkOnlinePayment = () => {
    AsyncStorage.getItem('BranchID').then(
      keyValue => {
        const BranchID = keyValue;
        fetch(`${GLOBALS.PARENT_URL}GetBranchPaymentStatus`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
		  <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
			<soap12:Body>
			  <GetBranchPaymentStatus xmlns="http://www.m2hinfotech.com//">
				<branchId>${BranchID}</branchId>
			  </GetBranchPaymentStatus>
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
              'GetBranchPaymentStatusResult',
            )[0].childNodes[0].nodeValue;
            console.log(ccc);
            if (ccc === '1') {
              setonlinePayment(true);
            } else {
              setonlinePayment(false);
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
  //   componentWillUnmount() {
  //     const {navigate} = props.navigation;
  //     BackHandler.removeEventListener('hardwareBackPress', () =>
  //       navigate('ParentFeeStructure'),
  //     );
  //   }

  const paymentService = (item, amount, payId) => {
    const fee = route.params.feeids;
    AsyncStorage.getItem('BranchID').then(
      keyValue => {
        let array = [];
        array.push({
          AmountNeedToPay: item.AmountNeedToPay,
          AmountPaid: item.AmountNeedToPay,
          DateOfPayment: item.DateOfPayment,
          DiscountedAmount: item.DiscountedAmount,
          FeeAmount: item.FeeAmount,
          FeeId: fee,
          LastDateOfPay: item.LastDateOfPay,
          Num: item.Num,
          StudentID: stdId,
          parentno: mobile,
          TimePeriod: item.TimePeriod,
        });
        const newArray = JSON.stringify(array);
        const BranchID = keyValue;

        fetch(`${GLOBALS.PARENT_URL}InsertStdFeeByParent`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <InsertStdFeeByParent xmlns="http://www.m2hinfotech.com//">
                <JasonOutPut>${newArray}</JasonOutPut>
                <branchId>${BranchID}</branchId>
                <razorPayId>${payId}</razorPayId>
                <amountPaise>${amount}</amountPaise>
              </InsertStdFeeByParent>
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
              'InsertStdFeeByParentResult',
            )[0].childNodes[0].nodeValue;
            console.log(ccc);

            if (ccc === 'success') {
              stdFeeRetrive();
              Alert.alert('Success', 'You have paid the fees successfully!');
            } else {
              setisLoadingfeedetail(false);
              Alert.alert('Failure', 'Fee payment failed!');
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

  const payNow = item => {
    let amountToPay = `${item.AmountNeedToPay}00`;
    let options = {
      description: 'Fee Payment',
      currency: 'INR',
      amount: amountToPay,
      key: apiKey,
      name: item.TimePeriod,
      prefill: {
        //     email: 'test@email.com',
        contact: mobile,
        //     name: 'ReactNativeForYou',
      },
      theme: {color: '#528FF0'},
    };
    // RazorpayCheckout.open(options)
    //   .then(data => {
    //     setisLoadingfeedetail(true);
    //     paymentService(item, amountToPay, data.razorpay_payment_id);
    //   })
    //   .catch(error => {
    //     // handle failure
    //     alert(`Error: ${error.code} | ${error.description}`);
    //   });
  };

  const payButton = item => {
    if (onlinePayment) {
      return (
        <View style={styles.checkBoxView}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => payNow(item)}>
            <Text style={{color: 'white'}}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.checkBoxView}>
          <CheckBox
            containerStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#FFFFFF',
            }}
            checked={!checked}
          />
        </View>
      );
    }
  };

  const stdFeeRetrive = () => {
    const fee = route.params.feeids;
    AsyncStorage.getItem('StdID').then(
      keyValue => {
        const Stdid = keyValue;
        setstdId(keyValue);
        fetch(`${GLOBALS.TEACHER_URL}RetrieveStdFee`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
		<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
			<soap12:Body>
				<RetrieveStdFee xmlns="http://www.m2hinfotech.com//">
					<StdIds>${Stdid}</StdIds>
					<feeId>${fee}</feeId>
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
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response);
            const ccc = xmlDoc.getElementsByTagName('RetrieveStdFeeResult')[0]
              .childNodes[0].nodeValue;
            if (ccc === 'failure') {
              setvisible(false);
              setisLoadingfeedetail(false);
              setnoDataView(false);
            } else {
              const output = JSON.parse(ccc);
              setvisible(true);
              setdataSource(output);
              setisLoadingfeedetail(false);
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
      {/* <View style={styles.containerTop}>
        <Icon name="currency-usd" size={30} color="white" />
        <Text style={styles.dashtext}>FEE DETAIL</Text>
      </View> */}
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      <View style={styles.containerTable}>
        <View style={styles.noDataView}>
          <Text style={styles.notDataText}>No data</Text>
        </View>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('ParentDashboard')}
        bellPress={() => navigation.navigate('ParentNotifications')}
      />
      {/* <View style={styles.containerTop}>
        <Icon name="currency-usd" size={30} color="white" />
        <Text style={styles.dashtext}>FEE DETAIL</Text>
      </View> */}
      <View style={styles.containerTable}>
        {visible && (
          <View style={styles.headingTableView}>
            <View style={styles.headbox}>
              <Text style={styles.textalert}>MONTH</Text>
            </View>
            <View style={styles.headbox}>
              <Text style={styles.textalert}>AMOUNT</Text>
            </View>
            <View style={styles.headbox}>
              <Text style={styles.textalert}>LAST DATE</Text>
            </View>
            <View style={styles.headboxlast}>
              <Text style={styles.textalert}>STATUS</Text>
            </View>
          </View>
        )}
        <View style={styles.flatlistView}>
          {isLoadingfeedetail && (
            <ActivityIndicator
              style={styles.progressBar}
              color="#C00"
              size="large"
            />
          )}
          {visible && (
            <FlatList
              data={dataSource}
              renderItem={({item}) => (
                <View style={styles.itemStylealert}>
                  <View style={styles.itemBOx}>
                    <Text style={styles.flatitem}>{item.TimePeriod}</Text>
                  </View>
                  <View style={styles.itemBOx}>
                    <Text style={styles.flatitem}>{item.AmountNeedToPay}</Text>
                  </View>
                  <View style={styles.itemBOx}>
                    <Text style={{color: 'red'}}>{item.LastDateOfPay}</Text>
                  </View>
                  {item.AmountPaid === item.AmountNeedToPay ? (
                    <View style={styles.checkBoxView}>
                      <CheckBox
                        containerStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#FFFFFF',
                        }}
                        checked={checked}
                      />
                    </View>
                  ) : (
                    payButton(item)
                  )}
                </View>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  noDataView: {
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  navHeaderLeft: {
    flexDirection: 'row',
    marginLeft: 15,
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
  containerTop: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DD2C00',
    elevation: 0.5,
  },
  containertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  dashtext: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  containerTable: {
    elevation: 0.5,
    flex: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
  },
  headingTableView: {
    flex: 0.75,
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  headingTable: {
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  itemStyle: {
    flexDirection: 'column',
  },
  headbox: {
    flex: 1,
    borderRightWidth: 1,
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
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  textalert: {
    fontWeight: 'bold',
    fontSize: 12,
    flexWrap: 'wrap',
    color: '#FFFFFF',
  },
  itemStylealert: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  itemBOx: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  CheckBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxView: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
});
export default FeeDetails;
