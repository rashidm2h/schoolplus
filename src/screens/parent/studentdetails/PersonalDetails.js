import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import GLOBALS from '../../../config/Globals';
import Loader from '../../../components/ProgressIndicator';

const PersonalDetails = () => {
  let studentId = '';
  const [profilePic, setprofilePic] = useState('');
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [admissionNo, setadmissionNo] = useState('');
  const [admissionDate, setadmissionDate] = useState('');
  const [address, setaddress] = useState('');
  const [dob, setdob] = useState('');
  const [gender, setgender] = useState('');
  const [bloodgroup, setbloodgroup] = useState('');
  const [religion, setreligion] = useState('');
  const [montherTongue, setmontherTongue] = useState('');
  const [nationality, setnationality] = useState('');

  const [loading, setloading] = useState(true);
  const [failure, setfailure] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    AsyncStorage.getItem('StdID').then(value => {
      studentId = value;
      fetch(`${GLOBALS.PARENT_SERVICE}RetrieveStdDetails`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
              <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
         <soap12:Body>
           <RetrieveStdDetails xmlns="http://www.m2hinfotech.com//">
             <studentId>${studentId}</studentId>
           </RetrieveStdDetails>
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
          const v = xmlDoc.getElementsByTagName('RetrieveStdDetailsResult')[0]
            .childNodes[0].nodeValue;
          console.log(v);
          if (v === 'failure') {
            setfailure(false);
          } else {
            const rslt = JSON.parse(v);
            setprofilePic(rslt[0].Image);
            setadmissionNo(rslt[0].AdmissionNo);
            setadmissionDate(rslt[0].AdmissionDate);
            setaddress(rslt[0].Address);
            setgender(rslt[0].Gender);
            setbloodgroup(rslt[0].BlodGroup);
            setdob(rslt[0].DOB);
            setreligion(rslt[0].Religion);
            setmontherTongue(rslt[0].MotherTongue);
            setnationality(rslt[0].nationality);
            setfirstName(rslt[0].FirstName);
            setlastName(rslt[0].LastName);
          }
        })
        .catch(error => {
          setloading(false);
          console.log(error);
        });
    });
  };

  return (
    <View style={styles.container}>
      {failure ? (
        <Text style={styles.noData}>No Data Found</Text>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
            <Text>{`Admission No: ${admissionNo}`}</Text>
            <Text>{`Admission Date: ${admissionDate}`}</Text>
          </View>
          <View style={styles.textView}>
            <Text style={styles.boldText}>Address:</Text>
            <Text style={styles.normalText}>{`${address}`}</Text>
          </View>
          <View style={styles.textView}>
            <Text style={styles.boldText}>DOB:</Text>
            <Text style={styles.normalText}>{`${dob}`}</Text>
          </View>
          <View style={styles.textView}>
            <Text style={styles.boldText}>Blood Group:</Text>
            <Text style={styles.normalText}>{`${bloodgroup}`}</Text>
          </View>
        </>
      )}
      {loading ? <Loader /> : null}
    </View>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 125,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textView: {
    flexDirection: 'row',
    // marginBottom: 5,
    marginTop: 10,
  },
  boldText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 20,
    flex: 1,
  },
  normalText: {
    fontSize: 14,
    flex: 2,
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
  },
});
