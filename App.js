import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native"; // Removed Text, View, and Navigation imports since they're not needed here
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignInScreen from "./screens/SignInScreen";
import SignupScreen from "./screens/SignupScreen";
import { Provider } from "react-redux";
import store from "./redux/store";
import { RootSiblingParent } from "react-native-root-siblings";
import AppNavigation from "./navigation/AppNavigation";
import { initializeUserInfo } from "./redux/features/auth/authSlice";
import * as Updates from "expo-updates";
import { useEffect } from "react";
const Stack = createNativeStackNavigator();

export default function App() {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);
      console.log(error);
    }
  }
  useEffect(() => {
    onFetchUpdateAsync();
  }, []);
  store.dispatch(initializeUserInfo());
  return (
    <RootSiblingParent>
      <Provider store={store}>
        <SafeAreaView style={styles.container}>
          {/* <SpeechRecognitionRootView> */}
          <StatusBar animated={true} backgroundColor="#ECF6E7" />
          <AppNavigation />
          {/* </SpeechRecognitionRootView> */}
        </SafeAreaView>
      </Provider>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure SafeAreaView takes up the entire screen
    marginTop: StatusBar.currentHeight,
  },
});
