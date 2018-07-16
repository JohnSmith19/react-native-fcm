<img src="https://camo.githubusercontent.com/dbea9e8e1413431453c9df6876dedf678c0f8a63/68747470733a2f2f692e696d6775722e636f6d2f65424e4a6c48642e706e67" align="right">

# React Native - Firebase Cloud Messaging

이 문서는 React Native 환경에서 React Native Firebase 모듈을 사용한 Firebase Cloud Messaging 구현 방법을 안드로이드 플랫폼 위주로 설명합니다.

## [React Native 프로젝트 생성](https://facebook.github.io/react-native/docs/getting-started.html)

react-native cli 를 설치합니다.

```bash
npm install -g react-native-cli
```

react-native project 를 생성합니다.

```bash
ract-native init myproject
```

플랫폼별 프로젝트를 실행 합니다.

```bash
cd myproject
react-native run-android // 또는
react-native run-ios
```

## [React Native Fireabase 초기설정](https://rnfirebase.io/docs/v4.3.x/installation/initial-setup)

react-native-firebase 를 설치합니다.

```bash
npm install --save ract-native-firebase
```

Google Firebase 사이트에서 Firebase Project 를 생성합니다.

[Firebase 클라우드 메시징](https://firebase.google.com/docs/cloud-messaging/?hl=ko)

## [Android Platform 설정](https://rnfirebase.io/docs/v4.3.x/installation/android)

아래의 명령으로 React Native Project 와 React Native Firebase 를 Link 합니다.

```bash
react-native link react-native-firebase
```

google-service.json 설정

구글의 firebase 사이트에서 google-service.json 파일을 다운받고 프로젝트 폴더 아래의 경로에 위치 시킵니다.

```
android/app/google-services.json
```

프로젝트 레벨 build.gradle 파일을 설정합니다.

```gradle
buildscript {
  // ...
  dependencies {
    // ...
    classpath 'com.google.gms:google-services:4.0.1'
  }
}
```

앱의 android/app/build.gradle 파일에 firebase 모듈을 설정합니다.

```
dependencies {
  // This should be here already
  implementation project(':react-native-firebase')

  // Firebase dependencies
  implementation "com.google.android.gms:play-services-base:15.0.1"
  implementation "com.google.firebase:firebase-core:16.0.1"
}

apply plugin: 'com.google.gms.google-services'
```

Play Service Maven 저장소를 업데이트 합니다.

```
allprojects {
    repositories {
        mavenLocal()
        google() // <-- Add this line above jcenter
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
    }
}
```

## [React Native Firebase Cloud Messaging](https://rnfirebase.io/docs/v4.3.x/messaging/introduction)

### [Android 설치](https://rnfirebase.io/docs/v4.3.x/messaging/android)

[Add the dependency](https://rnfirebase.io/docs/v4.3.x/messaging/android#Add-the-dependency)

android/app/build.gradle 파일에 firebase messaging 의존성을 추가합니다.

```
dependencies {
  // ...
  implementation "com.google.firebase:firebase-messaging:17.1.0"
  implementation 'me.leolin:ShortcutBadger:1.1.21@aar' // <-- Add this line if you wish to use badge on Android
}
```

[Install the RNFirebase Messaging package](https://rnfirebase.io/docs/v4.3.x/messaging/android#Install-the-RNFirebase-Messaging-package)

android/app/src/main/java/com/[app name]/MainApplication.java 파일에 아래의 패키지들을 정의합니다.

```java
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // <-- Add this line

public class MainApplication extends Application implements ReactApplication {
    // ...

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNFirebasePackage(),
          new RNFirebaseMessagingPackage() // <-- Add this line
      );
    }
  };
  // ...
}
```

[Update Android Manifest](https://rnfirebase.io/docs/v4.3.x/messaging/android#Update-Android-Manifest)

android/app/src/main/AndroidManifest.xml 파일에 아래의 서비스들을 정의합니다.

```xml
<application ...>
  <service android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService">
    <intent-filter>
      <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
  </service>
  <service android:name="io.invertase.firebase.messaging.RNFirebaseInstanceIdService">
    <intent-filter>
      <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
    </intent-filter>
  </service>
</application>
```

[(Optional) Background Messages](<https://rnfirebase.io/docs/v4.3.x/messaging/android#(Optional)-Background-Messages>)

```xml
<application ...>
  <service android:name="io.invertase.firebase.messaging.RNFirebaseBackgroundMessagingService" />
</application>
```

### [The Device Registration Token](https://rnfirebase.io/docs/v4.3.x/messaging/device-token)

- 현재 등록된 토큰을 가져옵니다.

```js
const fcmToken = await firebase.messaging().getToken();
if (fcmToken) {
    // user has a device token
} else {
    // user doesn't have a device token yet
}
```

or

```js
firebase
  .messaging()
  .getToken()
  .then(fcmToken => {
    if (fcmToken) {
      // user has a device token
    } else {
      // user doesn't have a device token yet
    }
  });
```

- 토큰 생성을 모니터링 합니다.

The onTokenRefresh callback fires with the latest registration token whenever a new token is generated

```js
componentDidMount() {
    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
        // Process your token as required
    });
}

componentWillUnmount() {
    this.onTokenRefreshListener();
}
```

### [Receiving Firebase Cloud Messages](https://rnfirebase.io/docs/v4.3.x/messaging/receiving-messages)

Check permissions

```js
const enabled = await firebase.messaging().hasPermission();
if (enabled) {
    // user has permissions
} else {
    // user doesn't have permission
}
```

or:

```js
firebase
  .messaging()
  .hasPermission()
  .then(enabled => {
    if (enabled) {
      // user has permissions
    } else {
      // user doesn't have permission
    }
  });
```

Request permissions

```js
try {
    await firebase.messaging().requestPermission();
    // User has authorised
} catch (error) {
    // User has rejected permissions
}
```

or:

```js
firebase
  .messaging()
  .requestPermission()
  .then(() => {
    // User has authorised
  })
  .catch(error => {
    // User has rejected permissions
  });
```

Listen for FCM messages

We class Messages as:

data-only messages from FCM
For notification-only or notification + data messages, please see the [Notifications Module](https://rnfirebase.io/docs/v4.3.x/notifications/receiving-notifications).

A message will trigger the onMessage listener when the application receives a message in the foreground.

```js
// Optional: Flow type
import type { RemoteMessage } from 'react-native-firebase';

componentDidMount() {
    this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
        // Process your message as required
    });
}

componentWillUnmount() {
    this.messageListener();
}
```

Listen for FCM messages in the background

background message 를 정의한다.

- bgMessaging.js

```js
import firebase from "react-native-firebase";
// Optional flow type
import type { RemoteMessage } from "react-native-firebase";

export default async (message: RemoteMessage) => {
  // handle your message

  return Promise.resolve();
};
```

Register the background handler

background handler 를 등록하기 위해 index.js 에 아래의 코드를 추가한다.

- index.js

```js
import bgMessaging from "./src/bgMessaging"; // <-- Import the file you created in (2)

// Current main application
AppRegistry.registerComponent("ReactNativeFirebaseDemo", () => bootstrap);
// New task registration
AppRegistry.registerHeadlessTask(
  "RNFirebaseBackgroundMessage",
  () => bgMessaging
); // <-- Add this line
```
