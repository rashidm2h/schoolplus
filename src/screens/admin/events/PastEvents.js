import React, {useState, useEffect} from 'react';
import {StyleSheet, FlatList, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const PastEvents = () => {
  const [loading, setloading] = useState(true);
  const [data, setdata] = useState('');
  const [dataerror, setdataerror] = useState(false);
  let username = '';

  useEffect(() => {
    getUpcmgevent();
  }, []);

  const getUpcmgevent = () => {
    AsyncStorage.getItem('BranchID').then(BranchID => {
      let branchId = BranchID;
      AsyncStorage.getItem('acess_token').then(
        keyValue => {
          username = keyValue; //Display key value
          const string = 'old';
          fetch(`${GLOBALS.PARENT_URL}GetAllEvents`, {
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
                console.log(output);
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
                {/* </View> */}
              </View>
            </>
          )}
        </View>
      )}
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
    marginTop: 80,
    alignItems: 'center',
  },
  notDataText: {
    fontSize: 15,
    textAlign: 'center',
  },
  teachercontainermiddel: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  textcontaineone: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
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
    margin: 1,
  },
  texthead: {
    fontSize: 14,
    color: '#BA69C8',
    marginLeft: 10,
  },
  textc: {
    fontSize: 14,
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
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  item: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  itemTitle: {
    // flex: 1,
    fontSize: 12,
    textAlign: 'center',
    marginLeft: 10,
  },
  itemDesc: {
    // flex: 1,
    flexWrap: 'wrap',
    fontSize: 10,
    marginLeft: 10,
  },
  itemone: {
    flexDirection: 'column',
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
  itemtwo: {
    flex: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },

  itemthree: {
    flexDirection: 'column',
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#D3D3D3',
  },
});
