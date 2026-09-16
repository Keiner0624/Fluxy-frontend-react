// Versión publicada el 13 de septiembre de 2026.
// Fuente: Fluxy_Terminos_Privacidad_Profesional_2026.docx (Partes I y II), ajustada a lo que
// el sistema hace hoy. Es inmutable: un cambio de texto es una versión nueva.

export const PROVIDER = Object.freeze({
  name: 'Assemble S.A.C.',
  taxId: null,
  address: null,
  site: 'fluxyweb.com',
  legalEmail: 'soporte@fluxyweb.com',
  privacyEmail: 'soporte@fluxyweb.com',
  supportEmail: 'soporte@fluxyweb.com',
  complaintsPath: '/libro-de-reclamaciones',
})

const TAX_ID = PROVIDER.taxId ? `con RUC ${PROVIDER.taxId}` : 'cuyo RUC se encuentra en trámite y se publicará en este documento apenas esté disponible'
const ADDRESS = PROVIDER.address ? `con domicilio en ${PROVIDER.address}` : 'con domicilio que se informará en este documento y a quien lo solicite por correo'
const PROVIDER_LINE = `${PROVIDER.name}, ${TAX_ID}, ${ADDRESS}`

const terms = [
  {
    id: '1',
    title: '1. Identificación del proveedor y aceptación',
    content: `Los presentes Términos y Condiciones regulan el acceso y uso de Fluxy, una plataforma de software como servicio (SaaS) disponible a través de ${PROVIDER.site} y de las direcciones o aplicaciones asociadas al servicio.

El servicio es prestado por ${PROVIDER_LINE}, en adelante "Fluxy", "nosotros" o "el proveedor".

Al crear una cuenta, contratar un plan o utilizar las funcionalidades de Fluxy, el usuario declara haber leído y aceptado estos Términos y Condiciones, así como la Política de Privacidad vigente. Cuando una persona utiliza Fluxy en representación de una empresa o negocio, declara contar con facultades suficientes para vincular a dicha organización.

Las cuentas empresariales deben ser creadas y administradas por personas con capacidad legal suficiente para contratar o por representantes debidamente autorizados.`,
  },
  {
    id: '2',
    title: '2. Definiciones',
    content: `• Plataforma: el software, sitio web, panel de administración, API, integraciones y demás componentes que conforman Fluxy.
• Usuario: la persona que crea una cuenta o accede al panel de administración de Fluxy.
• Comercio: la persona natural con negocio o persona jurídica que utiliza Fluxy para gestionar su actividad comercial.
• Tienda: el espacio digital público generado o administrado mediante Fluxy para exhibir productos, recibir pedidos u ofrecer información comercial.
• Comprador: la persona que interactúa o realiza un pedido en una tienda administrada por un Comercio mediante Fluxy.
• Pedido: el registro de una intención u operación de compra generada dentro de una tienda, sujeto a confirmación y gestión por el Comercio.
• Plan: la modalidad de acceso a Fluxy con determinadas funciones, límites y condiciones comerciales.
• Contenido: textos, marcas, fotografías, logos, descripciones, archivos, precios, productos y demás información cargada por el Usuario o el Comercio.
• Servicios de terceros: servicios externos integrados o utilizados por Fluxy, como proveedores de pagos, alojamiento, correo, mensajería, analítica o almacenamiento de imágenes.`,
  },
  {
    id: '3',
    title: '3. Objeto y naturaleza de Fluxy',
    content: `Fluxy proporciona herramientas tecnológicas para que negocios y comercios administren su presencia y operación digital. Según el plan y las funciones habilitadas, la Plataforma permite la gestión de productos, categorías, inventario, pedidos, clientes, cobros, cupones, métricas, reportes, apariencia de la tienda, usuarios de equipo, integraciones y otras herramientas relacionadas con la gestión comercial.

Fluxy es un proveedor de tecnología. Salvo que una funcionalidad específica indique expresamente lo contrario, Fluxy no es el vendedor, fabricante, distribuidor, importador, transportista ni propietario de los productos ofrecidos por los Comercios.

La compraventa o relación comercial respecto de los productos ofrecidos en una Tienda se produce entre el Comercio y su Comprador. El Comercio es responsable de sus productos, precios, existencias, promociones, condiciones de venta, comprobantes, garantías, entregas, devoluciones, obligaciones tributarias y atención al comprador, incluido su propio Libro de Reclamaciones cuando la ley se lo exija.`,
  },
  {
    id: '4',
    title: '4. Registro, cuenta y seguridad de acceso',
    content: `Para utilizar las funciones administrativas de Fluxy es necesario crear una cuenta y proporcionar información veraz, vigente y completa. El registro se completa al verificar el correo electrónico y, cuando corresponda, el número de celular.

El Usuario es responsable de custodiar sus credenciales y de las actividades realizadas desde su cuenta, salvo aquellas atribuibles a fallas de seguridad imputables al proveedor.

Fluxy aplica mecanismos de verificación, recuperación de acceso, expiración de sesiones, confirmación de identidad para acciones sensibles y controles contra accesos no autorizados. El Usuario puede iniciar sesión con su contraseña o con una cuenta de Google o Apple. Si el correo de la cuenta de Google o Apple coincide con el de una cuenta de Fluxy ya verificada y el proveedor garantiza ese correo, ambas quedan vinculadas y Fluxy lo avisa por correo; la vinculación puede retirarse desde Seguridad.

El Usuario debe actualizar la información de su cuenta y comunicar sin demora cualquier uso no autorizado o incidente que afecte sus credenciales.`,
  },
  {
    id: '5',
    title: '5. Creación y administración del negocio',
    content: `El Usuario puede registrar un negocio o Comercio dentro de Fluxy y administrar la información necesaria para operar la Tienda.

El Comercio es responsable de que su nombre, datos de contacto, información tributaria, ubicación, políticas comerciales y demás información visible al público sean correctos y se mantengan actualizados.

Fluxy puede solicitar información razonable para verificar identidad, titularidad del negocio o cumplimiento de requisitos legales y de seguridad.`,
  },
  {
    id: '6',
    title: '6. Equipo, roles y permisos',
    content: `Cuando el plan lo permita, el titular del Comercio puede invitar a otros usuarios y asignarles roles o permisos. Los permisos se aplican en el servidor, no solo en la interfaz.

El propietario o administrador del Comercio es responsable de gestionar adecuadamente dichos accesos y retirar permisos cuando una persona deje de estar autorizada. Desactivar a un integrante cierra sus sesiones.

Fluxy registra acciones relevantes realizadas dentro de una cuenta (accesos, cambios de equipo, configuración, cobros, cancelaciones, ajustes de inventario, exportaciones y otras operaciones sensibles) con fines de seguridad, trazabilidad, soporte y prevención de fraude. El Comercio puede consultarlas en la sección Actividad según su rol.`,
  },
  {
    id: '7',
    title: '7. Productos, contenido y propiedad del Comercio',
    content: `El Comercio conserva la titularidad sobre sus marcas, logos, fotografías, descripciones, productos y demás Contenido que incorpore a Fluxy.

Al cargar Contenido, el Comercio concede a Fluxy una licencia limitada, no exclusiva y durante el tiempo necesario para alojar, procesar, adaptar técnicamente, transmitir y mostrar dicho Contenido únicamente para prestar y mejorar el servicio.

Cuando el Comercio utiliza las herramientas de redacción asistida por inteligencia artificial, el texto que solicita se envía al proveedor de ese servicio para generar la propuesta. El Comercio debe revisar el resultado antes de publicarlo y es responsable de lo que finalmente publique.

El Comercio declara que cuenta con derechos suficientes para utilizar el Contenido y que su publicación no vulnera derechos de terceros.`,
  },
  {
    id: '8',
    title: '8. Uso aceptable y actividades prohibidas',
    content: `No se permite utilizar Fluxy para actividades contrarias a la legislación peruana, para fraude, suplantación de identidad, phishing, malware, spam, acceso no autorizado, explotación abusiva de la infraestructura o vulneración de derechos de terceros.

El Comercio no debe publicar productos o servicios cuya comercialización esté prohibida por ley o que requiera autorizaciones que no posea.

Fluxy podrá restringir, ocultar o suspender contenido o cuentas cuando existan indicios razonables de fraude, riesgo de seguridad, incumplimiento legal, violación de estos Términos o afectación grave a terceros.`,
  },
  {
    id: '9',
    title: '9. Pedidos, inventario y operación comercial',
    content: `Fluxy registra y facilita la gestión de Pedidos, pero la aceptación, preparación, entrega, cancelación y atención posterior corresponden al Comercio, salvo que se indique expresamente otra cosa en una funcionalidad concreta.

Las existencias mostradas dependen de la información administrada por el Comercio y de los movimientos registrados en la Plataforma. El Comercio debe revisar y mantener actualizados sus niveles de inventario.

Fluxy ofrece controles de stock, historial de movimientos, estados de pedido, alertas y automatizaciones. Tales herramientas no sustituyen las obligaciones de control interno del Comercio.`,
  },
  {
    id: '10',
    title: '10. Pagos de compradores y servicios financieros de terceros',
    content: `Los pagos que los Compradores hacen a un Comercio se acuerdan entre ambos. En Fluxy el Comercio registra y confirma esos cobros; Fluxy no recibe ni custodia ese dinero.

Cuando una Tienda habilite pagos mediante un proveedor externo, el procesamiento de la operación está sujeto además a los términos, políticas y controles de dicho proveedor.

Fluxy no almacena números de tarjeta ni otra información financiera sensible: los pagos con tarjeta los procesa directamente el proveedor de pagos.

El Comercio es responsable de verificar la recepción efectiva de los fondos, gestionar devoluciones o contracargos que le correspondan y cumplir las obligaciones asociadas a sus ventas.`,
  },
  {
    id: '11',
    title: '11. Planes, precios y límites de uso',
    content: `Fluxy ofrece un plan gratuito y planes de pago. Las funciones, límites, periodos, precios e impuestos aplicables son los informados en la página de precios y durante el proceso de contratación vigente.

Los precios no se incorporan como importes fijos a estos Términos para evitar contradicciones cuando exista una actualización comercial. Cualquier cambio aplicable a una contratación vigente será comunicado conforme a la legislación y a las condiciones informadas al Usuario.

Fluxy puede aplicar límites razonables de productos, usuarios, pedidos, almacenamiento, integraciones, uso de API u otras métricas de acuerdo con el Plan contratado.`,
  },
  {
    id: '12',
    title: '12. Facturación, renovación y cobros',
    content: `Antes de confirmar un pago, Fluxy informa el importe, periodo, modalidad de renovación y condiciones relevantes de la contratación. Los pagos de los planes se procesan a través de Mercado Pago.

Los planes de pago se contratan por periodos y se renuevan de forma manual. Fluxy no realiza cobros recurrentes automáticos.

Al finalizar el periodo pagado sin renovación, la cuenta pasa al plan gratuito y conserva su información, con las funciones y límites de ese plan.

Los comprobantes y obligaciones tributarias aplicables al servicio de Fluxy se emitirán de acuerdo con la situación legal y tributaria del proveedor.`,
  },
  {
    id: '13',
    title: '13. Cancelación, cambios de plan y reembolsos',
    content: `El Usuario puede dejar de renovar su Plan en cualquier momento y puede programar la eliminación de su negocio desde la sección Seguridad del panel, con un periodo de gracia durante el cual puede anularla. También puede solicitar la cancelación escribiendo a ${PROVIDER.supportEmail}. La cancelación no elimina derechos u obligaciones generados antes de la fecha efectiva de terminación.

Las solicitudes de reembolso se reciben en ${PROVIDER.supportEmail} o mediante el Libro de Reclamaciones y se responden por escrito. Estas condiciones no limitan los derechos que correspondan al consumidor conforme a la legislación peruana.

Cuando una devolución resulte procedente, podrá estar sujeta a los tiempos operativos del proveedor de pagos utilizado.`,
  },
  {
    id: '14',
    title: '14. Disponibilidad, mantenimiento y evolución del servicio',
    content: `Fluxy procura mantener la Plataforma disponible y segura, pero no garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores.

Pueden producirse mantenimientos programados o urgentes, fallas de conectividad, indisponibilidad de proveedores externos, actualizaciones, incidentes de seguridad o eventos fuera del control razonable de Fluxy.

Fluxy puede añadir, mejorar, reorganizar o retirar funciones. Cuando un cambio afecte materialmente una función esencial ya contratada, se procurará comunicarlo con antelación razonable cuando sea posible.

Los negocios en el plan gratuito que no registran actividad durante periodos prolongados pasan por etapas de aviso, suspensión de la recepción de pedidos y archivo, informadas previamente al titular. Cualquier actividad del titular los reactiva mientras no hayan sido eliminados.`,
  },
  {
    id: '15',
    title: '15. Integraciones, API y servicios de terceros',
    content: `Fluxy se integra con proveedores externos de pagos, correo, mensajería de texto, alojamiento, almacenamiento de imágenes, analítica, inicio de sesión y redacción asistida.

La disponibilidad de una integración puede depender de condiciones técnicas o comerciales del tercero y puede variar con el tiempo.

El Comercio puede conectar a su Tienda herramientas propias de medición (por ejemplo, Google Analytics o Meta Pixel). En ese caso, el Comercio es responsable de ese tratamiento frente a sus Compradores.

El Usuario debe proteger las claves, tokens o credenciales de integraciones que estén bajo su control y no debe utilizarlas para acceder a recursos no autorizados.`,
  },
  {
    id: '16',
    title: '16. Propiedad intelectual de Fluxy',
    content: `El software, interfaces, diseño, documentación, marca, nombre comercial, código, componentes visuales y demás elementos propios de Fluxy se encuentran protegidos por las normas de propiedad intelectual aplicables.

El acceso a la Plataforma no transfiere al Usuario derechos de propiedad sobre dichos elementos. No se permite copiar, revender, sublicenciar, descompilar, explotar comercialmente o utilizar Fluxy fuera de los derechos concedidos por estos Términos y por el Plan contratado, salvo autorización o excepción legal aplicable.`,
  },
  {
    id: '17',
    title: '17. Protección de datos personales',
    content: `El tratamiento de datos personales relacionado con Fluxy se rige además por la Política de Privacidad.

Cuando Fluxy procesa datos personales por cuenta de un Comercio para prestar el servicio, actúa como encargado de tratamiento y respeta la normativa peruana de protección de datos. Las responsabilidades adicionales de cada parte podrán documentarse mediante condiciones de tratamiento cuando corresponda.`,
  },
  {
    id: '18',
    title: '18. Seguridad e incidentes',
    content: `Fluxy adopta medidas técnicas y organizativas razonables orientadas a preservar la confidencialidad, integridad y disponibilidad de la información.

Ningún sistema conectado a Internet puede considerarse absolutamente seguro. Ante incidentes que comprometan datos personales, Fluxy actuará conforme a las obligaciones de evaluación, documentación y notificación que resulten aplicables.`,
  },
  {
    id: '19',
    title: '19. Suspensión y terminación',
    content: `Fluxy puede suspender temporalmente una cuenta cuando existan riesgos de seguridad, fraude, falta de pago, uso abusivo, requerimientos de autoridad competente o incumplimientos relevantes de estos Términos.

Cuando las circunstancias lo permitan, se comunicará al Usuario el motivo y las acciones necesarias para restablecer el servicio.

El titular puede exportar la información de su negocio desde la sección Seguridad del panel antes de su eliminación. La terminación de la cuenta implica la pérdida de acceso a las funciones del servicio una vez vencido el periodo de gracia informado.`,
  },
  {
    id: '20',
    title: '20. Responsabilidad',
    content: `Cada Comercio es responsable de su actividad comercial y de las obligaciones frente a sus Compradores. Fluxy no responde por la calidad, legalidad, seguridad, entrega o garantía de productos ofrecidos por terceros a través de las Tiendas, salvo responsabilidad que legalmente le corresponda por sus propios actos u omisiones.

Las limitaciones de responsabilidad contenidas en estos Términos se interpretarán dentro de los límites permitidos por la legislación peruana y no excluirán derechos inderogables del consumidor.`,
  },
  {
    id: '21',
    title: '21. Atención, reclamos y Libro de Reclamaciones',
    content: `Las consultas y el soporte sobre el servicio se atienden en ${PROVIDER.supportEmail}.

Fluxy pone a disposición un Libro de Reclamaciones virtual en ${PROVIDER.site}${PROVIDER.complaintsPath}, accesible desde el pie de página del sitio. Al registrar un reclamo o una queja se entrega un código de constancia y una copia por correo electrónico.

Los reclamos y quejas presentados mediante el Libro de Reclamaciones se atienden dentro del plazo legal aplicable. El Libro de Reclamaciones de Fluxy es para el servicio que presta Fluxy; los reclamos sobre productos comprados en una Tienda deben dirigirse al Comercio que los vende.`,
  },
  {
    id: '22',
    title: '22. Modificación de los Términos',
    content: `Fluxy puede actualizar estos Términos por cambios legales, operativos, de seguridad o del servicio. La versión vigente indica su fecha de última actualización y las versiones anteriores quedan disponibles en esta misma página.

Cuando una modificación sea material, Fluxy la comunicará en la Plataforma y pedirá a los Usuarios existentes que acepten la nueva versión. Fluxy registra qué versión aceptó cada Usuario y cuándo.`,
  },
  {
    id: '23',
    title: '23. Ley aplicable, jurisdicción y contacto',
    content: `Estos Términos se interpretan conforme a las leyes de la República del Perú, sin perjuicio de los derechos y fueros imperativos que correspondan al consumidor.

• Titular: ${PROVIDER.name}
• RUC: ${PROVIDER.taxId || 'en trámite'}
• Domicilio: ${PROVIDER.address || 'se informará en este documento'}
• Consultas legales y soporte: ${PROVIDER.legalEmail}
• Libro de Reclamaciones: ${PROVIDER.site}${PROVIDER.complaintsPath}
• Sitio web: ${PROVIDER.site}`,
  },
]

const privacy = [
  {
    id: 'p1',
    title: '1. Responsable del tratamiento',
    content: `El responsable de los datos tratados para administrar las cuentas de Fluxy es ${PROVIDER_LINE}. Correo de privacidad: ${PROVIDER.privacyEmail}.

Cuando Fluxy procesa datos personales por cuenta de un Comercio que utiliza la Plataforma (por ejemplo, los datos de sus Compradores), actúa como encargado del tratamiento.`,
  },
  {
    id: 'p2',
    title: '2. Alcance',
    content: `Esta Política se aplica a los datos personales tratados a través del sitio web, registro, panel de administración, Tiendas, formularios, Libro de Reclamaciones, soporte, analítica, pagos e integraciones de Fluxy.

No regula el tratamiento que un Comercio realice por finalidades propias fuera de Fluxy. Cada Comercio es responsable de informar a sus Compradores sobre los tratamientos que efectúe como titular de sus propios bancos de datos, cuando corresponda.`,
  },
  {
    id: 'p3',
    title: '3. Datos que recopilamos',
    content: `• Datos de cuenta: nombre, correo electrónico, contraseña protegida con un algoritmo de hash robusto (nunca en texto plano), celular y datos necesarios para autenticación o recuperación. Si el Usuario entra con Google o Apple, recibimos el identificador de esa cuenta y su correo.
• Datos del negocio: nombre comercial, RUC o documento cuando se informa, dirección, rubro, información de contacto, configuración de tienda y datos del plan contratado.
• Datos de operación: productos, categorías, inventario, precios, cupones, pedidos, cobros, estados, movimientos y métricas generadas por el uso de la Plataforma.
• Datos de equipo: identidad, correo, rol, permisos, invitaciones y registros de actividad de usuarios autorizados por el Comercio.
• Datos de Compradores: los datos que un Comprador facilite al Comercio mediante una Tienda, como nombre, teléfono, dirección de entrega, información del pedido y medio de pago elegido.
• Datos técnicos: dirección IP, identificadores de sesión, navegador, dispositivo, fecha y hora de acceso, registros de seguridad y diagnóstico. En los registros de actividad la dirección IP se guarda como un valor cifrado de una vía (hash).
• Datos de reclamos y soporte: los datos y mensajes que se entregan al registrar un reclamo o una queja o al solicitar asistencia.`,
  },
  {
    id: 'p4',
    title: '4. Finalidades del tratamiento',
    content: `• Crear y administrar cuentas, Comercios y Tiendas.
• Prestar las funciones contratadas, procesar Pedidos y mantener la operación de la Plataforma.
• Gestionar autenticación, seguridad, prevención de fraude, auditoría y soporte.
• Procesar pagos de planes y conciliar operaciones asociadas al servicio.
• Enviar comunicaciones operativas, como códigos de verificación, confirmaciones, alertas de seguridad, vencimientos, incidencias y avisos relacionados con la cuenta.
• Atender reclamos, quejas y solicitudes de derechos.
• Medir el uso del sitio para mejorar estabilidad, experiencia y funciones, solo con el consentimiento del visitante.
• Cumplir obligaciones legales, responder requerimientos de autoridad y ejercer o defender derechos.`,
  },
  {
    id: 'p5',
    title: '5. Base y consentimiento',
    content: `Fluxy trata datos personales conforme a la Ley N.° 29733, su Reglamento aprobado por Decreto Supremo N.° 016-2024-JUS y demás normas aplicables. La mayor parte del tratamiento es necesaria para ejecutar la relación contractual con el Usuario. Cuando el tratamiento requiere consentimiento, este se solicita de forma libre, previa, expresa, informada e inequívoca, sin casillas preseleccionadas.

Fluxy no envía comunicaciones promocionales sin autorización. El Usuario puede retirar su consentimiento para finalidades que dependan de él, sin afectar la licitud de tratamientos previos.`,
  },
  {
    id: 'p6',
    title: '6. Datos de los Compradores de las Tiendas',
    content: `Cuando un Comercio recoge datos de sus Compradores mediante una Tienda, dicho Comercio determina las finalidades comerciales de ese tratamiento y debe cumplir las obligaciones que le correspondan como titular de datos.

Fluxy procesa dichos datos en la medida necesaria para proporcionar infraestructura, almacenamiento, visualización, gestión de pedidos, soporte, seguridad y las demás funciones contratadas por el Comercio. Los datos de cada Comercio están separados de los de los demás.

Fluxy no utiliza los datos de Compradores para marketing propio ni para finalidades incompatibles con la prestación del servicio.`,
  },
  {
    id: 'p7',
    title: '7. Proveedores y destinatarios',
    content: `Fluxy recurre a los siguientes proveedores para prestar el servicio:

• Render: servidores de la aplicación y base de datos.
• Vercel: publicación del sitio web y de los dominios de las Tiendas.
• Cloudinary: almacenamiento y entrega de imágenes.
• Twilio SendGrid: envío de correos electrónicos.
• Twilio: envío de códigos por mensaje de texto (SMS).
• Mercado Pago: procesamiento de pagos de planes.
• Google: inicio de sesión con Google, medición del sitio con Google Analytics (con consentimiento) y redacción asistida con Gemini.
• Apple: inicio de sesión con Apple.
• Servicios de notificaciones del navegador: avisos push que el Usuario activa en su dispositivo.

Fluxy puede comunicar información a autoridades cuando exista una obligación legal o requerimiento válido.`,
  },
  {
    id: 'p8',
    title: '8. Transferencias y flujos transfronterizos',
    content: `Los proveedores indicados tratan o almacenan información fuera del Perú; en particular, los servidores y la base de datos de Fluxy se alojan en Estados Unidos. Fluxy selecciona proveedores con garantías adecuadas de seguridad y adopta las medidas exigidas por la normativa peruana para estas transferencias.`,
  },
  {
    id: 'p9',
    title: '9. Seguridad',
    content: `Fluxy aplica medidas técnicas y organizativas proporcionales a los riesgos, entre ellas: controles de acceso por rol aplicados en el servidor, contraseñas protegidas con hash, cifrado en tránsito (HTTPS), sesiones con vencimiento y cierre remoto, verificación de identidad para acciones sensibles, límites contra abuso, separación lógica de los datos de cada Comercio, registros de auditoría y un procedimiento de respuesta a incidentes.`,
  },
  {
    id: 'p10',
    title: '10. Conservación',
    content: `Los datos se conservan durante el tiempo necesario para prestar el servicio, mantener la relación contractual, atender soporte, proteger la seguridad, resolver disputas y cumplir obligaciones legales. En particular:

• Registros de actividad y seguridad: 1 año.
• Registros iniciados y no completados: se eliminan a los 7 días.
• Negocio cuya eliminación programa el titular: se elimina al terminar el periodo de gracia informado, salvo la información que deba conservarse por obligación legal.
• Reclamos y quejas: al menos el plazo que exige la normativa de protección al consumidor.

La eliminación de una cuenta no implica necesariamente la desaparición inmediata de toda copia cuando exista una obligación legal o un periodo técnico razonable de respaldo.`,
  },
  {
    id: 'p11',
    title: '11. Cookies, analítica y tecnologías similares',
    content: `Fluxy utiliza almacenamiento local del navegador estrictamente necesario para mantener la sesión, recordar preferencias (como el tema claro u oscuro) y proteger la cuenta. Estas tecnologías no requieren consentimiento.

Fluxy utiliza Google Analytics para medir el uso del sitio solo si el visitante lo acepta en el aviso de cookies. La elección puede cambiarse en cualquier momento desde el enlace "Cookies" del pie de página.

Las Tiendas pueden cargar herramientas de medición conectadas por su Comercio (Google Analytics o Meta Pixel); en ese caso, el Comercio es responsable de ese tratamiento.`,
  },
  {
    id: 'p12',
    title: '12. Derechos de los titulares',
    content: `Los titulares pueden ejercer los derechos reconocidos por la normativa peruana, incluidos los derechos de acceso, rectificación, cancelación y oposición (ARCO), así como los demás que resulten aplicables.

Las solicitudes se dirigen a ${PROVIDER.privacyEmail} y se atienden conforme a los requisitos y plazos legales. Fluxy puede solicitar información razonable para verificar la identidad del solicitante y evitar accesos indebidos. El titular de un negocio puede además corregir sus datos desde el panel, exportar la información de su negocio y programar su eliminación desde la sección Seguridad del panel.

Si considera que su solicitud no fue atendida, puede acudir a la Autoridad Nacional de Protección de Datos Personales.`,
  },
  {
    id: 'p13',
    title: '13. Incidentes de seguridad',
    content: `Fluxy mantiene un procedimiento de gestión de incidentes que permite detectar, contener, analizar y documentar eventos de seguridad.

Cuando un incidente de seguridad que involucre datos personales genere obligaciones de notificación a la Autoridad Nacional de Protección de Datos Personales o a los titulares, Fluxy actuará conforme a los plazos y condiciones legales vigentes.`,
  },
  {
    id: 'p14',
    title: '14. Bancos de datos personales',
    content: `Fluxy mantiene bancos de datos de usuarios, clientes de sus planes, reclamos y soporte. Su titular gestiona su inscripción y actualización en el Registro Nacional de Protección de Datos Personales conforme a la normativa aplicable.`,
  },
  {
    id: 'p15',
    title: '15. Menores de edad',
    content: `Fluxy está orientado a la gestión de negocios. Las cuentas de administración deben ser creadas por personas con capacidad legal suficiente o representantes autorizados.

Si una Tienda permite que menores interactúen como Compradores, el Comercio deberá cumplir las reglas aplicables al tratamiento de sus datos y a la contratación, de acuerdo con la naturaleza de sus productos y servicios.`,
  },
  {
    id: 'p16',
    title: '16. Cambios y contacto',
    content: `Fluxy puede actualizar esta Política para reflejar cambios regulatorios, técnicos u operativos. La versión vigente indica su fecha de actualización y las anteriores quedan disponibles en esta misma página.

• Consultas sobre privacidad y ejercicio de derechos: ${PROVIDER.privacyEmail}
• Titular: ${PROVIDER.name}
• Domicilio: ${PROVIDER.address || 'se informará en este documento'}`,
  },
]

export default Object.freeze({
  version: '2026-09-13',
  updatedAt: '13 de septiembre de 2026',
  status: 'PUBLISHED',
  provider: PROVIDER,
  sections: { terms, privacy },
})
