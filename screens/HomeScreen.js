import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  Button,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  PermissionsAndroid,
  Platform,
  PermissionsIOS,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { PlayIcon, StopIcon } from "react-native-heroicons/solid";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LiveAudioStream from "react-native-live-audio-stream";
import { socket } from "../utils";
import {
  useDeleteDeviceMutation,
  useGetDevicesQuery,
  useGetProfileQuery,
} from "../redux/api/usersApiSlice";
import Toast from "react-native-root-toast";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { Buffer } from "buffer";

const HomeScreen = ({ route }) => {
  /** **********************************************************************
   * States
   ********************************************************************** */
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [activePcs, setActivePcs] = useState([]);
  const [connectedPc, setConnectedPc] = useState(null);
  const [Devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [recording, setRecording] = React.useState();
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const navigation = useNavigation();
  const { data, refetch, isFetching, isError, error } = useGetDevicesQuery();
  const {
    data: profileData,
    refetch: refetchProfile,
    isFetching: isFetchingProfile,
    isError: isProfileError,
    error: profileError,
  } = useGetProfileQuery();
  const [deleteDevice] = useDeleteDeviceMutation();

  /************************************************************************
   * Hooks
   ********************************************************************** */

  const requestAudioPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Audio Permission",
            message: "App needs access to your microphone for audio recording.",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Audio permission granted");
        } else {
          console.log("Audio permission denied");
        }
      } catch (err) {
        console.warn("hhe,", err);
      }
    }
    //  else if (Platform.OS === "ios") {
    //   try {
    //     const granted = await PermissionsIOS.requestPermission(
    //       PermissionsIOS.PERMISSIONS.MICROPHONE
    //     );
    //     if (granted === PermissionsIOS.RESULTS.GRANTED) {
    //       console.log("Audio permission granted");
    //     } else {
    //       console.log("Audio permission denied");
    //     }
    //   } catch (err) {
    //     console.warn(err);
    //   }
    // }
  };

  // Call requestAudioPermission where you want to request audio permission

  useEffect(() => {
    const options = {
      sampleRate: 32000,
      bitsPerSample: 16,
      bufferSize: 4096,
    };

    LiveAudioStream.init(options);

    LiveAudioStream.on("data", (data) => {
      // Process your audio data here
      console.log("activedeviceid", deviceId);
      var chunk = Buffer.from(data, "base64");
      console.log("audiodta", chunk)

      socket.emit("audioData", {
        audioChunk: chunk,
        email: userInfo.email,
        deviceId,
      });
    });

    return () => {
      LiveAudioStream.stop();
    };
  }, [socket, deviceId]);

  const handleConversationButtonPressed = async () => {
    requestAudioPermission();
    if (
      (Platform.OS === "android" &&
        (await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ))) === "denied"
    ) {
      return Toast.show("Kindly accept permission");
    }
    if (!isSocketConnected || !connectedPc) {
      return Toast.show("Refresh and reconnect to a Pc", {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }

    LiveAudioStream.start();
    setRecording(true);
  };

  const handleConversationButtonReleased = () => {
    LiveAudioStream.stop();
    setRecording(false);
  };

  const handleConnect = (deviceId) => {
    // socket.emit("userConnected", { email: userInfo.email, deviceId });
    console.log("id", deviceId, userInfo.email);
    if (socket.connected) {
      socket.emit("userConnected", { email: userInfo.email, deviceId });
    } else {
      // Optionally, you can attempt to reconnect the socket here
      socket.connect();
      socket.emit("userConnected", { email: userInfo.email, deviceId });
    }
  };
  const handleRemove = () => {
    socket.emit("userConnected", { email: userInfo.email, deviceId: null });
  };
  useEffect(() => {
    if (
      error?.data?.message == "Unauthenticated." ||
      profileError?.data?.message == "Unauthenticated."
    ) {
      handleLogOut();
    }
    if (isProfileError) {
      Toast.show(profileError?.data?.message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  }, [isError, isProfileError]);
  const handleDelete = async (id) => {
    console.log(id);
    try {
      const res = await deleteDevice(id);
      console.log("res,res", res);

      refetchProfile();
      refetch();
      Toast.show("deleted", {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    } catch (error) {
      Toast.show(error?.data?.message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  };
  const handleLogOut = () => {
    dispatch(logout());
  };
  /************************************************************************
   * Socket
   ***********************************************************************/

  useEffect(() => {
    const handleSocketConnect = () => {
      setIsSocketConnected(true);
    };

    const handleSocketDisconnect = () => {
      setIsSocketConnected(false);
      refreshDataAndSocket();
      // Show a notification here if you want
      Toast.show("You are disconnected Kindly refresh the page", {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    };

    socket.on("connect", handleSocketConnect);
    socket.on("disconnect", handleSocketDisconnect);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("disconnect", handleSocketDisconnect);
    };
  }, []);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    console.log("datadata", data);
    socket.on("_connected", async (deviceId) => {
      console.log(deviceId);
      if (!deviceId) {
        setConnectedPc(null);

        return Toast.show("PC offline", {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          onShow: () => {
            // calls on toast\`s appear animation start
          },
          onShown: () => {
            // calls on toast\`s appear animation end.
          },
          onHide: () => {
            // calls on toast\`s hide animation start.
          },
          onHidden: () => {
            // calls on toast\`s hide animation end.
          },
        });
      }
      const devicesData = await refetch();
      console.log("devicesData", devicesData.data.data);

      // const filteredData = await data?.data?.filter(
      //   (entry) => entry?.identifier === deviceId
      // );

      const filteredData = await devicesData?.data?.data?.filter(
        (entry) => entry?.identifier === deviceId
      );
      setConnectedPc(filteredData[0]);
      setDeviceId(deviceId);
      // if (connectedPc) {
      //   setModalVisible(false);
      // }
    });

    // socket.on("audioChunk", (audioChunk) => {
    //   console.log("Received audio chunk: ", audioChunk);
    // });
    socket.emit("activeUser", { email: userInfo.email });

    return () => {
      socket.disconnect();
    };
  }, [userInfo.email, socket]);

  socket.on("activePcs", (devices) => {
    setActivePcs(devices);
  });

  const handleRefresh = () => {
    refreshDataAndSocket();
  };

  const refreshDataAndSocket = () => {
    refetch();
    refetchProfile();
    socket.emit("userConnected", { email: userInfo.email, deviceId: null });
    setConnectedPc(null);
    socket.connect();
    if (!socket.connected) {
      socket.connect();
    }
  };
  return (
    <SafeAreaView
      className={`bg-lightGreen ${modalVisible ? "bg-black opacity-75" : null}`}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={false} // Replace with your refreshing state
            onRefresh={handleRefresh}
          />
        }
      >
        <View className=" mx-4 ">
          <View
            className={`h-auto w-full bg-white my-6 rounded-lg  px-4 py-4 ${
              modalVisible ? "bg-black opacity-75" : null
            }`}
          >
            <View className="flex flex-row items-center mb-6">
              {/* <Image source={require("./../assets/avatar.png")} /> */}
              <Text className="font-bold text-xl ml-2 ">
                Welcome,{" "}
                {isFetchingProfile ? (
                  <ActivityIndicator />
                ) : isProfileError ? null : (
                  profileData?.data?.name
                )}
              </Text>
              <Text
                className="font-bold text-xl  text-red-200 ml-auto"
                onPress={handleLogOut}
              >
                LogOut
              </Text>
            </View>
            <View className="flex flex-row justify-between items-end px-2 ">
              <View>
                <Text className="text-[8px]  text-grey">
                  Numbers of transcription
                </Text>
                <Text className="  text-grey font-bold text-lg text-center">
                  {isFetchingProfile ? (
                    <ActivityIndicator />
                  ) : isProfileError ? null : (
                    profileData?.statistics?.transactions_count
                  )}
                </Text>
              </View>
              <View>
                <Text className="text-[8px]  text-grey">
                  Numbers of Devices
                </Text>
                <Text className="  text-grey font-bold text-lg text-center">
                  {isFetchingProfile ? (
                    <ActivityIndicator />
                  ) : isProfileError ? null : (
                    profileData?.statistics?.devices_count
                  )}
                </Text>
              </View>
              <View>
                <Text className="text-[8px]  text-grey">
                  Transcriptions Left
                </Text>
                <Text className="  text-grey font-bold text-lg text-center">
                  {isFetchingProfile ? (
                    <ActivityIndicator />
                  ) : isProfileError ? null : (
                    profileData?.statistics?.transcription_remaining
                  )}
                </Text>
              </View>
            </View>
          </View>
          <Text className="font-semibold ">Connected Devices</Text>
          <View
            className={`h-auto w-full nb bg-white my-2 rounded-lg px-4 py-6 ${
              modalVisible ? "bg-black opacity-75" : null
            }`}
          >
            <View>
              <Text className="font-bold text-xs">Available devices</Text>
              <Text className="text-xs font-light mt-1 mb-2 text-grey">
                Establish a connection with your desktop device for a seamless
                exprerience
              </Text>
              {connectedPc ? (
                <View className="flex flex-row items-center justify-between mt-6 mb-6">
                  <View className="flex flex-row gap-2 items-center">
                    <Image source={require("./../assets/avatar1.png")} />
                    <Text>{connectedPc.name}</Text>
                  </View>
                  <Pressable onPress={handleRemove}>
                    <Text className="text-red-500">Remove</Text>
                  </Pressable>
                </View>
              ) : null}
              <Pressable
                onPress={() => {
                  setModalVisible(true);
                  refetch();
                }}
                className="py-3 bg-green-400 px-2 bg-green rounded-lg w-full mb-2 max-h-[58px] flex items-center justify-center"
              >
                <Text className="  text-center text-white font-bold">
                  Pair with a new device
                </Text>
              </Pressable>
            </View>
            <View></View>
          </View>
          <View
            className={`h-auto w-full items-center  bg-white my-2 rounded-lg px-4 py-6 ${
              modalVisible ? "bg-black opacity-75" : null
            }`}
          >
            <Text className="font-bold text-xs text-center mb-2">Sources</Text>
            <Image
              source={
                recording
                  ? require("./../assets/activemic.gif")
                  : require("./../assets/mic1.gif")
              }
              style={{ height: 80, width: 80 }}
            />

            <View className="w-full">
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedLanguage(itemValue)
                }
              >
                <Picker.Item label="Phone Microphone" value="Phone" />
                <Picker.Item label="External Microphone" value="Earpiece" />
              </Picker>
            </View>
            <View className="flex flex-row w-full justify-between">
              <Pressable
                onPress={handleConversationButtonPressed}
                className="py-3 bg-green-400 px-10 bg-green rounded-lg w-auto mb-2 max-h-[58px] flex flex-row items-center justify-center"
              >
                <PlayIcon color={"black"} />
                <Text className="  text-center  font-bold">{"Start"}</Text>
              </Pressable>
              <Pressable
                onPress={handleConversationButtonReleased}
                className="py-3 bg-green-400 px-10 bg-green rounded-lg w-auto mb-2 max-h-[58px] flex flex-row items-center justify-center"
              >
                <StopIcon color={"black"} />
                <Text className="  text-center  font-bold">{"Stop"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View className=" justify-center items-center mt-12  w-full opacity-50 bg-black  ">
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View className="flex-1 justify-center items-center mt-32 mx-4 ">
              {null ? (
                <View className="rounded-xl w-full p-4   bg-white">
                  <View className="mb-6 w-full">
                    <Image
                      source={require("./../assets/search.png")}
                      className="w-full rounded-xl"
                    />
                  </View>
                  <Text className="font-bold text-lg text-center">
                    Searching for nearby devices
                  </Text>
                  <Text className="text-center font-light mt-1 text-grey leading-5">
                    Establish a connection with your desktop device for a
                    seamless exprerience
                  </Text>
                  {isError ? (
                    <Text className="text-start self-start pl-2 text-red-500">
                      {error?.data?.message}
                    </Text>
                  ) : (
                    <ActivityIndicator color="green" />
                  )}
                  <Pressable
                    className="bg-green w-full rounded-lg mb-2 mt-2"
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text className="my-2 py-2 text-center">Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="rounded-xl w-full p-4   bg-white">
                  <View className="mb-6">
                    <Image source={require("./../assets/avatar1.png")} />
                  </View>
                  <Text className="font-bold text-xs">Available devices</Text>
                  <Text className="text-xs font-light mt-1 text-grey leading-5">
                    Establish a connection with your desktop device for a
                    seamless exprerience
                  </Text>
                  {isError ? (
                    <Text>{error?.data?.message}</Text>
                  ) : (
                    <>
                      {isFetching ? <ActivityIndicator /> : null}
                      {data?.data?.map((pc) => (
                        <View
                          key={pc.id}
                          className="flex flex-row items-center justify-between m-2"
                        >
                          <View className="flex flex-row gap-2 items-center">
                            {/* <Image
                              source={require("./../assets/avatar1.png")}
                            /> */}
                            <Text className="text-xs flex items-center">
                              {pc.name}{" "}
                              {activePcs.includes(pc.identifier) ? (
                                <View className="p-1 rounded-full bg-green self-center shadow-lg"></View>
                              ) : null}
                            </Text>
                          </View>
                          <View className="flex flex-row gap-2">
                            <Pressable
                              onPress={() => {
                                handleDelete(pc.id);
                              }}
                              className="px-2 py-1"
                            >
                              <Text className="text-red-400 text-xs">
                                Delete
                              </Text>
                            </Pressable>

                            {connectedPc?.identifier === pc?.identifier ? (
                              <Text
                                // onPress={() => handleConnect(pc.identifier)}
                                className="text-green text-xs"
                              >
                                Connected
                              </Text>
                            ) : (
                              <Pressable
                                onPress={() => {
                                  handleConnect(pc.identifier);
                                }}
                                className="px-2 py-1"
                              >
                                <Text className="text-green text-xs ">
                                  Connect
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                  <Pressable
                    className="bg-green w-full rounded-lg mb-4 mt-2"
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text className="my-2 text-center  text-white">Done</Text>
                  </Pressable>
                  <Pressable
                    className="border border-gray-300 w-full rounded-lg"
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text className="my-2 text-center">Cancel</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure SafeAreaView takes up the entire screen
    marginTop: StatusBar.currentHeight,
  },
});
export default HomeScreen;
