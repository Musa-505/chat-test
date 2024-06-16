import { initializeApp } from "@firebase/app";
import { getStorage } from "@firebase/storage";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "@firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBw5m2cLbugKuXaDWwEgu5zZYUkrVCiIJU",
    authDomain: "test-chat-e9ebc.firebaseapp.com",
    projectId: "test-chat-e9ebc",
    storageBucket: "test-chat-e9ebc.appspot.com",
    messagingSenderId: "132413464895",
    appId: "1:132413464895:web:2034f85f2beae7a051f38a",
    measurementId: "G-0TNMG4D6G4"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { storage, db, auth };
