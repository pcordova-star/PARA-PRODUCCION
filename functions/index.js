const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// This function is intended to be used with the "Trigger Email" Firebase extension.
// It creates a document in the "mail" collection, which the extension then uses to send an email.
exports.sendEmail = functions.firestore
  .document("mail/{docId}")
  .onCreate((snap, context) => {
    const mailData = snap.data();

    // The Trigger Email extension requires the `to`, `message.subject`, and `message.html` fields.
    if (!mailData.to || !mailData.message || !mailData.message.subject || !mailData.message.html) {
      console.error("Mail document is missing required fields (to, message.subject, message.html):", mailData);
      return null;
    }

    console.log(`Email document created for ${mailData.to}. The 'Trigger Email' extension will handle sending.`);
    return null;
  });
