import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD8Qzm03splCGEaKFXn2rrkjbftITU6H9U",
  authDomain: "dostana-452011.firebaseapp.com",
  projectId: "dostana-452011",
  storageBucket: "dostana-452011.firebasestorage.app",
  messagingSenderId: "19932708049",
  appId: "1:19932708049:web:0325d4f2bf59f56ae259f0",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Request notification permission and get FCM token
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: "BFdE-e7T6Qf8Kv4tkPpdVP73UbggrlE3YfpKB22qRLyaQy9zo7saERP_vheDBf7czbQLgmlQejPJ_Iah16Bwt-Y",
      });
      console.log(currentToken);
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      }
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};
