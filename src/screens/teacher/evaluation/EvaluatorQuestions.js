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

let radioprops = [
  {label: '1', value: 1},
  {label: '2', value: 2},
  {label: '3', value: 3},
  {label: '4', value: 4},
  {label: '5', value: 5},
];

let branchId = '';
let teacherId = '';
let academicId = '';

const EvaluatorQuestions = ({route, navigation}) => {
  const [loading, setloading] = useState(true);
  const [dataerror, setdataerror] = useState(false);
  const [dataSource, setdataSource] = useState('');
  const [choosenAnswers, setchoosenAnswers] = useState([]);
  const [memoArray, setmemoArray] = useState([{memo: ''}]);
  const [remarks, setremarks] = useState('');
  const parser = new DOMParser();

  useEffect(() => {
    loadQuestions();
  }, []);

  const saveAnswers = () => {
    if (choosenAnswers.length !== dataSource.length) {
      Alert.alert('Incomplete Answers', 'Please fill all details!');
    } else {
      setloading(true);
      let array = JSON.stringify(choosenAnswers);
      let array2 = JSON.stringify(memoArray);
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
          <warnings>${array2}</warnings>
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
                    'You have successfully submitted all answers!',
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
        fetch(`${GLOBALS.PARENT_URL}TeachersQuestions`, {
          method: 'POST',
          body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
              <soap12:Body>
                <TeachersQuestions xmlns="http://www.m2hinfotech.com//">
                  <teacherId>${teacherId}</teacherId>
                  <branchId>${branchId}</branchId>
                  <academicId>${academicId}</academicId>
                  <mobileNo>${keyValue2}</mobileNo>
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
            const ccc = parser
              .parseFromString(response)
              .getElementsByTagName('TeachersQuestionsResult')[0]
              .childNodes[0].nodeValue;
            if (ccc === 'failure') {
              setdataerror(true);
            } else {
              const output = JSON.parse(ccc);
              const data = output.Table;
              setdataSource(data);
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
  const inputViews = memoArray.map((item, index) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <TextInput
          placeholder="Enter Memos or Warnings!"
          multiline
          style={styles.inputStyle}
          onChangeText={text => {
            let array = [...memoArray];
            array[index] = {memo: text};
            setmemoArray(array);
          }}
          value={item.memo}
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
                  style={{width: '100%'}}
                  data={dataSource}
                  renderItem={({item, index}) => (
                    <View style={styles.card}>
                      <Text style={styles.nameText}>{item.Question}</Text>
                      <View style={{marginLeft: 10}}>
                        <RadioForm
                          radio_props={radioprops}
                          initial={-1}
                          formHorizontal
                          labelHorizontal
                          wrapStyle={{marginLeft: 10}}
                          labelStyle={styles.labelStyle}
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
                      style={styles.remarkInput}
                      onChangeText={text => setremarks(text)}
                      value={remarks}
                    />
                    <View style={styles.savedView}>
                      <Pressable onPress={() => saveAnswers()}>
                        <Text style={styles.submitText}>SUBMIT</Text>
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

export default EvaluatorQuestions;

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
  inputStyle: {
    height: 40,
    margin: 10,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
  },
  nameText: {
    fontSize: 16,
    margin: 10,
  },
  remarkInput: {
    height: 60,
    margin: 10,
    borderColor: 'gray',
    borderWidth: 1,
  },
  savedView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  labelStyle: {
    paddingRight: '10%',
    color: 'gray',
  },
  submitText: {
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
});
