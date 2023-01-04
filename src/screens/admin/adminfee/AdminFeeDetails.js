import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Text,
  ScrollView,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';
import Header from '../../../components/Header';

const AdminFeeDetails = ({navigation, route}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState([]);

  useEffect(() => {
    getClassFeeDetails();
  }, []);

  const getClassFeeDetails = () => {
    let arrayDivision = route.params.BranchClassId;

    let branchJoined = '';

    if (arrayDivision.length !== 0) {
      branchJoined = arrayDivision.join();
    }
    let SbranchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      SbranchId = BranchID;
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          fetch(`${GLOBALS.PARENT_URL}GetClassFeeTotalDetailed`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <GetClassFeeTotalDetailed xmlns="http://www.m2hinfotech.com//">
                 <BranchClassId>${branchJoined}</BranchClassId>
                <BranchId>${SbranchId}</BranchId>
  <PaidStatus>${route.params.PaidCheckDropDownValue}</PaidStatus>
  <FromDate>${route.params.formattedFromDate}</FromDate>
  <ToDate>${route.params.formattedToDate}</ToDate>
              </GetClassFeeTotalDetailed>
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
                'GetClassFeeTotalDetailedResult',
              )[0].childNodes[0].nodeValue;

              const output = JSON.parse(Data);
              const details = [];
              output.map(item => {
                details.push({
                  slNo: item.StudentId,
                  Name: item.Name,
                  Class: item.Class,
                  Division: item.Division,
                  Feename: item.FeeName,
                  TimePeriod: item.TimePeriod,
                  FeeAmount: item.FeeAmount,
                  AmountPaid: item.AmountPaid,
                  CurrentDue: item.CurrentDue,
                  LastDateOfPay: item.LastDateOfPay,
                  Status: item.Status,
                });
              });
              setdata(details);
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

  const FlatlistHeader = () => {
    return (
      <View style={styles.flatlistTitle}>
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText2}>Id</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Name</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Class</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Division</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Feename</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>TimePeriod</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Fee Amount</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Amount Paid</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Current Due</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Last Date</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.textcontainthree}>
          <Text style={styles.titleText3}>Status</Text>
        </View>
      </View>
    );
  };

  const showAttendanceDetailedReport = () => {
    return (
      <ScrollView>
        <View style={styles.teamReportView}>
          <ScrollView
            horizontal
            contentContainerStyle={[
              styles.scrollStyle,
              {
                //   backgroundColor: 'red',
                //   paddingBottom: '30%',
              },
            ]}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              stickyHeaderIndices={[0]}
              ListHeaderComponent={FlatlistHeader}
              renderItem={({item}) => (
                <View style={styles.attendanceDataViewStyle}>
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.slNo}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.Name}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.Class}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.Division}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.Feename}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.TimePeriod}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.FeeAmount}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.AmountPaid}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.CurrentDue}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.LastDateOfPay}</Text>
                  </View>
                  <View style={styles.border} />
                  <View style={styles.textcontainthree}>
                    <Text style={styles.textStyle}>{item.Status}</Text>
                  </View>
                  <View style={styles.border} />
                </View>
              )}
            />
          </ScrollView>
        </View>
      </ScrollView>
    );
  };
  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      {!loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={{textAlign: 'center'}}> No data found!</Text>
          ) : (
            <>{showAttendanceDetailedReport()}</>
          )}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  attendanceDataViewStyle: {
    flexDirection: 'row',
    borderBottomColor: '#dcdcdc',
    borderBottomWidth: 0.5,
    flexGrow: 1,
  },
  line: {
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  border: {
    borderRightWidth: 1,
    borderRightColor: '#CCC',
  },
  flatlistTitle: {
    flexDirection: 'row',
    backgroundColor: '#BA69C8',
  },
  titleText2: {
    color: '#FFFFFF',
    marginLeft: 10,
    marginTop: 10,
  },
  scrollStyle: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  titleText3: {
    color: '#FFFFFF',
    marginLeft: 10,
    marginTop: 10,
  },
  textcontaintwo: {
    flex: 2,
  },
  textStyle: {
    fontSize: 15,
    paddingTop: '0.4%',
    // fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  textStyle2: {
    fontSize: 18,
    paddingTop: '0.4%',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  textcontainthree: {
    width: 95,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
  },

  itemStyle: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  textcontenttwo: {
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    // backgroundColor: 'red',
    width: '15%',
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },

  textcontentthree: {
    flex: 3,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    alignItems: 'flex-start',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  flatlistStyle: {
    // flex: 1,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  itemone: {
    flex: 2,
    paddingTop: 10,
    paddingBottom: 10,
    // alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 1.25,
    paddingTop: 10,
    paddingBottom: 10,
    // marginLeft: 10,
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  item: {
    marginLeft: 5,
  },
  teamReportView: {
    // flexDirection: 'column',
    flexGrow: 1,
    // flex: 1,
    // width: '100%',
    // backgroundColor: 'red',
  },
});
export default AdminFeeDetails;
