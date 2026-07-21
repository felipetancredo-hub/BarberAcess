import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1B2d3FEvY3LWDrm7br_ZqWp5A811h_ds",
  authDomain: "barberacess-8d02d.firebaseapp.com",
  projectId: "barberacess-8d02d",
  storageBucket: "barberacess-8d02d.firebasestorage.app",
  messagingSenderId: "293728943389",
  appId: "1:293728943389:web:cb77ec1045c1e84b20f5f4"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };