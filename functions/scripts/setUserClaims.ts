import admin from "firebase-admin";

import serviceAccount from "../.secrets/usourced-platform-firebase-adminsdk-u7atr-2cd2f85c36.json" assert { type: "json" };

const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://usourced-platform.firebaseio.com",
});
const auth = adminApp.auth();

await auth.setCustomUserClaims("mqlgwfmul5XpnJB3Hs58snsmTb62", {
  linkedCompanies: ["recjnQoIoZM61bV3K"],
});
