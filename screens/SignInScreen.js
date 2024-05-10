import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import Input from "../components/Input";
import { useNavigation } from "@react-navigation/native";
import { useLoginMutation } from "../redux/api/usersApiSlice";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";

const SignInScreen = () => {
  const [userData, setUserData] = useState(null);
  const [login, { isLoading, isError, error }] = useLoginMutation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
  console.log("error:", error?.data?.message);
  const handleSubmit = async () => {
    try {
      if (!validateEmail(userData)) {
        return Alert.alert("invalid Email");
      }
      const res = await login({ email: userData });
      dispatch(
        setCredentials({ token: res.data.access_token, email: userData })
      );
      // navigation.navigate("HomeScreen", { email: userData });
    } catch (err) {
      console.log(err?.data?.message || err.error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center mx-4 mb-12">
      <Image source={require("./../assets/logo.png")} />

      <Text className="font-bold mt-4">Login</Text>
      <Text className="mt-1 text-grey mb-6 text-xs">
        Welcome back! Please enter your details
      </Text>
      <Input
        placeholder="Enter your email"
        label="Email"
        last
        onChange={(text) => setUserData(text)}
      />
      {isError && (
        <Text className="text-start self-start pl-2 text-red-500">
          {error?.data?.message}
        </Text>
      )}
      <Pressable
        onPress={handleSubmit}
        className="py-3 bg-green-400 px-2 bg-green rounded-full w-full my-4 max-h-[58px] flex items-center justify-center"
      >
        <Text className="  text-center text-white font-bold">
          {isLoading ? <ActivityIndicator color="green" /> : "Login"}{" "}
        </Text>
      </Pressable>
    </View>
  );
};

export default SignInScreen;
