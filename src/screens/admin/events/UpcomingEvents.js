import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  View,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {CheckBox} from 'react-native-elements';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const PastEvents = () => {
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  const [parentChecked, setparentChecked] = useState(true);
  const [teacherChecked, setteacherChecked] = useState(true);
  const [otherChecked, setotherChecked] = useState(true);
  const [fromDate, setfromDate] = useState('');
  const [toDate, settoDate] = useState('');
  const [startTime, setstartTime] = useState('');
  const [endTime, setendTime] = useState('');
  const [sendNoteTitle, setsendNoteTitle] = useState('');
  const [sendNoteDescription, setsendNoteDescription] = useState('');
  const [isModalVisible, setisModalVisible] = useState(false);
  const [FromDateVisible, setFromDateVisible] = useState(false);
  const [ToDateVisible, setToDateVisible] = useState(false);
  const [FromTimeVisible, setFromTimeVisible] = useState(false);
  const [ToTimeVisible, setToTimeVisible] = useState(false);
  const [formattedToDate, setformattedToDate] = useState('');
  const [formattedFromDate, setformattedFromDate] = useState('');
  let username = '';
  let to = '';

  useEffect(() => {
    getUpcmgevent();
  }, []);

  const sendNote = () => {
    if (sendNoteTitle === '' || sendNoteDescription === '') {
      Alert.alert('Please fill all details!');
    } else {
      if (
        teacherChecked === true &&
        parentChecked !== true &&
        otherChecked !== true
      ) {
        to = 'ROL_005';
      } else if (
        parentChecked === true &&
        teacherChecked !== true &&
        otherChecked !== true
      ) {
        to = 'ROL_004';
      } else if (
        parentChecked === true &&
        teacherChecked === true &&
        otherChecked !== true
      ) {
        to = 'ROL_004,ROL_005';
      } else if (
        teacherChecked !== true &&
        parentChecked !== true &&
        otherChecked === true
      ) {
        to = 'ROL_006';
      } else if (
        teacherChecked === true &&
        parentChecked !== true &&
        otherChecked === true
      ) {
        to = 'ROL_005,ROL_006';
      } else if (
        teacherChecked !== true &&
        parentChecked === true &&
        otherChecked === true
      ) {
        to = 'ROL_004,ROL_006';
      } else if (
        teacherChecked === true &&
        parentChecked === true &&
        otherChecked === true
      ) {
        to = 'ROL_004,ROL_005,ROL_006';
      } else {
        to = '';
      }
      let branchId = '';
      AsyncStorage.getItem('BranchID').then(BranchID => {
        branchId = BranchID;
      });
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          username = keyValue;
          const title = sendNoteTitle.replace(/&/g, '&amp;');
          const description = sendNoteDescription.replace(/&/g, '&amp;');
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=InsertEvents`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <InsertEvents xmlns="http://www.m2hinfotech.com//">
                  <senderNo>${username}</senderNo>
                  <branchId>${branchId}</branchId>
                  <roleId>${to}</roleId>
                  <startDate>${formattedFromDate}</startDate>
                  <endDate>${formattedToDate}</endDate>
                  <startTime>${startTime}</startTime>
                  <endTime>${endTime}</endTime>
                  <title>${title}</title>
                  <description>${description}</description>
                </InsertEvents>
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
              const ccc =
                xmlDoc.getElementsByTagName('InsertEventsResult')[0]
                  .childNodes[0].nodeValue;
              if (ccc === 'failure') {
                Alert.alert('Oops! Something unexpected happened!');
                setisModalVisible(false);
              } else if (ccc === 'Success') {
                Alert.alert(
                  'Success!',
                  'The event has been created successfully!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setisModalVisible(false);
                        getUpcmgevent();
                        // this.setState(
                        //   {
                        //     isVisble: true,
                        //     // dataSource: output,
                        //     text_to: 'to',
                        //     nodata: true,
                        //     // upcmgEventLoading: false,
                        //     isModalVisible: false,
                        //     isModalVisible2: false,
                        //   },
                        //   () => {
                        //     this.getUpcmgevent();
                        //   },
                        // );
                      },
                    },
                  ],
                  {cancelable: false},
                );

                setisModalVisible(false);
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
    }
  };

  const getUpcmgevent = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      let branchId = BranchID;
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          username = keyValue; //Display key value
          const string = 'new';
          fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetAllEvents`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <GetAllEvents xmlns="http://www.m2hinfotech.com//">
                  <mobileNo>${username}</mobileNo>
                  <BranchID>${branchId}</BranchID>
                  <status>${string}</status>
                </GetAllEvents>
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
              setloading(false);
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response);
              const ccc =
                xmlDoc.getElementsByTagName('GetAllEventsResult')[0]
                  .childNodes[0].nodeValue;
              if (ccc === 'failure') {
                setdataerror(true);
              } else {
                const output = JSON.parse(ccc);
                setdata(output);
              }
            })
            .catch(error => {
              setloading(false);
              setdataerror(true);
            });
        },
        error => {
          console.log(error); //Display error
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
      case 'FromTime':
        setstartTime(moment(date).format('hh:mm A'));
        setFromTimeVisible(false);
        break;
      case 'ToTime':
        setendTime(moment(date).format('hh:mm A'));
        setToTimeVisible(false);
        break;

      default:
        break;
    }
  };
  const hidePicker = value => {
    switch (value) {
      case 'FromDate':
        setFromDateVisible(false);
        break;
      case 'ToDate':
        setToDateVisible(false);

        break;
      case 'FromTime':
        setFromTimeVisible(false);
        break;
      case 'ToTime':
        setToTimeVisible(false);
        break;

      default:
        break;
    }
  };
  const checkboxPress = value => {
    switch (value) {
      case 'parents':
        setparentChecked(!parentChecked);

        break;
      case 'teachers':
        setteacherChecked(!teacherChecked);
        break;
      case 'others':
        setotherChecked(!otherChecked);
        break;
      // case 'sendSms':
      // this.setState({
      //   sendSms: !this.state.sendSms
      // });
      // break;

      default:
        break;
    }
  };
  return (
    <View style={styles.container}>
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={styles.notDataText}>No data found.</Text>
          ) : (
            <>
              <View style={styles.teachercontainermiddel}>
                <View style={styles.textcontaineone}>
                  <Text style={styles.textc}>DATE</Text>
                </View>
                <View style={styles.textcontaintwo}>
                  <Text style={styles.texthead}>EVENT DETAILS</Text>
                </View>
                <View style={styles.textcontainthree}>
                  <Text style={styles.textc}>TIME</Text>
                </View>
              </View>
              <View style={styles.esscontainerbottom}>
                {/* <View style={styles.flatlistStyle}> */}
                <FlatList
                  keyExtractor={(item, index) => index}
                  data={data}
                  renderItem={({item}) => (
                    <View style={styles.itemStyle}>
                      <View style={styles.itemone}>
                        <Text style={styles.item}>{item.StartDate}</Text>
                        <Text style={styles.item}>to</Text>
                        <Text style={styles.item}>{item.EndDate}</Text>
                      </View>
                      <View style={styles.itemtwo}>
                        <Text style={styles.itemTitle}>{item.EventName}</Text>
                        <Text style={styles.itemDesc}>{item.Description}</Text>
                      </View>
                      <View style={styles.itemthree}>
                        <Text style={styles.item}>{item.StartTime}</Text>
                        <Text style={styles.item}>to</Text>
                        <Text style={styles.item}>{item.EndTime} </Text>
                      </View>
                    </View>
                  )}
                />
              </View>
              {/* </View> */}
            </>
          )}
        </View>
      )}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => {
          Keyboard.dismiss();
        }}>
        <SafeAreaView style={{flex: 1}}>
          <ScrollView keyboardShouldPersistTaps="always">
            <KeyboardAvoidingView
              style={{flex: 1}}
              behavior="padding"
              keyboardVerticalOffset={10}>
              <View style={styles.ModalContainer}>
                <View style={styles.containerColoum}>
                  <Text style={styles.Modaltext}>Event For:</Text>

                  <View style={{width: '50%', flexDirection: 'row'}}>
                    <View style={{marginLeft: -20}}>
                      <CheckBox
                        title="Parents"
                        textStyle={{fontSize: 12, fontStyle: 'normal'}}
                        containerStyle={{
                          backgroundColor: 'white',
                          borderColor: 'white',
                        }}
                        size={16}
                        onPress={() => checkboxPress('parents')}
                        checked={parentChecked}
                      />
                    </View>
                    <View style={{marginLeft: -20}}>
                      <CheckBox
                        size={16}
                        onPress={() => checkboxPress('teachers')}
                        containerStyle={{
                          backgroundColor: 'white',
                          borderColor: 'white',
                        }}
                        textStyle={{fontSize: 12, fontStyle: 'normal'}}
                        title="Teachers"
                        checked={teacherChecked}
                      />
                    </View>
                    <View style={{marginLeft: -20}}>
                      <CheckBox
                        size={16}
                        onPress={() => checkboxPress('others')}
                        containerStyle={{
                          backgroundColor: 'white',
                          borderColor: 'white',
                        }}
                        textStyle={{fontSize: 12, fontStyle: 'normal'}}
                        title="Others"
                        checked={otherChecked}
                      />
                    </View>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>From Date</Text>
                      <Pressable onPress={() => setFromDateVisible(true)}>
                        <Text style={styles.textInput1in3creat}>
                          {fromDate}
                        </Text>
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={FromDateVisible}
                        mode="date"
                        onCancel={() => hidePicker('FromDate')}
                        onConfirm={date => handleConfirm('FromDate', date)}
                        minimumDate={new Date()}
                      />
                    </View>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>To Date</Text>
                      <Pressable onPress={() => setToDateVisible(true)}>
                        <Text style={styles.textInput1in3creat}>{toDate}</Text>
                      </Pressable>
                      <DateTimePickerModal
                        onCancel={() => hidePicker('ToDate')}
                        onConfirm={date => handleConfirm('ToDate', date)}
                        isVisible={ToDateVisible}
                        mode="date"
                      />
                    </View>
                  </View>
                  <View style={styles.ViewInRowcreat}>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>Start Time</Text>
                      <Pressable onPress={() => setFromTimeVisible(true)}>
                        <Text style={styles.textInput1in3creat}>
                          {startTime}
                        </Text>
                      </Pressable>

                      <DateTimePickerModal
                        isVisible={FromTimeVisible}
                        mode="time"
                        onCancel={() => hidePicker('FromTime')}
                        onConfirm={date => handleConfirm('FromTime', date)}
                      />
                    </View>
                    <View style={styles.ViewCol1in3creat}>
                      <Text style={styles.textcreat}>End Time</Text>
                      <Pressable onPress={() => setToTimeVisible(true)}>
                        <Text style={styles.textInput1in3creat}>{endTime}</Text>
                      </Pressable>

                      <DateTimePickerModal
                        isVisible={ToTimeVisible}
                        mode="time"
                        onCancel={() => hidePicker('ToTime')}
                        onConfirm={date => handleConfirm('ToTime', date)}
                      />
                    </View>
                  </View>
                  <Text style={styles.Modaltext}>Event Title</Text>
                  <TextInput
                    style={styles.textinputtitleView}
                    // maxLength={30}
                    //  placeholder="max words 30"
                    underlineColorAndroid="transparent"
                    // returnKeyType="next"
                    // onSubmitEditing={() => this.detail.focus()}
                    onChangeText={text => setsendNoteTitle(text)}
                  />
                  <Text style={styles.Modaltext}>Details</Text>
                  <TextInput
                    // maxLength={300}
                    style={styles.TextInputContainer}
                    underlineColorAndroid="transparent"
                    multiline={true}
                    textAlignVertical={'top'}
                    // returnKeyType="next"
                    // onSubmitEditing={() => this.detail.focus()}
                    // ref={(input) => (this.detail = input)}
                    onChangeText={text => setsendNoteDescription(text)}
                  />
                  {/* <View style={{marginLeft: -20, marginBottom: -15}}>
   <CheckBox
     title='Send SMS'
     textStyle={{fontSize:12, fontStyle:'normal'}}
     containerStyle={{backgroundColor:'white',borderColor:'white'}}
     size={16}
     onPress={()=>this.checkboxPress('sendSms')}
     checked={this.state.sendSms}
   />
   </View> */}
                  <View style={styles.Buttoncontainer}>
                    <Pressable
                      onPress={() => sendNote('empty')}
                      style={styles.ModalButtonLeft}>
                      <Text style={styles.MOdalButtontext}>CREATE</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setisModalVisible(false)}
                      style={styles.MOdalButtonRight}>
                      <Text style={styles.MOdalButtontext}>CANCEL</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Pressable
        style={styles.buttonstyle}
        onPress={() => setisModalVisible(true)}>
        <View>
          <Icon name="plus" size={25} color="white" />
        </View>
      </Pressable>
    </View>
  );
};

export default PastEvents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  noDataView: {
    marginTop: wp('22%'),
    alignItems: 'center',
  },
  notDataText: {
    fontSize: wp('5%'),
    textAlign: 'center',
  },
  teachercontainermiddel: {
    //check
    width: wp('100%'),
    height: wp('15.5%'),
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderBottomWidth: wp('0.7%'),
    borderBottomColor: '#E0E0E0',
  },
  textcontaineone: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp('0.3%'),
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  textcontainthree: {
    flex: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp('0.3%'),
  },
  texthead: {
    fontSize: wp('5%'),
    color: '#BA69C8',
    marginLeft: wp('3.5%'),
  },
  textc: {
    fontSize: wp('5%'),
    color: '#BA69C8',
  },
  ///////faltlist styles/////////////
  esscontainerbottom: {
    // flex: 7,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  flatlistStyle: {
    flex: 1,
  },
  itemStyle: {
    flexDirection: 'row',
    borderBottomWidth: wp('0.3%'),
    borderBottomColor: '#D3D3D3',
  },
  item: {
    flex: 1,
    fontSize: wp('4.2%'),
    textAlign: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: wp('4.2%'),
    textAlign: 'center',
    marginLeft: wp('3.5%'),
  },
  itemDesc: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: wp('3.5%'),
    marginLeft: wp('3.5%'),
  },
  itemone: {
    flexDirection: 'column',
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },

  itemthree: {
    flexDirection: 'column',
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: wp('0.3%'),
    borderColor: '#D3D3D3',
  },
  buttonstyle: {
    position: 'absolute',
    height: wp('16%'),
    width: wp('16%'),
    borderRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
    shadowOpacity: 0.2,
    borderColor: '#4CB050',
    backgroundColor: '#4CB050',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    right: wp('9%'),
    bottom: wp('7%'),
  },
  topcontentimagelogo: {
    height: 30,
    width: 30,
  },
  ModalContainer: {
    // flexGrow: 0.5,
    // flex: 1,
    padding: wp('3.5%'),
    height: hp('90%'),
    backgroundColor: '#FFFFFF',
  },
  Modaltext: {
    flexGrow: 0.01,
  },
  ModalButtonLeft: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('1.5%'),
  },
  MOdalButtonRight: {
    backgroundColor: '#607D8B',
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('2%'),
  },
  MOdalButtontext: {
    color: '#FFFFFF',
    fontSize: wp('5%'),
    fontWeight: '200',
  },
  textFlewWrap: {
    flexWrap: 'wrap',
    marginLeft: wp('7%'),
  },

  textinputtitleView: {
    height: wp('11%'),
    borderWidth: 0.5,
    borderRadius: wp('1.5%'),
    marginBottom: wp('1.5%'),
  },
  TextInputContainer: {
    height: wp('50%'),
    borderWidth: wp('0.2%'),
    borderRadius: 5,
  },
  Buttoncontainer: {
    height: wp('10%'),
    marginTop: wp('3.2%'),
    // flex: 1,
    width: wp('83%'),
    flexDirection: 'row',
  },
  ViewCol1in3creat: {
    flexDirection: 'column',
    flex: 0.5,
  },
  ViewInRowcreat: {
    flexDirection: 'row',
    paddingBottom: wp('1.5%'),
  },
  textInput1in3creat: {
    height: wp('9%'),
    paddingLeft: wp('0.6%'),
    paddingTop: wp('1.5%'),
    borderWidth: wp('0.3%'),
    borderRadius: wp('1.5%'),
    marginRight: wp('1.5%'),
  },
  textInput1in3creat2: {
    height: wp('9%'),
    borderWidth: wp('0.2%'),
    borderRadius: wp('1.5%'),
    marginLeft: wp('1.5%'),
    paddingLeft: wp('0.7%'),
    paddingTop: wp('9%'),
  },
});
