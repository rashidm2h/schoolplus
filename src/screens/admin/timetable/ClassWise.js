import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
  Text,
  View,
} from 'react-native';
// import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const ClassWise = () => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [data, setdata] = useState('');
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [branch, setbranch] = useState('');
  let branchId = '';
  let username = '';

  useEffect(() => {
    getClass();
  }, []);
  useEffect(() => {
    if (dropdownValue !== '') {
      console.log('get');
      getDivisions();
    }
  }, [dropdownValue]);

  const getClass = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
      setbranch(BranchID);
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          let mobile = keyValue; //Display key value
          fetch(`${GLOBALS.PARENT_URL}GetAllClasses`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
              <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                  <GetAllClasses xmlns="http://www.m2hinfotech.com//">
                    <mobileNo>${mobile}</mobileNo>
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
              console.log(ccc);

              if (ccc === 'failure') {
              } else {
                const clsattpick = JSON.parse(ccc);
                let attnsclsdefault = clsattpick[0].BranchClassId;
                let dropdownData = clsattpick;
                const dropData = dropdownData.map(element => ({
                  value: element.class_Id,
                  label: element.Class_name,
                }));
                setdropdownSource(dropData);
                setdropdownValue(dropdownData[0].class_Id);
                getDivisions();
              }
            });
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const getDivisions = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        username = keyValue; //Display key value
        fetch(`${GLOBALS.PARENT_URL}GetDivisions`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetDivisions xmlns="http://www.m2hinfotech.com//">
          <BranchID>${branch}</BranchID>
          <classId>${dropdownValue}</classId>
        </GetDivisions>
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
            const ccc =
              xmlDoc.getElementsByTagName('GetDivisionsResult')[0].childNodes[0]
                .nodeValue;
            console.log('cc', ccc);
            if (ccc === 'failure') {
            } else {
              const output = JSON.parse(ccc);
              console.log('data', output);
              let dropdownData = output;
              const dropData = dropdownData.map(element => ({
                value: element.BranchClassId,
                label: element.DivCode,
              }));
              setdropdownSource1(dropData);
              setdropdownValue1(dropdownData[0].BranchClassId);
              TimeTableData(dropdownData[0].BranchClassId);
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
  };

  const TimeTableData = value => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('BranchID').then(keyValue2 => {
          const SchoolBranch = keyValue2;
          fetch(`${GLOBALS.PARENT_URL}GetClassWiseTimeTable_Admin`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
        <GetClassWiseTimeTable_Admin xmlns="http://www.m2hinfotech.com//">
          <branchClassId>${value}</branchClassId>
          <branchId>${keyValue2}</branchId>
        </GetClassWiseTimeTable_Admin>
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
                'GetClassWiseTimeTable_AdminResult',
              )[0].childNodes[0].nodeValue;
              console.log(v);
              if (v === 'failure') {
              }
              const rslt = JSON.parse(v);
              setdata(rslt);
            })
            .catch(error => {
              console.log(error);
            });
        });
      },
      error => {
        console.log(error); //Display error
      },
    );
  };

  return (
    <View style={styles.container}>
      {/* <View style={{flexDirection: 'row'}}> */}
      <View style={styles.horizontalView}>
        <View style={styles.verticalView}>
          <Text style={styles.textStyle1}>Class:</Text>

          {/* <Dropdown
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            containerStyle={styles.pickerStyle1}
            data={dropdownSource}
            value={dropdownValue}
            onChangeText={value => {
              setdropdownValue(value);
              getDivisions();
            }}
          /> */}
        </View>
        <View style={styles.verticalView}>
          <Text style={styles.textStyle1}>Division:</Text>
          {/* <Dropdown
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            containerStyle={styles.pickerStyle1}
            data={dropdownSource1}
            value={dropdownValue1}
            onChangeText={value => {
              setdropdownValue1(value);
              TimeTableData(value);
            }}
          /> */}
        </View>
      </View>
      {/* </View> */}
      <View style={styles.containerTableTop}>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>Days</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>1</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>2</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>3</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>4</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>5</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>6</Text>
        </View>
        <View style={styles.textWhiteBox}>
          <Text style={styles.textwhite}>7</Text>
        </View>
        <View style={styles.textWhiteBoxLast}>
          <Text style={styles.textwhite}>8</Text>
        </View>
      </View>

      <View style={styles.containerTableBottom}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={data}
          renderItem={({item}) => (
            <View style={styles.containerTableBottomRow}>
              <View style={styles.textBox}>
                <Text style={styles.textBlack}>{item.Dayname.slice(0, 3)}</Text>
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period1}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass1}
										</Text> */}
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period2}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass2}
										</Text> */}
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period3}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass3}
										</Text> */}
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period4}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass4}
										</Text> */}
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period5}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass5}
										</Text> */}
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period6}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass6}
										</Text> */}
              </View>
              <View style={styles.textBox}>
                <Text style={styles.textRed}>{item.Period7}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass7}
										</Text> */}
              </View>
              <View style={styles.textBoxLast}>
                <Text style={styles.textRed}>{item.Period8}</Text>
                {/* <Text style={styles.textBlue}>
											{item.PeriodClass8}
										</Text> */}
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default ClassWise;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  noDataView: {
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  containerTableTop: {
    flex: 1,
    flexDirection: 'row',
    elevation: 3,
    backgroundColor: '#AF67BD',
  },
  textWhiteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
  },
  textWhiteBoxLast: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },

  textBox: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    // padding: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  textBoxLast: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#C7C7C7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  containerTableBottom: {
    flex: 9,
    flexDirection: 'column',
  },
  containerTableBottomRow: {
    flex: 1,
    // height: 60,
    flexDirection: 'row',
  },
  textwhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#868686',
  },
  textRed: {
    color: '#C8717F',
    textAlign: 'center',
    fontSize: 12,
    paddingLeft: 2,
    paddingRight: 1,
    alignSelf: 'center',
  },
  textBlue: {
    color: '#77728B',
  },
  pickerStyle: {
    height: 40,
    margin: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 15,
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 3,
  },
  pickerStyle1: {
    ...Platform.select({
      android: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 35,
        justifyContent: 'center',
        borderRadius: 3,
        paddingLeft: 5,
        marginLeft: 5,
        marginRight: 5,
        paddingTop: 10,
        marginBottom: 5,
      },
      ios: {
        borderWidth: 0.5,
        borderColor: 'grey',
        height: 30,
        paddingTop: 10,
        justifyContent: 'center',
        borderRadius: 3,
        paddingLeft: 5,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
      },
    }),
  },
  horizontalView: {
    flexDirection: 'row',
  },
  verticalView: {
    flexDirection: 'column',
    flex: 1,
  },
  textStyle1: {
    marginLeft: 5,
    marginBottom: 5,
  },
});
