# Documentos legales

Versión vigente: **2026-09-13** (`src/modules/landing/legal/2026-09-13.js`), publicada a partir de
`Fluxy_Terminos_Privacidad_Profesional_2026.docx`, Partes I y II, ajustadas a lo que el sistema hace hoy.
La versión 2026-05-05 sigue publicada como historial.

## Datos del titular

- Titular: Assemble S.A.C.
- RUC y domicilio: **pendientes**. El texto dice que están en trámite. Cuando existan, completar `PROVIDER.taxId` y
  `PROVIDER.address` **en una versión nueva** (no editar la publicada) y las variables `LEGAL_PROVIDER_TAX_ID` y
  `LEGAL_PROVIDER_ADDRESS` del backend.
- Correo legal, de privacidad y de soporte: soporte@fluxyweb.com (el dominio debe recibir correo).
- Libro de Reclamaciones: `/libro-de-reclamaciones`, propio de Fluxy.

## Publicar una versión nueva

1. Crear `src/modules/landing/legal/AAAA-MM-DD.js` (no modificar los archivos publicados) y registrarlo en `documents.js`.
2. Cambiar `LegalAcceptance.TERMS_VERSION` y `PRIVACY_VERSION` en el backend al mismo valor.
3. Actualizar `documents.test.js` y correr las pruebas de ambos repos.
4. Al desplegar, las cuentas existentes verán el aviso para aceptar la nueva versión; no se les asigna una aceptación retroactiva.

## Afirmaciones que dependen del sistema

Si alguna de estas cosas cambia, el texto debe cambiar en una versión nueva:

- Planes con renovación manual por Mercado Pago; al vencer pasan al plan gratuito.
- Proveedores: Render (EE. UU.), Vercel, Cloudinary, Twilio SendGrid, Twilio SMS, Mercado Pago, Google (inicio de sesión,
  Analytics con consentimiento, Gemini), Apple, notificaciones push del navegador.
- Retención: auditoría 1 año; registros sin completar 7 días; eliminación del negocio con periodo de gracia.
- Contraseñas con hash; IP como hash en auditoría, aceptación y reclamos.
- Google Analytics del sitio solo con consentimiento; las tiendas usan la medición que conecta cada comercio.
- Exportar y eliminar el negocio desde la sección Seguridad del panel.

## Pendientes fuera del código

- Completar RUC y domicilio del titular.
- Inscribir los bancos de datos personales en el Registro Nacional de Protección de Datos Personales.
- Backups diarios de la base de datos (Render free no los tiene) antes de activar la purga.
- Procedimiento escrito de respuesta a incidentes con responsables.
- Revisión del texto por un abogado peruano.
