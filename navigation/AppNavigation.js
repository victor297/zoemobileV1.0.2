import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useSelector } from "react-redux";
import SignInScreen from "../screens/SignInScreen";
import HomeScreen from "../screens/HomeScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
// import HomeScreen from "../screens/HomeScreendecordbase64playsound";
// import HomeScreen from "../screens/HomeScreenLibrarysTest";
// import HomeScreen from "../screens/Homescreenthatplaysbase64";

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  console.log("userinfo=>", userInfo);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userInfo === null ? (
          <>
            <Stack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            {/* <Stack.Screen
              name="SignUpScreen"
              component={SignupScreen}
              options={{ headerShown: false }}
            /> */}
            <Stack.Screen
              name="SignInScreen"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
