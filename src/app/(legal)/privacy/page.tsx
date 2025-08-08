
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad - S.A.R.A',
  description: 'Conoce cómo S.A.R.A protege y gestiona tus datos personales de acuerdo a la ley chilena.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-sm md:prose-base max-w-none text-justify">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Política de Privacidad</h1>
      
      <p className="text-sm text-muted-foreground text-center">Última actualización: 25 de julio de 2024</p>
      
      <p>
        Bienvenido a S.A.R.A ("Sistema de Administración Responsable de Arriendos"). Su privacidad es de suma importancia para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, protegemos y compartimos su información personal en cumplimiento con la Ley N° 19.628 sobre Protección de la Vida Privada en Chile.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">1. Responsable del Tratamiento de Datos</h2>
      <p>
        El responsable del tratamiento de sus datos personales es S.A.R.A SpA, con domicilio en [Dirección de la Empresa, Ciudad], Chile. Para cualquier consulta relacionada con esta política, puede contactarnos a través de <a href="mailto:privacidad@sara-app.com">privacidad@sara-app.com</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">2. ¿Qué Información Recopilamos?</h2>
      <p>
        Recopilamos la información estrictamente necesaria para la prestación de nuestros servicios de gestión de arriendos. Esto incluye:
      </p>
      <ul>
        <li><strong>Datos de Identificación:</strong> Nombre completo, Rol Único Nacional (RUN), nacionalidad, estado civil, profesión u oficio, correo electrónico, número de teléfono.</li>
        <li><strong>Datos de Autenticación:</strong> Contraseña encriptada para el acceso a su cuenta.</li>
        <li><strong>Información de Propiedades (Arrendadores):</strong> Dirección, rol de avalúo, datos del Conservador de Bienes Raíces (CBR), características de la propiedad (m², habitaciones, etc.).</li>
        <li><strong>Información de Contratos:</strong> Detalles del contrato de arriendo, incluyendo montos, plazos, condiciones y las partes involucradas.</li>
        <li><strong>Información Financiera:</strong> Datos sobre los pagos declarados y aceptados, como montos, fechas y comprobantes (si se adjuntan). No almacenamos datos de tarjetas de crédito o cuentas bancarias directamente; estos son manejados por nuestros procesadores de pago seguros.</li>
        <li><strong>Comunicaciones y Registros:</strong> Reportes de incidentes, evaluaciones, comentarios y cualquier otra comunicación realizada a través de la plataforma.</li>
        <li><strong>Datos de Navegación:</strong> Información técnica como dirección IP, tipo de navegador, sistema operativo y actividad en la plataforma para mejorar la seguridad y la experiencia de usuario (cookies).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">3. ¿Para Qué Usamos su Información?</h2>
      <p>
        Sus datos personales son utilizados para las siguientes finalidades:
      </p>
      <ul>
        <li><strong>Prestación del Servicio:</strong> Para crear y gestionar perfiles de usuario, registrar propiedades, generar y administrar contratos de arriendo, procesar pagos y gestionar incidentes.</li>
        <li><strong>Comunicación:</strong> Para enviar notificaciones transaccionales importantes sobre su cuenta, contratos, pagos o incidentes.</li>
        <li><strong>Generación de Informes:</strong> Para crear el "Informe de Comportamiento del Arrendatario" y el "Dossier Legal", funcionalidades centrales de nuestra plataforma.</li>
        <li><strong>Seguridad:</strong> Para verificar la identidad de los usuarios, prevenir fraudes y proteger la integridad de nuestra plataforma.</li>
        <li><strong>Soporte al Cliente:</strong> Para responder a sus consultas y solicitudes de soporte.</li>
        <li><strong>Mejora del Servicio:</strong> Para analizar el uso de la plataforma y mejorar su funcionalidad, usabilidad y rendimiento.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">4. ¿Con Quién Compartimos su Información?</h2>
      <p>
        La confidencialidad de sus datos es primordial. No vendemos ni arrendamos su información personal a terceros. Solo compartimos su información en las siguientes circunstancias:
      </p>
      <ul>
        <li><strong>Entre las Partes del Contrato:</strong> La información necesaria del arrendador y del arrendatario se comparte entre ellos para la correcta ejecución del contrato de arriendo gestionado a través de S.A.R.A.</li>
        <li><strong>Proveedores de Servicios:</strong> Compartimos información con terceros que nos prestan servicios, como proveedores de hosting (ej. Google Cloud, Firebase), servicios de envío de correos electrónicos y procesadores de pago. Estos proveedores están obligados contractualmente a proteger la información y solo pueden usarla para los fines específicos para los que fueron contratados.</li>
        <li><strong>Requerimientos Legales:</strong> Podremos divulgar su información si así lo exige la ley, una orden judicial o una autoridad competente en Chile.</li>
        <li><strong>Asistencia Legal:</strong> Si usted, como arrendador, solicita la asistencia de nuestro estudio de abogados asociado, compartiremos el "Dossier Legal" y sus datos de contacto con ellos para que puedan prestarle la asesoría requerida.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">5. Derechos del Titular de los Datos (Derechos ARCO)</h2>
      <p>
        De acuerdo con la Ley N° 19.628, usted tiene los siguientes derechos sobre sus datos personales:
      </p>
      <ul>
        <li><strong>Acceso:</strong> Solicitar información sobre los datos personales que tenemos sobre usted.</li>
        <li><strong>Rectificación:</strong> Pedir la corrección de sus datos si son inexactos, incompletos o erróneos.</li>
        <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos cuando su almacenamiento carezca de fundamento legal o cuando hayan caducado.</li>
        <li><strong>Oposición:</strong> Oponerse al uso de sus datos para finalidades específicas (ej. marketing, si aplicara).</li>
      </ul>
      <p>
        Para ejercer estos derechos, por favor envíe una solicitud a <a href="mailto:privacidad@sara-app.com">privacidad@sara-app.com</a>, adjuntando una copia de su cédula de identidad para verificar su titularidad. Responderemos a su solicitud en los plazos legales establecidos.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">6. Seguridad de los Datos</h2>
      <p>
        Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Estas medidas incluyen encriptación de datos, controles de acceso estrictos y auditorías de seguridad periódicas.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">7. Cookies y Tecnologías Similares</h2>
      <p>
        Utilizamos cookies esenciales para el funcionamiento de la plataforma (ej. mantener su sesión iniciada) y cookies de análisis para entender cómo se utiliza nuestro servicio y poder mejorarlo. Puede gestionar sus preferencias de cookies a través de la configuración de su navegador.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">8. Cambios a esta Política</h2>
      <p>
        Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será notificado a través de la plataforma o por correo electrónico, y la fecha de "Última actualización" en la parte superior de esta página será modificada. Le recomendamos revisar esta política periódicamente.
      </p>
    </article>
  );
}
