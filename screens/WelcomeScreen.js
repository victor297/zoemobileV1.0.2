import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
const WelcomeScreen = () => {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      navigation.navigate("SignInScreen");
    }, [navigation])
  );
  return (
    <View className="flex-1 items-center justify-center">
      <Image source={require("./../assets/logo.png")} />
    </View>
  );
};

export default WelcomeScreen;
