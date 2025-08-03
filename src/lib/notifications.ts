import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email by creating a document in the 'mail' collection.
 * This triggers the "Trigger Email" Firebase extension to send the actual email.
 * @param {EmailParams} params - The email parameters.
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, html }: EmailParams): Promise<void> {
  try {
    const mailCollection = collection(db, 'mail');
    await addDoc(mailCollection, {
      to: [to],
      message: {
        subject: subject,
        html: html,
      },
    });
    console.log(`Email document created for: ${to}`);
  } catch (error) {
    console.error('Error creating email document:', error);
    // In a real app, you might want to add more robust error handling,
    // like logging to a dedicated service.
  }
}
