import React from 'react';
import {StyleSheet, Text, Pressable, View} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = props => {
  return (
    <View style={styles.header}>
      <View style={styles.start}>
        {props.showBack ? (
          <Pressable style={styles.menu} onPress={props.onPress}>
            <Icon name="arrow-left" size={30} color="white" />
          </Pressable>
        ) : null}
        <Text style={styles.text}>School Plus</Text>
        <View style={styles.end}>
          <Pressable onPressIn={props.homePress} style={styles.home}>
            <Icon name="home" size={30} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    height: wp('15%'),
    backgroundColor: '#13C0CE',
    alignItems: 'center',
    elevation: 5,
  },
  start: {
    flex: 1,
    flexDirection: 'row',
  },
  menu: {
    marginLeft: 10,
  },
  end: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  home: {
    // alignSelf: 'flex-end',
    marginRight: 10,
  },
  bell: {
    // alignSelf: 'flex-end',
    marginRight: 10,
  },
  text: {
    marginLeft: 20,
    color: 'white',
    fontSize: 22,
  },
  container: {
    flex: 1,
  },
  iconbadgetext: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  iconBadge: {
    elevation: 2,
    width: 16,
    height: 16,
    marginTop: -40,
    // marginLeft:20,
    backgroundColor: '#EA1E63',
  },
  IconBadgeStyle: {},
});
