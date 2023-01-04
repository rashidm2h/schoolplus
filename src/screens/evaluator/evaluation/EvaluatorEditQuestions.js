import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  TextInput,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RadioForm from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/EvaluatorHeader';
import Loader from '../../../components/ProgressIndicator';

let radioprops = [
  {label: '1', value: 1},
  {label: '2', value: 2},
  {label: '3', value: 3},
  {label: '4', value: 4},
  {label: '5', value: 5},
  ,
];

let branchId = '';
let teacherId = '';
let academicId = '';
const EvaluatorEditQuestions = ({route, navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataSource, setdataSource] = useState('');

  const [data, setdata] = useState([]);
  const [choosenAnswers, setchoosenAnswers] = useState([]);
  const [dataerror, setdataerror] = useState(false);
  const [remarks, setremarks] = useState('');
  const [warnings, setwarnings] = useState('');
  useEffect(() => {
    loadQuestions();
  }, []);
  const saveAnswers = () => {
    let ccc = '';

    if (choosenAnswers.length !== dataSource.length) {
      Alert.alert('Incomplete Answers', 'Please fill all details!');
    } else {
      setloading(true);
      let array = JSON.stringify(choosenAnswers);
      AsyncStorage.getItem('acess_token').then(
        keyValue2 => {
          const username = keyValue2;
          // console.log(`<?xml version="1.0" encoding="utf-8"?>
          // <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          //   <soap12:Body>
          //     <SaveAnswers xmlns="http://www.m2hinfotech.com//">
          //       <teacherId>${teacherId}</teacherId>
          //       <academicId>${academicId}</academicId>
          //       <branchId>${branchId}</branchId>
          //       <questionAnswer>${array}</questionAnswer>
          //       <mobileNo>${username}</mobileNo>
          //       <remarks>${this.state.remarks}</remarks>
          //       <warnings>${this.state.warnings}</warnings>
          //     </SaveAnswers>
          //   </soap12:Body>
          // </soap12:Envelope>`);
          fetch(`${GLOBALS.PARENT_URL}SaveAnswers`, {
            method: 'POST',
            body: `<?xml version="1.0" encoding="utf-8"?>
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <SaveAnswers xmlns="http://www.m2hinfotech.com//">
            <teacherId>${teacherId}</teacherId>
            <academicId>${academicId}</academicId>
            <branchId>${branchId}</branchId>
            <questionAnswer>${array}</questionAnswer>
            <mobileNo>${username}</mobileNo>
            <remarks>${remarks}</remarks>
            <warnings>${warnings}</warnings>
          </SaveAnswers>
        </soap12:Body>
      </soap12:Envelope>`,
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
              ccc =
                xmlDoc.getElementsByTagName('SaveAnswersResult')[0]
                  .childNodes[0].nodeValue;
              console.log('cc', ccc);
              if (ccc === 'failure') {
                Alert.alert('An unexpected error occured!');
              } else {
                if ((ccc = 'success')) {
                  Alert.alert(
                    'Success',
                    'You have successfully updated all answers!',
                    [
                      {
                        text: 'OK',
                        onPress: () => navigation.goBack(null),
                      },
                    ],
                    {cancelable: false},
                  );
                }
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
    }
  };

  const loadQuestions = () => {
    teacherId = route.params.TeacherId.toString();
    console.log('teacher', teacherId);
    AsyncStorage.getItem('BranchID')
      .then(keyValue2 => {
        branchId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('FinancialYear')
      .then(keyValue2 => {
        academicId = keyValue2;
        console.log(keyValue2);
      })
      .catch(error => {
        console.log(error);
      });
    AsyncStorage.getItem('acess_token').then(
      keyValue2 => {
        const username = keyValue2;
        fetch(`${GLOBALS.PARENT_URL}TeachersQuestions`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
              <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                  <TeachersQuestions xmlns="http://www.m2hinfotech.com//">
                    <teacherId>${teacherId}</teacherId>
                    <branchId>${branchId}</branchId>
                    <academicId>${academicId}</academicId>
                    <mobileNo>${username}</mobileNo>
                  </TeachersQuestions>
                </soap12:Body>
              </soap12:Envelope>`,
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
            const ccc = xmlDoc.getElementsByTagName(
              'TeachersQuestionsResult',
            )[0].childNodes[0].nodeValue;
            if (ccc === 'failure') {
            } else {
              const output = JSON.parse(ccc);
              console.log(output);
              const data = output.Table;
              let array = [];
              data.map(each => {
                array.push({question: each.QuestionsId, answer: each.value});
              });
              setdataSource(data);
              setremarks(data[0].Remarks);
              setchoosenAnswers(array);
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
    <KeyboardAwareScrollView keyboardDismissMode="interactive">
      <View style={styles.container}>
        <Header
          showBack={false}
          homePress={() => navigation.navigate('EvaluatorDashboard')}
        />
        {loading ? (
          <Loader />
        ) : (
          <View style={{flex: 1}}>
            {dataerror ? (
              <Text style={styles.notDataText}>No data found.</Text>
            ) : (
              <>
                <FlatList
                  style={{width: '100%', marginTop: 5}}
                  data={dataSource}
                  renderItem={({item, index}) => (
                    <View style={styles.card}>
                      <Text style={styles.nameText}>{item.Question}</Text>
                      <View style={{marginLeft: 10}}>
                        <RadioForm
                          radio_props={radioprops}
                          initial={item.Answer - 1}
                          formHorizontal
                          labelHorizontal
                          wrapStyle={{marginLeft: 10}}
                          labelStyle={{
                            paddingRight: '10%',
                            color: 'gray',
                          }}
                          // buttonColor='blue'
                          animation={false}
                          buttonSize={7}
                          numColumns={5}
                          onPress={value => {
                            let array = [...choosenAnswers];
                            if (array.length !== 0) {
                              let exists = false;
                              array.map(each => {
                                if (each.question === item.QuestionsId) {
                                  each.answer = value;
                                  exists = true;
                                }
                              });
                              if (!exists) {
                                array.push({
                                  question: item.QuestionsId,
                                  answer: value,
                                });
                              }
                            } else {
                              array.push({
                                question: item.QuestionsId,
                                answer: value,
                              });
                            }
                            setchoosenAnswers(array);

                            // Array[index].question = item.ID;
                            // Array[index].Answers = value;
                            // this.setState({
                            //   DataArray: Array
                            // });
                          }}
                        />
                      </View>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.line} />}
                />
                {dataSource.length !== 0 ? (
                  <View>
                    <TextInput
                      placeholder="Enter your remarks!"
                      multiline
                      style={{
                        height: 60,
                        margin: 10,
                        borderColor: 'gray',
                        borderWidth: 1,
                      }}
                      onChangeText={text => setremarks(text)}
                      value={remarks}
                    />
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                      }}>
                      <Pressable onPress={() => saveAnswers()}>
                        <Text
                          style={{
                            paddingRight: 20,
                            borderRadius: 5,
                            paddingLeft: 20,
                            paddingTop: 10,
                            paddingBottom: 10,
                            alignSelf: 'center',
                            height: 40,
                            backgroundColor: '#13C0CE',
                            color: 'white',
                          }}>
                          UPDATE
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default EvaluatorEditQuestions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 10,
  },
  line: {
    paddingTop: 5,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  nameText: {
    fontSize: 16,
    margin: 10,
  },
  navHeaderLeftios: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  navHeaderButtonios: {
    marginRight: 5,
    height: 27,
    width: 27,
  },
  HeaderText: {
    marginLeft: 25,
    color: '#E6FAFF',
    fontSize: 20,
    fontWeight: '400',
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
  header: {
    width: '100%',
    flexDirection: 'row',
    height: 40,
  },
  activityIndicator: {
    marginTop: 5,
  },
});
