# Preparación de la nueva versión legal

Estado: borrador no publicado. Fuente: Fluxy_Terminos_Privacidad_Profesional_2026.docx, entregado por el titular el 13 de septiembre de 2026. No constituye una validación jurídica.

## Pendientes antes de activar

El usuario confirmó que los datos son solo para pruebas: Assemble S.A.C.; Lima; fluxyweb2026@gmail.com. El documento personal no se incorpora al repositorio; se muestra una indicación de demostración, sin presentarlo como RUC ni como DNI verificado. Sustituir la identidad y datos operativos antes de producción. Libro de Reclamaciones y aprobación jurídica: pendientes.

- Confirmar identidad o razón social, documento y domicilio del titular.
- Confirmar correos operativos de legal, privacidad y soporte, y URL del Libro de Reclamaciones.
- Validar proveedores, ubicación de datos, retención, renovaciones, gestión de derechos y revisión jurídica.
- Retirar las notas editoriales del borrador y verificar cada afirmación contra la implementación.
- Publicar un nuevo archivo inmutable; conservar las versiones anteriores y sus enlaces.
- Sincronizar la versión de LegalAcceptance en el backend con CURRENT_LEGAL_VERSION en el frontend. Probar la aceptación y rechazo de versiones desactualizadas antes de activar.
- Evaluar y habilitar nueva aceptación para cuentas existentes cuando corresponda. No asignarles una aceptación retroactiva.

## Vista previa local

Con npm run dev: /terms?version=2026-09-13-draft y /terms?doc=privacy&version=2026-09-13-draft. El borrador no está disponible en la compilación de producción.

## Guía interna proporcionada en el documento

Checklist para que el sistema actúe conforme a los documentos

Esta parte no necesita publicarse en la web. Es una guía interna para que frontend, backend y operación de Fluxy no contradigan los Términos o la Política de Privacidad.

1. Registro y aceptación

☐ Mostrar enlaces visibles a Términos y Política de Privacidad antes de crear la cuenta.

☐ Registrar la versión aceptada, fecha, hora, usuario y evidencia técnica razonable de aceptación.

☐ Evitar casillas preseleccionadas para consentimientos opcionales.

☐ Separar aceptación contractual de consentimientos promocionales cuando corresponda.

2. Multiempresa y acceso

☐ Asegurar que todas las consultas de negocio estén limitadas por company_id o tenant_id.

☐ Implementar roles y permisos reales; no depender únicamente de controles visuales del frontend.

☐ Registrar auditoría para acciones sensibles: usuarios, permisos, pagos, pedidos, inventario y configuración.

3. Planes y cobros

☐ La pantalla de pago debe mostrar precio, periodo, renovación, impuestos y condiciones relevantes antes de confirmar.

☐ No activar renovación automática si el usuario no la autorizó válidamente.

☐ Guardar el plan, precio y versión comercial aplicable a cada periodo de contratación.

☐ Distinguir claramente pagos de suscripción de Fluxy y pagos que Compradores realizan a Comercios.

4. Reembolsos y cancelación

☐ Implementar un flujo visible de cancelación o un canal claramente informado.

☐ No ocultar la cancelación ni introducir pasos diseñados para impedirla.

☐ Registrar solicitudes de reembolso y su resultado.

☐ No eliminar información que deba conservarse por obligación legal o para resolver controversias.

5. Privacidad y derechos ARCO

☐ Crear canal para solicitudes de acceso, rectificación, cancelación y oposición.

☐ Verificar identidad antes de entregar o modificar información personal.

☐ Definir responsables internos y plazos de atención.

☐ Documentar categorías de datos, finalidad, ubicación, proveedor, retención y base aplicable.

6. Datos de Compradores

☐ Separar lógicamente los datos de Compradores por Comercio.

☐ Permitir exportación y gestión de datos por el Comercio dentro de los límites legales.

☐ Evitar reutilizar datos de Compradores para marketing propio de Fluxy sin una base válida.

☐ Definir procesos de eliminación o anonimización cuando corresponda.

7. Seguridad

☐ Mantener contraseñas protegidas mediante un algoritmo robusto de hash y nunca almacenarlas en texto plano.

☐ Usar HTTPS, controles de acceso, expiración de sesiones/tokens, protección contra abuso y logs de seguridad.

☐ Disponer de backups y pruebas periódicas de restauración.

☐ Tener un procedimiento escrito de respuesta a incidentes y responsables designados.

8. Cookies y analítica

☐ Inventariar cookies y SDKs reales en producción.

☐ Diferenciar tecnologías necesarias de analítica o marketing.

☐ No mencionar Google Analytics u otro proveedor si finalmente no se utiliza.

☐ Implementar preferencias o consentimiento cuando legalmente corresponda.

9. Libro de Reclamaciones y soporte

☐ Publicar un acceso visible al Libro de Reclamaciones virtual cuando corresponda.

☐ Guardar código/constancia de cada reclamo y evidencia de respuesta.

☐ Implementar control de plazo para responder dentro del periodo legal.

☐ Diferenciar soporte técnico, reclamo de consumo y disputa entre un Comercio y su Comprador.

10. Versionado legal

☐ Guardar cada versión publicada de Términos y Política de Privacidad.

☐ No reemplazar silenciosamente textos ya aceptados sin conservar historial.

☐ Solicitar nueva aceptación cuando un cambio material requiera hacerlo.

☐ Mostrar fecha de actualización y versión vigente en el sitio.

Datos mínimos que conviene registrar para trazabilidad legal

Registro

Campos sugeridos

Finalidad

LegalAcceptance

user_id, company_id, document_type, version, accepted_at, ip/hash técnico razonable

Probar qué versión fue aceptada.

AuditLog

company_id, user_id, action, entity, entity_id, created_at

Trazabilidad y seguridad.

ConsentRecord

subject_id, purpose, granted_at, revoked_at, version

Gestionar consentimientos que dependan de autorización.

PrivacyRequest

requester, type, received_at, status, deadline, resolved_at

Gestionar derechos de titulares.

SecurityIncident

detected_at, category, impact, actions, notifications

Respuesta y cumplimiento ante incidentes.

Complaint

code, type, received_at, deadline, response_at, evidence

Gestión del Libro de Reclamaciones y soporte de cumplimiento.

Checklist de publicación

☐ Completar razón social o identidad del titular, RUC y domicilio.

☐ Crear correos bajo dominio propio para legal, privacidad y soporte.

☐ Definir el Libro de Reclamaciones y publicar su enlace.

☐ Validar proveedores reales de producción y flujos internacionales de datos.

☐ Definir política real de retención y eliminación por tipo de dato.

☐ Inscribir y mantener actualizados los bancos de datos personales que correspondan.

☐ Validar si los planes se renuevan manual o automáticamente y reflejarlo en la interfaz.

☐ Revisar el documento final con abogado peruano especializado en tecnología, consumo y privacidad.

ANEXO

Marco normativo peruano de referencia

Este anexo resume las normas utilizadas como referencia para estructurar el documento. No sustituye una revisión jurídica del caso concreto.

Norma / referencia

Relevancia para Fluxy

Ley N.° 29571 - Código de Protección y Defensa del Consumidor

Marco general de protección al consumidor en Perú.

Decreto Legislativo N.° 1729 (2026)

Modifica el Código de Consumo para fortalecer la atención de reclamos y prevenir prácticas comerciales coercitivas en comercio electrónico.

Ley N.° 29733 - Ley de Protección de Datos Personales

Marco general para el tratamiento de datos personales.

Decreto Supremo N.° 016-2024-JUS

Nuevo Reglamento de la Ley N.° 29733, vigente desde el 31 de marzo de 2025.

Reglamento del Libro de Reclamaciones y modificatorias

Regula la implementación y atención del Libro de Reclamaciones, incluidos reclamos y quejas.

Registro Nacional de Protección de Datos Personales

Los titulares de bancos de datos personales deben verificar las obligaciones de inscripción y actualización aplicables.

Fuentes oficiales consultadas

https://www.gob.pe/institucion/anpd/normas-legales/6554453-n-016-2024-jus

https://www.gob.pe/8060-inscribir-banco-de-datos-en-el-registro-nacional-de-proteccion-de-datos-personales

https://consumidor.gob.pe/libro-de-reclamaciones/

https://consumidor.gob.pe/2026/02/12/codigo-de-consumo-introduce-cambios-para-garantizar-un-comercio-electronico-sin-practicas-abusivas/

Cierre

El documento está diseñado para ser más estable que la versión anterior: evita fijar precios concretos, no amarra la política a una tecnología específica y separa claramente a Fluxy, el Comercio y el Comprador. Antes de publicación, debe completarse con la identidad legal real y validarse contra la implementación de producción.
