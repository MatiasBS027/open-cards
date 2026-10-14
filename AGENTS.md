# AGENTS.md — Instrucciones para agentes de código (Cursor, etc.)

Proyecto: **Open Cards**, app de flashcards local-first. En teléfono el camino principal es el **APK** (Capacitor); GitHub Pages sirve de demo web. La fuente de verdad del producto es `SPEC.md`. Si algo no está claro, **pregunta o pide decidir**; no inventes funciones fuera del alcance del MVP (§18 del SPEC).

## Stack

TypeScript estricto, Vite, React, Dexie (IndexedDB), MathLive, KaTeX, CodeMirror 6, `@dnd-kit`, `vite-plugin-pwa`, Vitest, Ajv, React Router con `HashRouter`. Gestor de paquetes: **pnpm** (`pnpm-lock.yaml`; no uses npm/package-lock). Android: Capacitor (`android/`).

## Idioma

- Interfaz de usuario: **español**.
- Código, nombres de variables/funciones/tipos, campos JSON, mensajes de commit y comentarios: **inglés**.

## Arquitectura (obligatoria)

- `src/domain/`: TypeScript puro. **Sin imports de React, Dexie, DOM ni librerías de UI.** Aquí viven tipos, transiciones de estado, orden, normalización de etiquetas y validación.
- `src/storage/`: Dexie, repositorios y migraciones.
- `src/importExport/`: validación con Ajv usando `schema/open-cards.v1.schema.json`, borradores y exportación.
- `src/update/`: consulta a GitHub Releases (versión / APK); sin lógica de UI.
- `src/ui/`: componentes React.
- `src/config.ts`: constantes (límites de importación, tiempo de deshacer, días de aviso de respaldo, repo/versión). No dispersar números mágicos. `APP_VERSION` se inyecta desde `package.json` vía Vite `define`.
- Dependencias permitidas: `ui` → `storage`/`importExport`/`update` → `domain`. Nunca al revés.

## Reglas de negocio que no se rompen

- Estados: `unseen`, `seen`, `understood`, `needs_review` con las reglas de SPEC §6. Editar el **contenido** reinicia a `unseen`; guardar sin cambios o cambiar metadatos del mazo, no.
- La importación **nunca** guarda sin confirmación explícita y siempre pasa por un borrador editable.
- Importar crea mazos nuevos con IDs nuevos.
- Nunca inventar tarjetas.
- El orden de las tarjetas es `position` en la base de datos y el orden del arreglo en JSON.
- El orden aleatorio solo afecta a la sesión de estudio.

## Seguridad (requisito)

- Prohibido `dangerouslySetInnerHTML` / `innerHTML` con contenido de tarjetas. Texto y código se renderizan como nodos de texto.
- KaTeX siempre con `trust: false`; su salida es el único HTML inyectado permitido.
- Nunca ejecutar ni evaluar contenido importado ni código de tarjetas.
- Respetar los límites de importación de `config.ts` antes de analizar el JSON.

## Persistencia

- Dexie con versiones y migraciones; el campo `version` del JSON es independiente.
- Operaciones de varias escrituras en transacciones.
- Capturar errores de almacenamiento (cuota, base no disponible) y mostrar mensajes claros.
- Solicitar `navigator.storage.persist()` al iniciar.

## Pruebas

- Todo cambio en `src/domain/` y en importación/exportación necesita pruebas Vitest.
- Cubrir al menos las transiciones de estado, el reinicio al editar, el orden, las sesiones (filtro, retomar, tarjetas eliminadas), la validación del esquema y las reglas de importación.
- Las pruebas de aceptación de SPEC §19 son la referencia; mantener los IDs (IMP-xx, EST-xx…) en los nombres de los tests cuando aplique.
- Antes de dar algo por terminado: `pnpm test`, `pnpm build` y el linter deben pasar.

## Estilo

- TypeScript `strict`, sin `any` salvo justificación en comentario.
- Funciones pequeñas y puras en el dominio; componentes sin lógica de negocio.
- Interfaz compacta, accesible (teclado, foco visible, contraste) y con modo claro/oscuro.
- No añadir dependencias nuevas sin necesidad; si lo haces, justifícalo en el PR/commit.

## Despliegue

- **APK (principal en Android):** Capacitor envuelve el mismo build web. Siempre `VITE_BASE=/`. Publicar: bump `package.json` version, `git tag vX.Y.Z && git push origin vX.Y.Z` → `android-apk.yml` adjunta el APK a la Release. Sin sync ni backend; datos = IndexedDB local + JSON import/export. La app puede avisar de updates leyendo la API pública de Releases (abre el enlace del APK; no fuerza instalación).
- **Demo web / PC:** GitHub Pages (`VITE_BASE=/open-cards/`, `HashRouter`). No sustituye al APK en el teléfono del autor.

## Cuando falte información

Revisa SPEC §4 (decisiones abiertas): cada una tiene un valor por defecto, y se aplica ese. Para cualquier otra duda, pregunta antes de implementar.
