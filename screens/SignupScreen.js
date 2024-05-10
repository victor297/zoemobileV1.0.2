import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Input from "../components/Input";
import { EyeIcon } from "react-native-heroicons/solid";
import { StopIcon as StopIconOutline } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";

const SignupScreen = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigation = useNavigation();
  const handleInputChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
  };
  const handleSubmit = () => {
    console.log("hi");
  };

  return (
    <View className="flex-1 items-center justify-center mx-4">
      <Image source={require("./../assets/logo.png")} />

      <Text className="font-bold mt-4">Create an account</Text>
      <Text className="mt-1 text-grey mb-6 text-xs">
        Start Yout Real-Time AI Transcription now{" "}
      </Text>
      <Input
        placeholder="Enter your name"
        label="Name"
        onChange={(text) => handleInputChange("username", text)}
      />
      <Input
        placeholder="Enter your email"
        label="Email"
        onChange={(text) => handleInputChange("username", text)}
      />
      <Input
        placeholder="Enter your password"
        label="Password"
        Icon={EyeIcon}
        last
        onChange={(text) => handleInputChange("password", text)}
      />

      <Pressable
        onPress={handleSubmit}
        className="py-3 bg-green-400 px-2 bg-green rounded-full w-full mb-2 mt-6 max-h-[58px] flex items-center justify-center"
      >
        <Text className="  text-center text-white font-bold ">
          Create account{" "}
        </Text>
      </Pressable>
      <Text className="text-grey">
        Have an account?{" "}
        <Text
          className="text-green"
          onPress={() => navigation.navigate("SignInScreen")}
        >
          Login
        </Text>
      </Text>
    </View>
  );
};

export default SignupScreen;
