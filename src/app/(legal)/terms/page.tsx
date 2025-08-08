
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones - S.A.R.A',
  description: 'Términos y condiciones de uso de la plataforma S.A.R.A para arrendadores y arrendatarios.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-sm md:prose-base max-w-none text-justify">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Términos y Condiciones de Uso</h1>
      
      <p className="text-sm text-muted-foreground text-center">Última actualización: 25 de julio de 2024</p>

      <p>
        Estos Términos y Condiciones ("Términos") rigen el uso de la plataforma S.A.R.A ("Sistema de Administración Responsable de Arriendos"), accesible a través de nuestro sitio web y aplicaciones móviles (la "Plataforma"). Al registrarse y utilizar nuestros servicios, usted ("Usuario") acepta cumplir y quedar vinculado por estos Términos.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">1. Descripción del Servicio</h2>
      <p>
        S.A.R.A es una plataforma tecnológica que facilita la gestión de contratos de arrendamiento entre arrendadores y arrendatarios. Los servicios incluyen, entre otros, la creación de perfiles, registro de propiedades, generación y gestión de contratos digitales, declaración y registro de pagos, gestión de incidentes y la generación de informes de comportamiento. S.A.R.A actúa como un intermediario tecnológico y no es parte de ningún contrato de arriendo.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">2. Cuentas de Usuario</h2>
      <ul>
        <li><strong>Elegibilidad:</strong> Para usar la Plataforma, debe ser mayor de 18 años y tener capacidad legal para contratar en Chile.</li>
        <li><strong>Registro:</strong> Usted se compromete a proporcionar información veraz, completa y actualizada durante el proceso de registro y a mantenerla actualizada.</li>
        <li><strong>Seguridad de la Cuenta:</strong> Usted es el único responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran en su cuenta. Notificará a S.A.R.A inmediatamente sobre cualquier uso no autorizado.</li>
        <li><strong>Roles:</strong> Al registrarse, deberá elegir un rol ("Arrendador" o "Arrendatario"). Este rol determinará las funcionalidades a las que tendrá acceso.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">3. Obligaciones de los Usuarios</h2>
      <p><strong>Para todos los Usuarios:</strong></p>
      <ul>
        <li>Utilizar la Plataforma de manera lícita y de acuerdo con estos Términos.</li>
        <li>No utilizar la Plataforma para fines fraudulentos, ilegales o que infrinjan los derechos de terceros.</li>
        <li>Respetar la veracidad de la información ingresada, incluyendo datos personales, detalles de propiedades, pagos e incidentes. S.A.R.A. no se hace responsable por la información errónea o falsa ingresada por los usuarios.</li>
      </ul>
      <p><strong>Para Arrendadores:</strong></p>
      <ul>
        <li>Asegurarse de tener el derecho legal para arrendar las propiedades que registran en la Plataforma.</li>
        <li>Proporcionar descripciones precisas de las propiedades y las condiciones del arriendo.</li>
        <li>Revisar y gestionar de manera oportuna los pagos declarados y los incidentes reportados por los arrendatarios.</li>
      </ul>
      <p><strong>Para Arrendatarios:</strong></p>
      <ul>
        <li>Cumplir con las obligaciones estipuladas en los contratos de arriendo gestionados a través de la Plataforma.</li>
        <li>Declarar los pagos de manera veraz, adjuntando comprobantes fidedignos cuando sea necesario.</li>
        <li>Utilizar el sistema de reporte de incidentes de manera responsable.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">4. Contratos y Firma Digital</h2>
      <ul>
        <li>S.A.R.A provee una herramienta para la generación y aceptación de contratos. La validez legal del acuerdo es responsabilidad de las partes.</li>
        <li>La "firma" o "aceptación" digital a través de la Plataforma, mediante la cual el usuario manifiesta su consentimiento con el contenido del contrato, se considerará como una manifestación de voluntad válida y vinculante para las partes, de acuerdo a la legislación chilena sobre documentos y firma electrónica.</li>
        <li>Una vez que ambas partes han aceptado el contrato, este se considerará activo y las funcionalidades asociadas (pagos, incidentes) quedarán habilitadas.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">5. Informe de Comportamiento y Dossier Legal</h2>
      <ul>
        <li>El "Informe de Comportamiento del Arrendatario" y el "Dossier Legal" se generan automáticamente a partir de la información registrada en la Plataforma por los usuarios (pagos, incidentes, evaluaciones, etc.).</li>
        <li>S.A.R.A no garantiza la exactitud o integridad de estos informes, ya que dependen de la veracidad de los datos ingresados por las partes. Estos documentos son herramientas de apoyo y no constituyen asesoría legal.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">6. Propiedad Intelectual</h2>
      <p>
        Todo el contenido de la Plataforma, incluyendo software, textos, gráficos, logos e imágenes, es propiedad exclusiva de S.A.R.A SpA y está protegido por las leyes de propiedad intelectual chilenas e internacionales. No está permitida su reproducción o uso sin nuestro consentimiento explícito.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">7. Limitación de Responsabilidad</h2>
      <p>
        S.A.R.A es una plataforma de software y no se responsabiliza por:
      </p>
      <ul>
        <li>El cumplimiento de las obligaciones de los contratos de arriendo entre arrendadores y arrendatarios.</li>
        <li>La veracidad o exactitud de la información ingresada por los usuarios.</li>
        <li>Disputas, conflictos o daños de cualquier tipo que surjan de la relación entre arrendador y arrendatario.</li>
        <li>La interrupción del servicio debido a fallas técnicas fuera de nuestro control razonable.</li>
      </ul>
      <p>
        Nuestra responsabilidad total, por cualquier causa, se limitará al monto pagado por el usuario por los servicios durante los tres (3) meses anteriores al evento que dio origen a la reclamación.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">8. Modificación y Terminación</h2>
      <p>
        Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones serán efectivas tras su publicación en la Plataforma. El uso continuado del servicio constituirá su aceptación de los nuevos Términos.
      </p>
      <p>
        Podemos suspender o cancelar su cuenta si usted incumple gravemente estos Términos, sin perjuicio de las acciones legales que correspondan.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-primary/90">9. Ley Aplicable y Jurisdicción</h2>
      <p>
        Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República de Chile. Para cualquier controversia, las partes fijan su domicilio en la ciudad y comuna de Santiago y se someten a la jurisdicción de sus Tribunales Ordinarios de Justicia.
      </p>
    </article>
  );
}
