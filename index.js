import { AppRegistry } from "react-native";
import App from "./App";
import bgMessaging from "./src/bgMessage";

AppRegistry.registerComponent("fcm", () => App);

AppRegistry.registerHeadlessTask(
  "RNFirebaseBackgroundMessage",
  () => bgMessaging
);
