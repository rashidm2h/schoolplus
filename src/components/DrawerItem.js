import React from 'react';
import {StyleSheet, Platform, Pressable, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const DrawerItem = props => {
  return (
    <View>
      <Pressable style={styles.item} onPress={props.onPress}>
        <Icon name={props.icon} size={28} color="white" />
        <Text style={styles.text}>{props.text}</Text>
      </Pressable>
      <View style={styles.line} />
    </View>
  );
};

export default DrawerItem;

const styles = StyleSheet.create({
  item: {
    width: '100%',
    height: hp('7%'),
    backgroundColor: '#13C0CE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  line: {
    width: '100%',
    borderBottomWidth: 0.5,
    borderColor: 'white',
  },
  text: {
    marginLeft: 10,
    color: '#E6FAFF',
    fontSize: 15,
    fontWeight: '400',
    ...Platform.select({
      android: {
        fontFamily: 'sans-serif-light',
      },
    }),
  },
});
