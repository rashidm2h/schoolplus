import React, {useState} from 'react';
import {
  TextInput,
  Text,
  Image,
  Pressable,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DOMParser} from 'xmldom';
import Logo from '../../images/logo.png';
import Progress from '../../components/ProgressIndicator';
import GLOBALS from '../../config/Globals';


const SchoolCode = ({navigation}) => {
  const [text, settext] = useState('');
  const [loading, setloading] = useState(false);
  const codeDetails = () => {
    if (text.length === 0) {
      Alert.alert('Please fill the School Code!');
    } else {
      setloading(true);
      fetch(`${GLOBALS.SCHOOLCODE}`, {
        method: 'POST',
        body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
  <GetSchoolDomain xmlns="http://www.m2hinfotech.com//">
  <SchoolCode>${text}</SchoolCode>
  </GetSchoolDomain>
  </soap:Body>
</soap:Envelope>`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/xml; charset=utf-8',
        },
      })
        .then(response => response.text())
        .then(response => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response);
          const v = xmlDoc.getElementsByTagName('GetSchoolDomainResult')[0]
            .childNodes[0].nodeValue;
          setloading(false);
          if (v === 'failure') {
            Alert.alert(
              'Invalid Code!',
              'Please Contact your School Admin to get your school code!'
            );
          } else if (v === 'Inactive SchoolCode') {
            Alert.alert(
              'Failed!',
              ' School Plus is Deactivated. Please Contact your School Admin!',
            );
          } else {
            const rslt = JSON.parse(v);
            console.log(rslt);
            const domainName = rslt[0].Domain;
            const branchName = rslt[0].Branch;
            const branchId = rslt[0].BranchID;
            if (domainName.length !== 0) {
              try {
                AsyncStorage.setItem('schoolBranchName', branchName);
                AsyncStorage.setItem('domain', domainName);
                AsyncStorage.setItem('schoolCode', text);
                AsyncStorage.setItem('BranchID', branchId);
                GLOBALS.PARENT_URL = `${GLOBALS.BEFORE}${domainName}${GLOBALS.AFT_PARENT}`;
                GLOBALS.TEACHER_URL = `${GLOBALS.BEFORE}${domainName}${GLOBALS.AFT_TEACHER}`;
                navigation.navigate('Phone');
              } catch (error) {
                console.log(error);
              }
            }
          }
        })
        .catch(error => {
          setloading(false);
          console.log(error);
          Alert.alert('An unexpected error has occured. Please try again!');
        });
    }
  };
  
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={Logo} />
      <TextInput
        style={styles.textInput}
        se
        placeholder="School Code"
        placeholderTextColor="white"
        autoCapitalize="none"
        returnKeyType="done"
        maxLength={6}
        keyboardType="numeric"
        selectionColor="red"
        onChangeText={value => settext(value)}
      />
      <Pressable
        android_ripple
        style={styles.buttonStyle}
        onPress={() => codeDetails()}>
        <Text style={styles.text}>NEXT</Text>
      </Pressable>
      {loading ? <Progress /> : null}
    </View>
  );
};

export default SchoolCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#17BED0',
  },

  logo: {
    width: wp('30%'),
    height: wp('40%'),
    marginBottom: hp('4%'),
  },
  buttonStyle: {
    backgroundColor: '#F4FDFF',
    marginTop: hp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('40%'),
    height: wp('12%'),
    borderRadius: 5,
  },
  text: {
    color: '#53BCC5',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityIndicator: {
    marginTop: 5,
  },
  textInput: {
    textAlign: 'center',
    color: 'white',
    height: wp('12%'),
    width: wp('40%'),
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
  },
});
