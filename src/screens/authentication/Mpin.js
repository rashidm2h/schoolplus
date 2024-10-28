import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Fontisto"
import * as React from "react";
import Reanimated, {  FadeInUp } from 'react-native-reanimated'
import {
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width } = Dimensions.get("window");


const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "space", '0', "delete"];
const passcodeLength = 4;
const _keySize = width / 4;
const _passcodeSpacing = (width - 3 * _keySize) / 2;
const _passCodeSize = width / (passcodeLength + 2);

const PassCodeKeyboard = ({ onPress }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: _passcodeSpacing,
        alignItems: "center",
      }}>
      {keys.map((key) => {
        if (key === "space") {
          return <View style={{ width: _keySize }} key='space' />;
        }
        return (
          <TouchableOpacity
            onPress={() => onPress(key)}
            key={key}
            style={{
              width: _keySize,
              height: _keySize,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <View>
              {key === "delete" ? (
                <MaterialCommunityIcons
                  name='keyboard-backspace'
                  size={42}
                  color='rgba(0,0,0,0.3)'
                />
              ) : (
                <Text
                  style={{ color: "#000", fontSize: 32, fontWeight: "700" }}>
                    {key}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PassCode = ({ passcode }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        marginVertical: _passcodeSpacing,
      }}>
      {[...Array(passcodeLength).keys()].map((i) => {
        return (
          <Reanimated.View entering={FadeInUp.delay(200 * i)}
            key={`passcode-${i}-${passcode[i]}`}
            style={{
              width: _passCodeSize,
              height: _passCodeSize,
              borderRadius: _passCodeSize,
              backgroundColor: "rgba(0,0,0,0.1)",
              marginHorizontal: 5,
            }}>
            {passcode[i] && (
              <View
                style={{
                  backgroundColor: "#17BED0",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  borderRadius: _passCodeSize,
                }}>
                <Text
                  style={{
                    fontSize: _passCodeSize / 2,
                    color: "#fff",
                    fontWeight: "700",
                  }}>
                  {passcode[i]}
                </Text>
              </View>
            )}
          </Reanimated.View>
        );
      })}
    </View>
  );
};

export default function PassCodeV1({ navigation }) {
  const [passcode, setPasscode] = React.useState([]);
  const [isValid, setIsValid] = React.useState(false);

  React.useEffect(() => {
    if (passcode.length === passcodeLength) {
      navigation.navigate('ConfirmPin', { enteredPin: passcode.join('') });
      setPasscode([])
    }
  }, [passcode]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: hp('8%') }}>
      <StatusBar hidden />
      <Icon
        name='locked'
        size={42}
        color='#000'
      />
      <Text
        style={{
          fontSize: 28,
          paddingHorizontal: _passcodeSpacing * 2,
          textAlign: "center",
          color: "#000",
          marginTop: hp('2%'),
          fontWeight: '600'
        }}>
        Create your Pin
      </Text>
      <Text
        style={{
          fontSize: 16,
          paddingHorizontal: _passcodeSpacing * 2,
          textAlign: "center",
          color: "#000",
          marginTop: hp('2%'),
        }}>
        Please enter 4-digit pin to secure signup
      </Text>
      <PassCode
        passcode={passcode}
      //   isValid={passcode.length !== passcodeLength || isValid}
      />
      <PassCodeKeyboard
        onPress={(char) => {
          if (char === "delete") {
            setPasscode((prev) =>
              prev.length === 0 ? [] : prev.slice(0, prev.length - 1)
            );
            return;
          }
          if (passcode.length === passcodeLength) {
            return;
          }
          setPasscode((prev) => [...prev, char]);
        }}
      />
    </View>
  );
}
