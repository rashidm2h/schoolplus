import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  Platform,
  Alert,
  Text,
  View,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {Dropdown} from 'react-native-material-dropdown-v2-fixed';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../config/Globals';
import Header from '../../components/Header';
import {widthPercentageToDP} from 'react-native-responsive-screen';
let avkexamIdStatus = true;
let avkexamId = '';

const Exam = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataSource, setdataSource] = useState('');
  const [SelectedExam, setSelectedExam] = useState('');
  const [dataSourceExamMark, setdataSourceExamMark] = useState('');
  const [keys, setkeys] = useState('');
  const [dropdownSource, setdropdownSource] = useState([]);
  const [dropdownValue, setdropdownValue] = useState('');
  const [dropdownSource1, setdropdownSource1] = useState([]);
  const [dropdownValue1, setdropdownValue1] = useState('');
  const [dropdownSource2, setdropdownSource2] = useState([]);
  const [dropdownValue2, setdropdownValue2] = useState('');
  const [isModalVisible, setisModalVisible] = useState(false);
  const [dataSourceAlert, setdataSourceAlert] = useState([]);
  const [avkExamType, setavkExamType] = useState('');
  let domain = '';
  let stdId = '';
  useEffect(() => {
    getClasses();
  }, []);

  useEffect(() => {
    getDivisions();
  }, [dropdownValue]);

  useEffect(() => {
    getList();
  }, [dropdownValue1]);

  const getClasses = () => {
    let username = '';
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });

    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        username = keyValue; //Display key value
        console.log('branch', branchId);
        fetch(`${GLOBALS.PARENT_URL}GetAllClasses`, {
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
            console.log('cc', ccc);
            if (ccc === 'failure') {
              Alert.alert('', 'It seems like you have no access to any class!');
            } else {
              const output = JSON.parse(ccc);
              let dropdownData = output;
              const dropData = dropdownData.map(element => ({
                value: element.class_Id,
                label: element.Class_name,
              }));
              setdropdownSource(dropData);
              setdropdownValue(dropdownData[0].class_Id);
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

  const getDivisions = classId => {
    let username = '';
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });

    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        username = keyValue; //Display key value
        console.log('branch', branchId);
        fetch(`${GLOBALS.PARENT_URL}GetDivisions`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <GetDivisions xmlns="http://www.m2hinfotech.com//">
          <BranchID>${branchId}</BranchID>
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
              // this.getExams();
              const output = JSON.parse(ccc);
              console.log('data', output);
              let dropdownData = output;
              const dropData = dropdownData.map(element => ({
                value: element.BranchClassId,
                label: element.DivCode,
              }));
              setdropdownSource1(dropData);
              setdropdownValue1(dropdownData[0].BranchClassId);
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

  const getExams = () => {
    setavkExamType('avkpt');
    // this.setState({
    //     avkExamType: 'avkpt',
    //   });
    AsyncStorage.getItem('StdID').then(keyValue => {
      fetch(`${GLOBALS.PARENT_URL}ExamNamePtTerm`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <ExamNamePtTerm xmlns="http://www.m2hinfotech.com//" />
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
          const v = xmlDoc.getElementsByTagName('ExamNamePtTermResult')[0]
            .childNodes[0].nodeValue;
          if (v === 'failure') {
            setdataSource('');
          } else {
            const rslt = JSON.parse(v);
            const rslt1 = rslt[0].ExamNameId;
            if (rslt1 > 4) {
              setavkExamType('avkt');
            } else {
              setavkExamType('avkpt');
            }
            let dropdownData = rslt;
            const dropData = dropdownData.map(element => ({
              value: element.ExamNameId,
              label: element.Description,
            }));
            setdropdownSource2(dropData);
            setdropdownValue2(dropdownData[0].ExamNameId);
          }
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  const avkHeader = (item, exam, index) => {
    if (item !== avkexamId) {
      avkexamIdStatus = true;
      avkexamId = item;
    } else {
      avkexamIdStatus = false;
    }
    return item > 4 ? (
      <View>
        {dataSourceAlert[index !== 0 ? index - 1 : 0][keys[0]] !== item ||
        index === 0 ? (
          <View>
            <View
              style={{
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                backgroundColor: 'white',
              }}>
              <Text style={{fontSize: 16, color: '#B866C6'}}>{exam}</Text>
            </View>
            <View style={styles.topcontaineralert}>
              <View style={styles.textcontaineonealertoneSubject}>
                <Text style={styles.textalert}>{keys[2]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{keys[6]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={[styles.textalert, {fontSize: 12}]}>
                  {keys[7]}
                </Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{keys[8]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{keys[9]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{keys[10]}</Text>
              </View>
              <View style={styles.textcontaineonealertlast}>
                <Text style={styles.textalert}>Grade</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    ) : (
      <View>
        {dataSourceAlert[index !== 0 ? index - 1 : 0][keys[0]] !== item ||
        index === 0 ? (
          <View>
            <View
              style={{
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                backgroundColor: 'white',
              }}>
              <Text style={{fontSize: 16, color: '#B866C6'}}>{exam}</Text>
            </View>
            <View style={styles.topcontaineralert}>
              <View style={styles.textcontaineonealertoneSubject}>
                <Text style={styles.textalert}>{keys[2]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{keys[3]}</Text>
              </View>
              <View style={styles.textcontaineonealertone}>
                <Text style={styles.textalert}>{keys[4]}</Text>
              </View>
              <View style={styles.textcontaineonealertlast}>
                <Text style={styles.textalert}>{keys[5]}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const getList = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        let username = keyValue; //Display key value
        fetch(`${GLOBALS.TEACHER_URL}StdAttClasswiseList`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <StdAttClasswiseList xmlns="http://www.m2hinfotech.com//">
          <BranchclsId>${dropdownValue1}</BranchclsId>
        </StdAttClasswiseList>
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
              'StdAttClasswiseListResult',
            )[0].childNodes[0].nodeValue;
            console.log('cc', ccc);
            if (ccc === 'failure') {
              setdataSource('');
            } else {
              const output = JSON.parse(ccc);
              setdataSource(output);
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

  const pressAction = item => {
    try {
      AsyncStorage.setItem('StdID', item.StudId);
    } catch (error) {
      console.log(`somthing went wrong: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('AdminDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      <View style={styles.mainContainerTop}>
        <View style={styles.TwotextView}>
          <Text style={styles.textstyle}>Select Class:</Text>
          <Text style={styles.textstyle}>Select Division:</Text>
        </View>
        <View style={styles.classSelection}>
          {/* <Dropdown
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            containerStyle={styles.pickerStyle}
            data={dropdownSource}
            value={dropdownValue}
            onChangeText={value => {
              setdropdownValue(value);
            }}
          />
          <Dropdown
            icon="chevron-down"
            baseColor="transparent"
            underlineColor="transparent"
            containerStyle={styles.pickerStyle}
            data={dropdownSource1}
            value={dropdownValue1}
            onChangeText={value => {
              setdropdownValue1(value);
            }}
          /> */}
        </View>

        <View style={styles.containerTable}>
          <View style={styles.headingTableView}>
            <View style={styles.textcontaineone}>
              <Text style={styles.textc}>RL NO</Text>
            </View>
            <View style={styles.textcontaintwo}>
              <Text style={styles.textc}>STUDENT NAME</Text>
            </View>
            {/* <View style={styles.textcontainthree}>
  <Text style={styles.textc}>CLASS & DIV</Text>
  </View> */}
          </View>
          <View style={styles.flatlistView}>
            <FlatList
              data={dataSource}
              renderItem={({item}) => (
                <View style={styles.itemStyle}>
                  <View style={styles.itemone}>
                    <Text style={styles.item}>{item.RollNo}</Text>
                  </View>
                  <View style={styles.itemtwo}>
                    <Text style={styles.item}>{item.Name}</Text>
                  </View>
                  <View style={styles.itemthree}>
                    <Pressable
                      onPress={() => {
                        if (dropdownValue2 > 4) {
                          setavkExamType('avkt');
                          // this.setState({
                          //   avkExamType: 'avkt',
                          // });
                        } else {
                          setavkExamType('avkpt');
                          // this.setState({
                          //   avkExamType: 'avkpt',
                          // });
                        }
                        let branchId = '';

                        AsyncStorage.getItem('BranchID').then(BranchID => {
                          branchId = BranchID;
                          fetch(`${GLOBALS.PARENT_URL}RetrieveAllMarksheet`, {
                            method: 'POST',
                            body: `<?xml version="1.0" encoding="utf-8"?>
          <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
              <RetrieveAllMarksheet xmlns="http://www.m2hinfotech.com//">
                <studentId>${item.StudId}</studentId>
                <brnachId>${branchId}</brnachId>
              </RetrieveAllMarksheet>
            </soap12:Body>
          </soap12:Envelope>`,
                            headers: {
                              Accept: 'application/json',
                              'Content-Type':
                                'application/soap+xml; charset=utf-8',
                            },
                          })
                            .then(response => response.text())
                            .then(response => {
                              console.log(
                                `${GLOBALS.PARENT_URL}RetrieveAllMarksheet`,
                              );
                              console.log(`<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <RetrieveAllMarksheet xmlns="http://www.m2hinfotech.com//">
                  <studentId>${item.StudId}</studentId>
                  <brnachId>${branchId}</brnachId>
                </RetrieveAllMarksheet>
              </soap12:Body>
            </soap12:Envelope>`);
                              const parser = new DOMParser();
                              const xmlDoc = parser.parseFromString(response);
                              const v = xmlDoc.getElementsByTagName(
                                'RetrieveAllMarksheetResult',
                              )[0].childNodes[0].nodeValue;
                              console.log('v', v);
                              if (v === 'failure') {
                                Alert.alert(
                                  'No Results',
                                  'Results not published!',
                                );
                              } else {
                                const rslt = JSON.parse(v);
                                let keys = Object.keys(rslt[0]);
                                setkeys(keys);
                                setisModalVisible(true);
                                setdataSourceAlert(rslt);
                                // this.setState({
                                //   dataSourceAlert: rslt,
                                //   keys,
                                // },()=>{this._showModal();});
                              }
                            })
                            .catch(error => {
                              console.log(error);
                            });
                        });
                      }}>
                      <Text
                        style={{
                          backgroundColor: '#4CB050',
                          elevation: 5,
                          padding: 5,
                          borderRadius: 3,
                          color: 'white',
                        }}>
                        View Result
                      </Text>
                    </Pressable>
                  </View>
                  {/* <View style={styles.itemthree}>
  <Text style={styles.item}>
  {`${this.state.} ${item.DivCode}`}
  </Text>
  </View> */}
                </View>
              )}
              keyExtractor={(item, index) => index}
            />
          </View>
        </View>
        <Modal
          isVisible={isModalVisible}
          onBackButtonPress={() => setisModalVisible(false)}>
          <View style={styles.container}>
            <View style={styles.welcomeAlert}>
              <FlatList
                data={dataSourceAlert}
                renderItem={({item, index}) => (
                  <View style={styles.modalViewStyle}>
                    {avkHeader(item[keys[0]], item[keys[1]], index)}
                    <View style={styles.flatlistMarkTable}>
                      {item[keys[0]] > 4 ? (
                        <View style={styles.itemStylealert}>
                          <View style={styles.itemsoneAlertSubject}>
                            <Text style={styles.flatitem}>{item[keys[2]]}</Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>{item[keys[6]]}</Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>{item[keys[7]]}</Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>{item[keys[8]]}</Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>{item[keys[9]]}</Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>
                              {item[keys[10]]}
                            </Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>
                              {item[keys[11]]}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.itemStylealert}>
                          <View style={styles.itemsoneAlertSubject}>
                            <Text style={styles.flatitem}>
                              {avkExamType === 'avkpt'
                                ? item[keys[2]]
                                : item.SubName}
                            </Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>
                              {avkExamType === 'avkpt'
                                ? item[keys[3]]
                                : item.StudentMark}
                            </Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            <Text style={styles.flatitem}>
                              {avkExamType === 'avkpt'
                                ? item[keys[4]]
                                : item.MaxMark}
                            </Text>
                          </View>
                          <View style={styles.itemsoneAlert}>
                            {avkExamType === 'avkpt' ? (
                              <Text style={styles.flatitem}>
                                {!item[keys[5]]
                                  ? item[keys[5]]
                                  : String.prototype.trim.call(item[keys[5]])}
                              </Text>
                            ) : (
                              <Text style={styles.flatitem}>
                                {!item.GradeName
                                  ? item.GradeName
                                  : String.prototype.trim.call(item.GradeName)}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              />
              <View style={styles.closbuttonview}>
                <Pressable
                  style={styles.closebutton}
                  onPress={() => setisModalVisible(false)}>
                  <Text style={styles.bttxtViewRslt}>CLOSE</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default Exam;

const styles = StyleSheet.create({
  closebutton: {
    // flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#12BAD1',
    elevation: 5,
  },
  mainContainerTop: {
    flex: 6,
  },
  bttxtViewRslt: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closbuttonview: {
    marginLeft: 125,
    marginRight: 125,
    marginBottom: 20,
  },
  buttonResultView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 30,
    backgroundColor: '#4CB050',
    elevation: 5,
  },
  itemones: {
    flex: 0.5,
    borderRightColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  itemtwos: {
    borderRightColor: '#E0E0E0',
    flex: 1.3,
    alignItems: 'flex-start',
    marginLeft: 10,
    justifyContent: 'center',
  },
  itemthrees: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatitems: {
    fontSize: 13,
  },
  flatitem: {
    fontSize: 12,
  },
  itemsoneAlertSubject: {
    flex: 2,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    // alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemsoneAlert: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  flatlistMarkTable: {
    flex: 1,
  },
  itemStylealert: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  welcomeAlert: {
    flex: 1,
    // flexGrow: 0.9,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
  },
  textcontaineonealertlast: {
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textcontaineonealertone: {
    flex: 1,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  textalert: {
    fontSize: 14,
    flexWrap: 'wrap',
    color: '#FFFFFF',
  },
  topcontaineralert: {
    height: 50,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  textcontaineonealertoneSubject: {
    flex: 2,
    backgroundColor: '#B866C6',
    paddingLeft: 5,
    // alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
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
  container: {
    flex: 1,
  },
  noDataView: {
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
  },
  modalViewStyle: {
    marginTop: 30,
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
  containertop: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    elevation: 3,
  },
  containerTable: {
    elevation: 0.5,
    flex: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 4,
    shadowOpacity: 0.5,
  },
  headingTableView: {
    flex: 0.75,
    elevation: 3,
    flexDirection: 'row',
    backgroundColor: '#B866C6',
  },
  textcontaineone: {
    flex: 0.5,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  textcontaintwo: {
    flex: 2,
    backgroundColor: '#B866C6',
    paddingLeft: 10,
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderRightWidth: 1,
  },
  textcontainthree: {
    flex: 1.2,
    backgroundColor: '#B866C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatlistView: {
    flex: 6,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  esscontainertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  dashtext: {
    marginLeft: 10,
    fontSize: 18,
    color: '#FFFFFF',
  },
  textc: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  item: {
    fontSize: 14,
    flex: 1,
  },
  itemone: {
    flex: 0.8,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    alignSelf: 'center',
    borderColor: '#D3D3D3',
  },
  itemthree: {
    flex: 1.2,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  classSelection: {
    flexDirection: 'row',
    //  height: 75,
    flex: 1,
    width: '100%',
  },
  pickerStyle: {
    height: 35,
    flex: 0.5,
    paddingTop: 10,
    paddingLeft: 5,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    margin: 5,
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 3,
  },
  TwotextView: {
    marginBottom: 2,
    marginTop: 2,
    alignItems: 'center',
    flexDirection: 'row',
  },
  textstyle: {
    flex: 1,
    marginLeft: 4,
    fontSize: 15,
  },
});
