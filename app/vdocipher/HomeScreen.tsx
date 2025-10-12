/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, Button, View, NativeModules, SafeAreaView, Platform} from 'react-native';
import {startVideoScreen} from 'vdocipher-rn-bridge';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from '../../type';
import { EmbedInfo, PlayerSettings } from 'vdocipher-rn-bridge/type';

const {VdoPlayerSettings, VdoPreCacheManager} = NativeModules;

export default function HomeScreen(props: NativeStackScreenProps<RootStackParamList, 'Home'>) {

  const [otp, setOtp] = useState('20160313versASE323C7XWONXgHyw5WdQ5cthrieQuCSMDutvGyaainRgK4eHidx');
  const [playbackInfo, setPlaybackInfo] = useState('eyJ2aWRlb0lkIjoiODA2NTM2OWY3ZThjNGU1Yzg0ZmQ2MDBjMWE5MzcwMzQifQ==');
  const preCacheSettings = {mediaId: "474e7c337731eef36a9900517b96cfa7", customPlayerId: "", languageCode: "", cacheSize: 100}
  const playerSettings: PlayerSettings = {vdoPlaybackModeAndroid: "continue_playback_on_app_exit", bufferingGoalMs: 100}

  useEffect(() => {
    // VdoPlayerSettings.applySettings(playerSettings);
    // VdoPreCacheManager.cacheVideo(preCacheSettings);
    fetch('https://dev.vdocipher.com/api/site/homepage_video')
    .then(res => res.json())
    .then(resp => {
        setOtp("20160313versASE323C7XWONXgHyw5WdQ5cthrieQuCSMDutvGyaainRgK4eHidx")
        setPlaybackInfo("eyJ2aWRlb0lkIjoiODA2NTM2OWY3ZThjNGU1Yzg0ZmQ2MDBjMWE5MzcwMzQifQ==")
      }
    );
  }, []);

  var ready = otp != '';
    const embedInfo: EmbedInfo = {otp, playbackInfo};
    const isPlatformIOS = Platform.OS == "ios";
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to VdoCipher react-native integration!
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            disabled={!ready}
            title={ready ? 'Start video in native fullscreen' : 'Loading...'}
            onPress={() => startVideoScreen({embedInfo}, true)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            disabled={!ready}
            title={
              ready ? 'Start video with embedded native controls' : 'Loading...'
            }
            onPress={() =>
              props.navigation.navigate('NativeControls', {embedInfo})
            }
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            disabled={!ready}
            title={ready ? 'Start video with JS controls' : 'Loading...'}
            onPress={() =>
              props.navigation.navigate('JSControls', {embedInfo})
            }
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Downloads"
            onPress={() => props.navigation.navigate('Downloads')}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Open Playlist"
            onPress={() => props.navigation.navigate('Playlist')}
          />
        </View>
        {/* This button is used to show how to open player in new activity so that when player 
        goes in pip mode, the previous activity(screen) is still visible/browsable */}
        { !isPlatformIOS &&
          <View style={styles.buttonContainer}>
            <Button
              title="Open Player in new Activity"
              onPress={() => NativeModules.PlayerActivityM.openPlayerActivity()}
            />
          </View>
        }
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 20,
  },
  buttonContainer: {
    margin: 20,
  },
});
