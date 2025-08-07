
import { collection, addDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Contract, UserProfile } from '@/types';

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams) {
  try {
    // Using setDoc with a new doc ref to ensure we get an ID for logging if needed
    await addDoc(collection(db, 'mail'), {
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
  appUrl: string;
  signatureToken: string;
}

export async function sendCreationEmailToTenant({ tenantEmail, tenantName, landlordName, propertyAddress, appUrl, signatureToken }: ContractCreationEmailParams) {
  const signUrl = `${appUrl}/sign/${signatureToken}`; 

  await sendEmail({
    to: tenantEmail,
    subject: `Tienes un contrato de arriendo pendiente en S.A.R.A`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #2077c2; text-align: center;">¡Tienes un contrato de arriendo pendiente!</h1>
          <p>Hola ${tenantName},</p>
          <p><strong>${landlordName}</strong> te ha enviado un contrato de arriendo para la propiedad en <strong>${propertyAddress}</strong> a través de S.A.R.A.</p>
          <h3 style="color: #2077c2;">Siguientes Pasos:</h3>
          <ol style="padding-left: 20px;">
            <li><strong>Revisa y Firma</strong>: Haz clic en el botón de abajo para ir directamente a la página de firma.</li>
            <li><strong>Regístrate o Inicia Sesión</strong>: La página de firma te pedirá que inicies sesión o te registres usando tu correo <strong>${tenantEmail}</strong> para poder firmar.</li>
            <li><strong>Encuentra tu Contrato</strong>: Si ya tienes una cuenta, también puedes encontrar el documento en la sección "Contratos" de tu panel principal.</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signUrl}" style="background-color: #2077c2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Revisar y Firmar Contrato</a>
          </div>
          <p style="font-size: 0.9em; color: #777;">Si tienes alguna pregunta sobre el contrato, por favor contacta directamente a ${landlordName}.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 0.8em; color: #aaa; text-align: center;">Enviado a través de S.A.R.A - Sistema de Administración Responsable de Arriendos</p>
        </div>
      </div>
    `,
  });
}

interface LegalAssistanceRequestParams {
  landlordName: string;
  landlordEmail: string;
  contract: Contract;
}

export async function sendLegalAssistanceRequestEmail({ landlordName, landlordEmail, contract }: LegalAssistanceRequestParams) {
  const lawyerEmail = "pcordova@woken.cl";
  const { propertyAddress, tenantName, tenantRut, id: contractId } = contract;

  await sendEmail({
    to: lawyerEmail,
    subject: `Solicitud de Asesoría Legal - Contrato ${propertyAddress}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #2077c2; border-bottom: 2px solid #2077c2; padding-bottom: 10px;">Solicitud de Asesoría Profesional S.A.R.A</h2>
        <p>Estimado equipo legal,</p>
        <p>Un usuario de la plataforma S.A.R.A ha solicitado formalmente asesoría legal para un caso de incumplimiento de contrato de arrendamiento.</p>
        
        <h3 style="color: #333; margin-top: 25px;">Datos del Solicitante (Arrendador)</h3>
        <ul style="list-style-type: none; padding-left: 0; border-left: 3px solid #eee; padding-left: 15px;">
          <li><strong>Nombre:</strong> ${landlordName}</li>
          <li><strong>Email de Contacto:</strong> <a href="mailto:${landlordEmail}">${landlordEmail}</a></li>
        </ul>

        <h3 style="color: #333; margin-top: 25px;">Detalles del Caso</h3>
        <ul style="list-style-type: none; padding-left: 0; border-left: 3px solid #eee; padding-left: 15px;">
          <li><strong>ID del Contrato:</strong> ${contractId}</li>
          <li><strong>Propiedad:</strong> ${propertyAddress}</li>
          <li><strong>Arrendatario:</strong> ${tenantName} (RUT: ${tenantRut})</li>
        </ul>
        
        <p style="margin-top: 25px;">Se solicita contactar al arrendador a la brevedad para coordinar los próximos pasos.</p>
        <p>Se recomienda solicitar al arrendador que descargue el "Dossier Legal" desde la plataforma S.A.R.A para obtener el historial completo de pagos, incidentes y evaluaciones del contrato.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px; margin-bottom: 10px;" />
        <p style="font-size: 0.8em; color: #aaa; text-align: center;">
          Este es un correo automático generado por la plataforma S.A.R.A.
        </p>
      </div>
    `,
  });
}


interface UpgradeRequestParams {
  user: UserProfile;
}

export async function sendUpgradeRequestEmail({ user }: UpgradeRequestParams) {
  const adminEmail = "sarachilev3@gmail.com";
  const { name, email, uid } = user;

  await sendEmail({
    to: adminEmail,
    subject: `Solicitud de Upgrade Manual - S.A.R.A`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2>Solicitud de Upgrade Manual</h2>
        <p>El siguiente usuario ha solicitado hacer un upgrade de su cuenta para salir del período de prueba:</p>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>User ID:</strong> ${uid}</li>
        </ul>
        <p>Por favor, contacta al usuario y procesa el upgrade manualmente en la base de datos de Firebase.</p>
      </div>
    `,
  });
}
