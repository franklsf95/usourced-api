import admin from "firebase-admin";
import * as functions from "firebase-functions";

const adminApp = admin.initializeApp();
const auth = adminApp.auth();
const db = adminApp.firestore();

async function existsCompanyByName(name: string): Promise<boolean> {
  const snapshot = await db
    .collection("companies")
    .where("name", "==", name)
    .get();
  return !snapshot.empty;
}

/**
 * When a user updates their company name, if the company does not exist, add
 * it to the database and add the company ID to the user's custom claims.
 * Otherwise, notify the site admin for manual approval.
 */
async function onCreateOrUpdateUserAccount(
  snapshot: admin.firestore.DocumentSnapshot,
  context: functions.EventContext,
) {
  const companyName = snapshot.data()?.companyName;
  const companyExists = await existsCompanyByName(companyName);
  if (companyExists) {
    // TODO(@lsf): Notify site admin for manual approval.
    return;
  }
  const company = await db.collection("companies").add({ name: companyName });
  const uid = context.params.uid;
  const user = await auth.getUser(uid);
  const claims = user.customClaims;
  const linkedCompanies = claims?.linkedCompanies || [];
  linkedCompanies.push(company.id);
  await auth.setCustomUserClaims(uid, { linkedCompanies });
}

export const onCreateUserAccount = functions.firestore
  .document("user_accounts/{uid}")
  .onCreate(onCreateOrUpdateUserAccount);

export const onUpdateUserAccount = functions.firestore
  .document("user_accounts/{uid}")
  .onUpdate(async (change, context) => {
    const before = change.before.data()?.companyName;
    const after = change.after.data()?.companyName;
    if (before !== after) {
      await onCreateOrUpdateUserAccount(change.after, context);
    }
  });
