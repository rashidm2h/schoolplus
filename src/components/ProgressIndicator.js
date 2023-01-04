import React from 'react';
import {StyleSheet, ActivityIndicator, View} from 'react-native';

const ProgressIndicator = () => {
  return (
    <View>
      <ActivityIndicator size="large" style={styles.indicator} color="red" />
    </View>
  );
};

export default ProgressIndicator;

const styles = StyleSheet.create({
  indicator: {
    padding: 30,
    position: 'relative',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
