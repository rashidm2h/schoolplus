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
  Platform,
  Pressable,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MultiSelect from 'react-native-multiple-select';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {ScrollView} from 'react-native';
import {widthPercentageToDP} from 'react-native-responsive-screen';

const AdminFeeFirstScreen = ({navigation}) => {
  const [ClassDropdownData, setClassDropdownData] = useState([]);
  const [BranchClassId, setBranchClassId] = useState('');
  const [DivisionDropdownData, setDivisionDropdownData] = useState([]);
  const [ClassDropdownValue, setClassDropdownValue] = useState('');
  const [DivisionDropdownValue, setDivisionDropdownValue] = useState('');
  const [PaidCheckDropDownData, setPaidCheckDropDownData] = useState([
    {label: 'Paid', value: 1},
    {label: 'UnPaid', value: 2},
  ]);
  const [PaidCheckDropDownValue, setPaidCheckDropDownValue] = useState(1);
  const [fromDate, setfromDate] = useState('');
  const [toDate, settoDate] = useState('');
  const [classId, setclassId] = useState('');
  const [dataerror, setdataerror] = useState(false);
  const [feeDetails, setfeeDetails] = useState([]);
  const [FromDateVisible, setFromDateVisible] = useState(false);
  const [ToDateVisible, setToDateVisible] = useState(false);
  const [formattedToDate, setformattedToDate] = useState('');
  const [formattedFromDate, setformattedFromDate] = useState('');
  const [selectAllDivision, setSelectAllDivision] = useState(false);
  const [branch, setbranch] = useState('');

  let branchId = '';
  let username = '';
  useEffect(() => {
    getClasses();
  }, []);

  const onSubmitClick = () => {
    if (fromDate === null || toDate === null) {
      Alert.alert('Warning', 'Please select the date!');
    } else if (classId === '' || BranchClassId === '') {
      Alert.alert('Warning', 'Please select the class and division!');
    } else {
      submitService();
    }
  };

  const submitService = () => {
    let arrayDivision = BranchClassId;

    let branchJoined = '';

    if (arrayDivision.length !== 0) {
      branchJoined = arrayDivision.join();
    }
    let SbranchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      SbranchId = BranchID;

      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetClassFeeTotal`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetClassFeeTotal xmlns="http://www.m2hinfotech.com//">
                 <BranchClassId>${branchJoined}</BranchClassId>
                <BranchId>${SbranchId}</BranchId>
  <PaidStatus>${PaidCheckDropDownValue}</PaidStatus>
  <FromDate>${formattedFromDate}</FromDate>
  <ToDate>${formattedToDate}</ToDate>
              </GetClassFeeTotal>
            </soap12:Body>
          </soap12:Envelope>`,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/soap+xml; charset=utf-8',
            },
          })
            .then(response => response.text())
            .then(response => {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response);

              const Data = xmlDoc.getElementsByTagName(
                'GetClassFeeTotalResult',
              )[0].childNodes[0].nodeValue;

              if (Data === 'failure') {
                setdataerror(true);
              } else {
                const output = JSON.parse(Data);
                setdataerror(false);
                const feeData = [];
                output.map(item => {
                  feeData.push({
                    class: item.Class,
                    fees:
                      PaidCheckDropDownValue === 1
                        ? item.TotalAmountPaid
                        : item.TotalCurrentDue,
                  });
                });

                setfeeDetails(feeData);
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

  const getMultiDivisions = item => {
    let array = item !== undefined ? item : classId;

    let arrayJoined = '';
    if (array.length !== 0) {
      arrayJoined = array.join();
    }

    AsyncStorage.getItem('BranchID').then(BranchID => {
      fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=MultiSelectDivisions`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <MultiSelectDivisions xmlns="http://www.m2hinfotech.com//">
              <branchId>${BranchID}</branchId>
              <classId>${arrayJoined}</classId>
            </MultiSelectDivisions>
          </soap12:Body>
        </soap12:Envelope>`,
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
            'MultiSelectDivisionsResult',
          )[0].childNodes[0].nodeValue;
          if (ccc === 'failure') {
          } else {
            const output = JSON.parse(ccc);
            let selectedData = [];

            const dropData = output.map(element => ({
              value: element.BranchClassId,
              label: element.DivCode,
            }));
            dropData.splice(0, 0, {
              value: 0,
              label: 'Select all',
            });
            if (BranchClassId.length > 0) {
              BranchClassId.map(items => {
                dropData.map(it => {
                  if (items === it.value) {
                    selectedData.push(it.value);
                  }
                });
              });
            }

            setDivisionDropdownData(dropData);
            setBranchClassId(selectedData);
          }
        })
        .catch(error => {
          console.log(error, 'error');
        });
    });
  };
  const getClasses = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      //   setbranch(BranchID);
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          username = keyValue;
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetAllClasses`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <GetAllClasses xmlns="http://www.m2hinfotech.com//">
              <mobileNo>${username}</mobileNo>
              <Branch>${branchId}</Branch>
            </GetAllClasses>
          </soap12:Body>
        </soap12:Envelope>`,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/soap+xml; charset=utf-8',
            },
          })
            .then(response => response.text())
            .then(response => {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response);
              const ccc = xmlDoc.getElementsByTagName('GetAllClassesResult')[0]
                .childNodes[0].nodeValue;
              if (ccc === 'failure') {
                this.Alert(
                  '',
                  'It seems like you have no access to any class!',
                );
              } else {
                const output = JSON.parse(ccc);

                let dropdownData = output;

                const dropData = dropdownData.map(element => ({
                  value: element.class_Id,
                  label: element.Class_name,
                }));
                setClassDropdownData(dropData);
                // setclassId([dropdownData[0].class_Id]);
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
    });
  };

  const handleConfirm = (value, date) => {
    switch (value) {
      case 'FromDate':
        setfromDate(moment(date).format('DD-MM-YYYY'));
        setformattedFromDate(moment(date).format('MM-DD-YYYY'));
        setFromDateVisible(false);
        break;
      case 'ToDate':
        settoDate(moment(date).format('DD-MM-YYYY'));
        setformattedToDate(moment(date).format('MM-DD-YYYY'));
        setToDateVisible(false);
        break;
      default:
        break;
    }
  };
  const hidePicker = value => {
    setFromDateVisible(false);
    setToDateVisible(false);
  };
  const CardView = () => {
    return (
      <FlatList
        data={feeDetails}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.cardView}>
            <Text style={{color: 'grey'}}>
              Class :<Text>{item.class}</Text>
            </Text>
            <Text>
              {PaidCheckDropDownValue === 1
                ? 'Total Fee Paid'
                : 'Total Fee Unpaid'}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                // backgroundColor: 'red',
                justifyContent: 'space-between',
              }}>
              <Text style={{fontSize: 20, color: 'green'}}>{item.fees}</Text>
              <View style={styles.DetailsViewbutton}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('AdminFeeDetails', {
                      classId: classId,
                      BranchClassId: BranchClassId,
                      PaidCheckDropDownValue: PaidCheckDropDownValue,
                      formattedFromDate: formattedFromDate,
                      formattedToDate: formattedToDate,
                    })
                  }>
                  <Text style={styles.buttonText}>Details View</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      //   </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView>
        <View style={styles.fullView}>
          <View style={styles.horizontalView}>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose class:</Text>
              <View>
                <MultiSelect
                  hideTags
                  styleDropdownMenuSubsection={{
                    borderColor: '#ededed',
                    borderWidth: 1,
                    marginRight: 5,
                    height: 40,
                    marginLeft: 5,
                    marginTop: 7,
                  }}
                  items={ClassDropdownData}
                  uniqueKey="value"
                  onSelectedItemsChange={item => {
                    setclassId(item);
                    getMultiDivisions(item);
                  }}
                  selectText=""
                  selectedItems={classId}
                  searchInputPlaceholderText="Class"
                  onChangeInput={text => console.log(text)}
                  tagRemoveIconColor="#CCC"
                  tagBorderColor="#CCC"
                  tagTextColor="black"
                  selectedItemTextColor="#13C0CE"
                  selectedItemIconColor="#13C0CE"
                  itemTextColor="#000"
                  displayKey="label"
                  searchInputStyle={{color: '#CCC'}}
                  submitButtonColor="#13C0CE"
                  submitButtonText="Submit"
                  itemFontSize={16}
                  fontSize={16}
                  onClearSelector={() => getMultiDivisions()}
                  onConfirm={() => getMultiDivisions()}
                />
              </View>
            </View>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose Division:</Text>
              <MultiSelect
                hideTags
                styleDropdownMenuSubsection={{
                  borderColor: '#ededed',
                  borderWidth: 1,
                  height: 40,
                  marginLeft: 5,
                  marginRight: 5,
                  marginTop: 7,
                }}
                items={DivisionDropdownData}
                uniqueKey="value"
                onSelectedItemsChange={item => {
                  if (item[item.length - 1] === 0) {
                    setSelectAllDivision(true);
                    let dropSelect = [];
                    DivisionDropdownData.map(items => {
                      dropSelect.push(items.value);
                    });
                    setBranchClassId(dropSelect);
                  } else if (selectAllDivision === true) {
                    if (item[0] === 0) {
                      let drop = [];
                      item.map(val => {
                        if (val !== 0) {
                          drop.push(val);
                        }
                      });
                      setBranchClassId(drop);
                      setSelectAllDivision(false);
                    } else {
                      setBranchClassId('');
                      setSelectAllDivision(false);
                    }
                  } else {
                    setBranchClassId(item);
                    setSelectAllDivision(false);
                  }
                }}
                selectText=""
                selectedItems={BranchClassId}
                searchInputPlaceholderText="Divisions"
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="black"
                containerStyle={styles.pickerStyle}
                selectedItemTextColor="#13C0CE"
                selectedItemIconColor="#13C0CE"
                itemTextColor="#000"
                displayKey="label"
                searchInputStyle={{color: '#CCC'}}
                submitButtonColor="#13C0CE"
                submitButtonText="Submit"
                itemFontSize={16}
                fontSize={16}
                onConfirm={() => {
                  console.log('clickedHere');
                }}
              />
            </View>
          </View>
          <View style={styles.horizontalView}>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>From date:</Text>
              <View style={styles.pickerStyle}>
                <Pressable onPress={() => setFromDateVisible(true)}>
                  <View style={styles.datePicker}>
                    <Text style={styles.datePickerText}>{fromDate}</Text>
                  </View>
                </Pressable>
                <DateTimePickerModal
                  isVisible={FromDateVisible}
                  mode="date"
                  onCancel={() => hidePicker('FromDate')}
                  onConfirm={date => handleConfirm('FromDate', date)}
                />
              </View>
            </View>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose To Date:</Text>

              <View style={styles.pickerStyle}>
                <Pressable onPress={() => setToDateVisible(true)}>
                  <View style={styles.datePicker}>
                    <Text style={styles.datePickerText}>{toDate}</Text>
                  </View>
                </Pressable>
                <DateTimePickerModal
                  onCancel={() => hidePicker('ToDate')}
                  onConfirm={date => handleConfirm('ToDate', date)}
                  isVisible={ToDateVisible}
                  mode="date"
                />
              </View>
            </View>
          </View>
          <View style={styles.horizontalView}>
            <View style={styles.verticalView}>
              <Text style={styles.textStyle1}>Choose Type:</Text>
              <Dropdown
                icon="chevron-down"
                baseColor="transparent"
                underlineColor="transparent"
                containerStyle={styles.pickerStyle}
                data={PaidCheckDropDownData}
                value={PaidCheckDropDownValue}
                onChangeText={value => {
                  setPaidCheckDropDownValue(value);
                }}
              />
            </View>

            <View style={styles.button}>
              <Pressable onPress={() => onSubmitClick()}>
                <Text style={styles.buttonText}>SUBMIT</Text>
              </Pressable>
            </View>
          </View>

          {dataerror ? (
            <Text style={styles.notDataText}>No fees details found.</Text>
          ) : (
            CardView()
          )}
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  noDataView: {
    marginTop: wp('22%'),
    alignItems: 'center',
  },
  //submit button not working
  cardView: {
    borderWidth: wp('0.5%'),
    borderColor: '#CCC',

    shadowOpacity: Platform.OS === 'ios' ? 0 : 0.3,

    borderRadius: wp('1.5%'),
    paddingLeft: wp('2%'),
    paddingRight: wp('2%'),
    paddingTop: 4,
    paddingBottom: 5,
    marginTop: 20,
    marginLeft: 4,
    marginRight: 4,
  },
  notDataText: {
    fontSize: wp('5%'),
    marginTop: wp('5%'),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    borderRightWidth: wp('0.5%'),
    borderRightColor: '#FFFFFF',
  },
  flatlistTitle: {
    flexDirection: 'row',
    height: wp('11%'),
    backgroundColor: '#BA69C8',
    elevation: 3,
  },
  titleText1: {
    justifyContent: 'center',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: wp('3.5%'),
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: wp('3.5%'),
  },
  textcontainone: {
    flex: 1,
    backgroundColor: '#B866C6',
    justifyContent: 'center',
  },
  textcontaintwo: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#B866C6',
    alignItems: 'center',
  },
  textcontainthree: {
    flex: 3,
    backgroundColor: '#B866C6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textcontentone: {
    borderRightWidth: wp('3.5%'),
    borderRightColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontenttwo: {
    borderRightWidth: wp('0.4%'),
    borderRightColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontentthree: {
    flex: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  itemStyle: {
    flexDirection: 'row',
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#E0E0E0',
  },

  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('20%'),
    height: 60,
    backgroundColor: '#4CB050',
    borderRadius: 30,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },

  fabView: {
    justifyContent: 'flex-end',
  },

  flatlistStyle: {
    flex: 1,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  line2: {
    borderRightWidth: 1,
    borderRightColor: 'grey',
  },
  item2: {
    marginLeft: 10,
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
    paddingTop: wp('0.7%'),
  },
  touchableView: {
    flexDirection: 'row',
  },
  pickerView: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        borderColor: 'grey',
        // backgroundColor: 'blue',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
      ios: {
        flex: 1,
        marginRight: 10,
      },
    }),
  },
  pickerStyle: {
    ...Platform.select({
      android: {
        paddingTop: wp('1.5%'),
        borderWidth: wp('0.3%'),
        borderColor: 'grey',
        // backgroundColor: 'yellow',
        height: wp('10%'),
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: wp('1.5%'),
        paddingLeft: wp('1.5%'),
        marginRight: wp('1.5%'),
        marginBottom: wp('1.5%'),
      },
      ios: {
        paddingTop: wp('3.5%'),
        borderWidth: wp('0.3%'),
        borderColor: 'grey',
        height: wp('9%'),
        justifyContent: 'center',
        borderRadius: 3,
        marginLeft: wp('1.5%'),
        paddingLeft: wp('1.5%'),
        marginRight: wp('1.5%'),
        marginBottom: wp('1.5%'),
      },
    }),
  },
  textStyle1: {
    marginLeft: wp('1.5%'),
    marginBottom: wp('1.5%'),
    // backgroundColor: 'red',
  },

  button: {
    height: wp('10.5%'),
    width: wp('37%'),
    marginTop: wp('8%'),
    justifyContent: 'center',
    // alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 3,
    marginLeft: wp('1.5%'),
    marginRight: wp('1.5%'),
    backgroundColor: '#17BED0',
    marginBottom: wp('1.5%'),
  },
  DetailsViewbutton: {
    paddingHorizontal: wp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,

    backgroundColor: '#0693e3',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  hideText: {
    marginLeft: 5,
    marginBottom: 5,
    color: 'white',
  },
  datePicker: {
    height: wp('10%'),
    justifyContent: 'center',
    borderRadius: 3,
    marginLeft: wp('0%'),
    // marginRight: 5,
  },
  buttonstyle: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    right: 30,
    bottom: 20,
  },
  topcontentimagelogo: {
    height: 30,
    width: 30,
  },
  containertop: {
    elevation: 3,
    height: 100,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CB050',
  },
  containertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  dashtext: {
    marginLeft: 10,
    fontSize: 18,
    color: '#FFFFFF',
  },
  fullView: {
    flex: 1,
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    paddingTop: wp('3%'),
    paddingBottom: wp('3.5%'),
  },
});

export default AdminFeeFirstScreen;
