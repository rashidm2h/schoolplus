import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  Alert,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/AntDesign';
import RadioForm from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import GLOBALS from '../../../config/Globals';
import Header from '../../../components/Header';
import Loader from '../../../components/ProgressIndicator';

const plus = <Icon name="pluscircle" size={30} color="green" />;
const minus = <Icon name="minuscircle" size={30} color="red" />;

let branchId = '';
let teacherId = '';
let academicId = '';
let radioprops = [
  {label: '1', value: 1},
  {label: '2', value: 2},
  {label: '3', value: 3},
  {label: '4', value: 4},
  {label: '5', value: 5},
];

const EvaluatorEditQuestion = ({route, navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [remarks, setremarks] = useState('');
  const [dataSource, setdataSource] = useState('');
  const [choosenAnswers, setchoosenAnswers] = useState([]);
  const [memoArray, setmemoArray] = useState([{memo: ''}]);
  const parser = new DOMParser();

  useEffect(() => {
    loadQuestions();
  }, []);

  const saveAnswers = () => {
    if (choosenAnswers.length !== dataSource.length) {
      Alert.alert('Incomplete Answers', 'Please fill all details!');
    } else {
      setloading(true);
      let array3 = [];
      memoArray.forEach(element => {
        if (!element.hasOwnProperty('Warnings')) {
          array3.push({memo: element.memo});
        } else {
          array3.push({memo: element.Warnings});
        }
      });

      let array = JSON.stringify(choosenAnswers);
      let array4 = JSON.stringify(array3);
      AsyncStorage.getItem('acess_token').then(
        keyValue2 => {
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
          <mobileNo>${keyValue2}</mobileNo>
          <remarks>${remarks}</remarks>
          <warnings>${array4}</warnings>
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
              const result = parser
                .parseFromString(response)
                .getElementsByTagName('SaveAnswersResult')[0]
                .childNodes[0].nodeValue;
              if (result === 'failure') {
              } else {
                if (result === 'success') {
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

  const addMemo = index => {
    let array = [...memoArray];
    if (index === memoArray.length - 1) {
      array.push({memo: ''});
      setmemoArray(array);
    } else {
      array.splice(index, 1);
      setmemoArray(array);
    }
  };

  const loadQuestions = () => {
    teacherId = route.params.TeacherId.toString();
    AsyncStorage.getItem('BranchID')
      .then(keyValue2 => {
        branchId = keyValue2;
      })
      .catch(error => {
        console.log(error);
      });

    AsyncStorage.getItem('FinancialYear')
      .then(keyValue2 => {
        academicId = keyValue2;
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
            const result = parser
              .parseFromString(response)
              .getElementsByTagName('TeachersQuestionsResult')[0]
              .childNodes[0].nodeValue;
            if (result === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(result);
              const data = output.Table;
              let array = [];
              let memoArray = [];
              data.map(each => {
                array.push({question: each.QuestionsId, answer: each.value});
              });
              if (output.Table1.length === 0) {
                memoArray.push({memo: ''});
              } else {
                memoArray = output.Table1;
              }
              setmemoArray(memoArray);
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
  const inputViews = memoArray.map((item, index) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <TextInput
          placeholder="Enter Memos or Warnings!"
          multiline
          style={styles.inputStyles}
          onChangeText={text => {
            let array = [...memoArray];
            array[index] = {memo: text};
            setmemoArray(array);
          }}
          value={item.Warnings}
        />
        <Pressable
          style={{justifyContent: 'center'}}
          onPress={() => addMemo(index)}>
          <View>{index === memoArray.length - 1 ? plus : minus}</View>
        </Pressable>
      </View>
    );
  });
  return (
    <KeyboardAwareScrollView keyboardDismissMode="interactive">
      <View style={styles.container}>
        <Header
          homePress={() => navigation.navigate('TeacherDashboard')}
          bellPress={() => {
            navigation.navigate('Notifications');
          }}
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
                          labelStyle={styles.labelStyles}
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
                          }}
                        />
                      </View>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={styles.line} />}
                />
                <View>{inputViews}</View>
                {dataSource.length !== 0 ? (
                  <View>
                    <TextInput
                      placeholder="Enter your remarks!"
                      multiline
                      style={styles.inputStyle}
                      onChangeText={text => setremarks(text)}
                      value={remarks}
                    />
                    <View style={styles.buttonStye}>
                      <Pressable onPress={() => saveAnswers()}>
                        <Text style={styles.updateButton}>UPDATE</Text>
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

export default EvaluatorEditQuestion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 10,
  },
  updateButton: {
    paddingRight: 20,
    borderRadius: 5,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignSelf: 'center',
    height: 40,
    backgroundColor: '#13C0CE',
    color: 'white',
  },
  line: {
    paddingTop: 5,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  inputStyle: {
    height: 60,
    margin: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
  inputStyles: {
    height: 40,
    margin: 10,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
  },
  buttonStye: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nameText: {
    fontSize: 16,
    margin: 10,
  },
  labelStyles: {
    paddingRight: '10%',
    color: 'gray',
  },
});
