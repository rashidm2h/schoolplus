import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SkypeIndicator} from 'react-native-indicators';

const Spinner = props => {
  return props.visibility ? (
    <View style={styles.spinnerStyle}>
      <SkypeIndicator color={props.spinnerColor} size={40} />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  spinnerStyle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flex: 1,
  },
});

export default Spinner;
