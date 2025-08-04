
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams) {
  try {
    const mailCollection = collection(db, 'mail');
    await addDoc(mailCollection, {
      to: Array.isArray(params.to) ? params.to : [params.to],
      message: {
        subject: params.subject,
        html: params.html,
      },
    });
  } catch (error) {
    console.error('Error creating email document in Firestore:', error);
    // Depending on the app's needs, you might want to re-throw the error
    // or handle it silently. For now, we'll log it.
  }
}

interface WelcomeEmailParams {
  email: string;
  name: string;
  role: string;
}

export async function sendWelcomeEmail({ email, name, role }: WelcomeEmailParams) {
  await sendEmail({
    to: email,
    subject: "¡Bienvenido a S.A.R.A!",
    html: `
      <h1>Hola ${name},</h1>
      <p>Te damos la bienvenida a S.A.R.A - Sistema de Administración Responsable de Arriendos.</p>
      <p>Tu cuenta como <strong>${role}</strong> ha sido creada exitosamente. Ya puedes iniciar sesión y comenzar a gestionar tus arriendos de forma fácil y segura.</p>
      <p>Gracias por unirte a nuestra comunidad.</p>
      <p>El equipo de S.A.R.A</p>
    `,
  });
}

interface ContractCreationEmailParams {
  tenantEmail: string;
  tenantName: string;
  landlordName: string;
  propertyAddress: string;
}

export async function sendCreationEmailToTenant({ tenantEmail, tenantName, landlordName, propertyAddress }: ContractCreationEmailParams) {
  await sendEmail({
    to: tenantEmail,
    subject: `Nuevo Contrato de Arriendo de ${landlordName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #2077c2; text-align: center;">¡Tienes un nuevo contrato de arriendo pendiente!</h1>
          <p>Hola ${tenantName},</p>
          <p><strong>${landlordName}</strong> te ha invitado a revisar y firmar un nuevo contrato de arriendo para la propiedad ubicada en <strong>${propertyAddress}</strong> a través de S.A.R.A.</p>
          <h3 style="color: #2077c2;">Siguientes Pasos:</h3>
          <ol style="padding-left: 20px;">
            <li><strong>Regístrate o Inicia Sesión</strong>: Si aún no tienes una cuenta, regístrate en S.A.R.A con el correo <strong>${tenantEmail}</strong>. Si ya tienes una, simplemente inicia sesión.</li>
            <li><strong>Revisa el Contrato</strong>: En tu panel principal (Dashboard), encontrarás el nuevo contrato pendiente de aprobación.</li>
            <li><strong>Aprueba el Contrato</strong>: Lee detenidamente los términos y, si estás de acuerdo, aprueba el contrato para activarlo.</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://www.sarachile.com/login" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a S.A.R.A</a>
          </div>
          <p style="font-size: 0.9em; color: #777;">Si tienes alguna pregunta, por favor contacta directamente a ${landlordName}.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 0.8em; color: #aaa; text-align: center;">Enviado a través de S.A.R.A - Sistema de Administración Responsable de Arriendos</p>
        </div>
      </div>
    `,
  });
}
