// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function programada para eliminar contratos archivados después de 15 días.
 * Se ejecuta automáticamente una vez cada 24 horas.
 */
exports.deleteOldArchivedContracts = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    console.log("Ejecutando la limpieza de contratos archivados...");

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const fifteenDaysAgoISO = fifteenDaysAgo.toISOString();

    const snapshot = await db
      .collection("contracts")
      .where("status", "==", "Archivado")
      .where("archivedAt", "<=", fifteenDaysAgoISO)
      .get();

    if (snapshot.empty) {
      console.log("No hay contratos archivados antiguos para eliminar.");
      return null;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      console.log(`Eliminando contrato archivado: ${doc.id}`);
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(
      `Se eliminaron ${snapshot.size} contratos archivados antiguos.`
    );
    return null;
  });
