import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {DOMParser} from 'xmldom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../config/Globals';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const SwitchstudentPage = ({route, navigation}) => {
  const [isLoading, setisLoading] = useState(true);
  const [dataSource, setdataSource] = useState(' ');
  const [text_Class, settext_Class] = useState(' ');
  const [imagePreUrl, setimagePreUrl] = useState('');

  useEffect(() => {
    StudentId();
    AsyncStorage.getItem('domain').then(value => {
      const pre = `http://${value}/`;
      setimagePreUrl(pre);
    });
  }, []);

  const StudentId = () => {
    AsyncStorage.getItem('acess_token').then(
      keyValue => {
        AsyncStorage.getItem('BranchID').then(
          keyValue2 => {
        //     console.log(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStudIdForParent`, `<?xml version="1.0" encoding="utf-8"?>
        //       <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        // <soap12:Body>
        // <GetStudIdForParent xmlns="http://www.m2hinfotech.com//">
        // <mobile>${keyValue}</mobile>
        // <Branch>${keyValue2}</Branch>
        // </GetStudIdForParent>
        // </soap12:Body>
        // </soap12:Envelope>
        //     `)
            fetch(`http://10.25.25.124:85/EschoolWebService.asmx?op=GetStudIdForParent`, {
              method: 'POST',
              body: `<?xml version="1.0" encoding="utf-8"?>
			<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<GetStudIdForParent xmlns="http://www.m2hinfotech.com//">
<mobile>${keyValue}</mobile>
<Branch>${keyValue2}</Branch>
</GetStudIdForParent>
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
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(response);
                const ccc = xmlDoc.getElementsByTagName(
                  'GetStudIdForParentResult',
                )[0].childNodes[0].nodeValue;
                if (ccc === 'failure') {
                  Alert.alert(
                    '',
                    '  No Data Available',
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                    {cancelable: false},
                  );
                  setisLoading(false);
                } else {
                  const output = JSON.parse(ccc);
                  console.log(output, 'output');
                  setisLoading(false);
                  setdataSource(output);
                  settext_Class('Class: ');
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
      },
      error => {
        console.log(error); //Display error
      },
    );
  };

  const FlatListItemSeparator = () => (
    <View
      style={{
        height: 1,
        width: '100%',
        borderWidth: 0.5,
        borderColor: '#D3D3D3',
        margin: 10,
        backgroundColor: '#607D8B',
      }}
    />
  );

  const studentPicId = (
    uri,
    studentId,
    firstname,
    lastname,
    classno,
    classdiv,
  ) => {
    try {
      AsyncStorage.setItem('StudentPic', uri);
      AsyncStorage.setItem('StdID', studentId);
      AsyncStorage.setItem('StdFirstname', firstname);
      AsyncStorage.setItem('StdLastname', lastname);
      AsyncStorage.setItem('StdClassNO', classno);
      AsyncStorage.setItem('StdClassdiv', classdiv);
      AsyncStorage.setItem('Dashboard', 'PH');
    } catch (error) {
      console.log('somthing went');
    }

    navigation.navigate('ParentHome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.esscontainermiddle}>
        {/* <Image
         style={styles.containertopcontentimage}
         source={require('../images/face.png')}
       /> */}
        <Icon
          name="face"
          size={34}
          color="white"
          style={styles.containertopcontentimage}
        />
        <Text style={styles.dashtext}>CHOOSE STUDENT</Text>
      </View>
      <View style={styles.viewstyle}>
        <FlatList
          data={dataSource}
          ItemSeparatorComponent={FlatListItemSeparator}
          renderItem={({item}) => (
            <View style={styles.productbox}>
              <Image
                style={styles.esscontainerimageflat}
                source={{uri: imagePreUrl + item.Image}}
              />

              <View style={styles.textcolum}>
                <TouchableOpacity
                  onPress={() =>
                    studentPicId(
                      item.Image,
                      item.StudentId,
                      item.FirstName,
                      item.LastName,
                      item.ClassNo,
                      item.DivCode,
                    )
                  }>
                  <Text style={styles.item}> {item.FirstName} </Text>
                  <View style={styles.row}>
                    <Text style={styles.itemss}>{text_Class}</Text>
                    <Text style={styles.itemss}>{item.ClassNo} </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    width: wp('3%'),
    height: hp('8%'),
  },
  containertopcontentimage: {
    justifyContent: 'center',
    height:hp('6%'),
    width: wp('6%'),
  },
  esscontainermiddle: {
    height: hp('20%'),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#607D8B',
  },
  viewstyle: {
    flex: 7,
    marginTop: wp('3%'),
  },
  dashtext: {
    justifyContent: 'center',
    fontSize: 18,
    // marginLeft: 25,
    color: '#FFFFFF',
  },
  productbox: {
    flexDirection: 'row',
    paddingLeft: wp('5%'),
    paddingRight: wp('6%'),
  },
  esscontainerimageflat: {
    alignItems: 'flex-start',
    height: hp('15%'),
    width: wp('15%'),

    ...Platform.select({
      ios: {
        borderRadius: 90 / 2,
      },
      android: {
        borderRadius: 80,
      },
    }),
  },
  item: {
    fontSize: 16,
    color: '#82C3C3',
  },
  itemss: {
    fontSize: 16,
  },
  textcolum: {
    flexDirection: 'column',
    paddingLeft: wp('3%'),
    paddingRight: wp('4%'),
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
export default SwitchstudentPage;
