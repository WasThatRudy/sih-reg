import admin from "firebase-admin";

// Initialize Firebase Admin only if service account key is provided
let firebaseInitialized = false;

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    firebaseInitialized = true;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error);
  }
}

export const auth = firebaseInitialized ? admin.auth() : null;
export const firestore = firebaseInitialized ? admin.firestore() : null;
export { firebaseInitialized };

export default admin;
