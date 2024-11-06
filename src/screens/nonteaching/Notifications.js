import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Platform,
  FlatList,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import Hyperlink from 'react-native-hyperlink';
import GLOBALS from '../../config/Globals';
import Header from '../../components/Header';
import Loader from '../../components/ProgressIndicator';

const Notes = ({navigation}) => {
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  useEffect(() => {
    NoteAccess();
  }, []);

  const NoteAccess = () => {
    let branchId = '';
    AsyncStorage.getItem('BranchID').then(BranchID => {
      branchId = BranchID;
    });
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('StdID').then(
          keyValue2 => {
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetNonTStaffsNotes`, {
              method: 'POST',
              body: `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
 <soap12:Body>
 <GetNonTStaffsNotes xmlns="http://www.m2hinfotech.com//">
 <mobileNo>${keyValue}</mobileNo>
 <BranchID>${branchId}</BranchID>
 </GetNonTStaffsNotes>
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
                setloading(false);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(response);
                const v = xmlDoc.getElementsByTagName(
                  'GetNonTStaffsNotesResult',
                )[0].childNodes[0].nodeValue;
                if (v === 'failure') {
                  setdataerror(true);
                } else {
                  const rslt = JSON.parse(v);
                  setdata(rslt);
                }
              })
              .catch(error => {
                setloading(false);
                console.log(error);
              });
          },
          error => {
            console.log(error);
          },
        );
      },
      error => {
        console.log(error);
      },
    );
  };
  return (
    <View style={styles.container}>
      <Header
        homePress={() => navigation.navigate('NonTeachingDashboard')}
        bellPress={() => navigation.navigate('Notifications')}
      />
      {loading ? (
        <Loader />
      ) : (
        <View>
          {dataerror ? (
            <Text style={styles.notDataText}>No data found.</Text>
          ) : (
            <>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={data}
                keyboardShouldPersistTaps="never"
                keyboardDismissMode="on-drag"
                renderItem={({item}) => (
                  <View style={styles.card}>
                    <View style={styles.cardin}>
                      <View style={styles.cardtitleView}>
                        <Text style={styles.cardtitle}>{item.Title}</Text>
                      </View>
                      <View style={styles.cardDateView}>
                        <Text style={styles.carddate}>{item.Date}</Text>
                      </View>
                    </View>
                    <Hyperlink linkDefault linkStyle={{color: '#2980b9'}}>
                      <Text style={styles.carddesc}>{item.Description}</Text>
                    </Hyperlink>
                    <Text
                      style={styles.carddesc}>{`From:  ${item.Sender}`}</Text>
                  </View>
                )}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default Notes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  navHeaderButtonios: {
    marginRight: 5,
    height: 27,
    width: 27,
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
    textAlign: 'center',
  },
  card: {
    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    elevation: 1,
    flexGrow: 0.15,
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0.9,
    },
    shadowRadius: 2,
    shadowOpacity: 0.5,
    ...Platform.select({
      android: {
        borderRadius: 4,
      },
      ios: {
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
      },
    }),
  },
  cardin: {
    flexDirection: 'row',
    padding: 5,
    flex: 1,
  },
  cardtitleView: {
    flexGrow: 0.85,
    alignItems: 'flex-start',
  },
  cardDateView: {
    flexGrow: 0.25,
    alignItems: 'flex-end',
  },
  cardtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A8A8A',
  },
  carddate: {
    fontSize: 16,
  },
  carddesc: {
    fontSize: 14,
    padding: 5,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#607D8B',
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerStyle: {
    flexGrow: 2,
  },
  containerColoum: {
    flex: 1,
    margin: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  boxNote: {
    flexDirection: 'column',
    flex: 2,
  },
  boxDesc: {
    flexDirection: 'column',
    flex: 2,
  },
  NoteTitle: {},
  containerNotetitle: {
    flexDirection: 'row',
    flexGrow: 1,
    flex: 1,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#607D8B',
  },
  Buttoncontainer: {
    flexDirection: 'row',
  },
  TextInputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 170,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#607D8B',
    marginVertical: 10,
  },
  containerImageText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
    flex: 2,
    flexDirection: 'column',
  },
  esscontainertopcontentimage: {
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  Textincontainer: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '200',
  },
  textinputtitleView: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 3,
    flexDirection: 'row',
    borderColor: '#607D8B',
    marginVertical: 10,
    ...Platform.select({
      ios: {
        height: 40,
      },
    }),
  },
});
