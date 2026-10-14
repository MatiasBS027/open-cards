<div align="center">

<img src="public/icon.svg" alt="Open Cards" width="96" height="96">

# Open Cards

**Flashcards locales que puedes estudiar offline — con matemáticas y código, sin cuentas.**

Crea mazos, edita tarjetas con LaTeX y bloques de código, estudia en el teléfono o en el PC.<br>
Todo vive en tu dispositivo. Sin servidor, sin suscripción, sin gamificación.

[![License: MIT](https://img.shields.io/badge/license-MIT-3dbaa3?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MatiasBS027/open-cards?style=flat-square&logo=github&logoColor=white)](https://github.com/MatiasBS027/open-cards/stargazers)
[![Pages](https://img.shields.io/github/actions/workflow/status/MatiasBS027/open-cards/deploy-pages.yml?branch=main&label=pages&style=flat-square)](https://github.com/MatiasBS027/open-cards/actions/workflows/deploy-pages.yml)
[![APK](https://img.shields.io/github/actions/workflow/status/MatiasBS027/open-cards/android-apk.yml?branch=main&label=apk&style=flat-square)](https://github.com/MatiasBS027/open-cards/actions/workflows/android-apk.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square)](https://matiasbs027.github.io/open-cards/)

[Demo en vivo](https://matiasbs027.github.io/open-cards/) ·
[Descargar APK](https://github.com/MatiasBS027/open-cards/releases/latest) ·
[Especificación](SPEC.md) ·
[Esquema JSON](schema/open-cards.v1.schema.json) ·
[Guía para agentes](AGENTS.md)

</div>

---

## Por qué Open Cards

Muchas apps de flashcards meten tu progreso en la nube, te empujan a una cuenta o se llenan de rachas y monedas. Open Cards va al revés: **tus mazos son tuyos**, se guardan en IndexedDB, se exportan a un JSON documentado y se estudian sin red.

Está pensada para materias con fórmulas (probabilidad, álgebra, física…) y trozos de código. El contenido importado es **dato**, nunca se ejecuta.

> Estado actual (v0.1.6): MVP usable. En Android preferimos el **APK**; Pages queda como demo web en PC. Sin cuentas ni sync: el puente entre dispositivos es importar/exportar JSON. Detalle en [`SPEC.md`](SPEC.md) y [`CHANGELOG.md`](CHANGELOG.md).

## Características

**Mazos y tarjetas**

- Mazos con nombre, descripción y etiquetas.
- Tarjetas con bloques combinables: texto, matemáticas y código.
- LaTeX en línea dentro del texto (`$x^2$`) y fórmulas destacadas con MathLive + KaTeX.
- Código con resaltado (CodeMirror); nunca se ejecuta.
- Reordenar tarjetas arrastrando (ratón, tacto y teclado).
- Buscar mazos/tarjetas; filtrar por etiquetas; duplicar mazos; duplicar/mover tarjetas.

**Estudio**

- Filtro: todas / no vistas / para repasar.
- Orden secuencial o aleatorio (el aleatorio solo afecta a la sesión).
- Sesión retomable si sales a mitad.
- Estados claros: no vista → vista → comprendida / para repasar.
- Voltear con un toque; botones de calificación en la sesión.

**Datos**

- Importar y exportar un mazo o toda la biblioteca en JSON.
- La importación pasa siempre por un **borrador editable** y no escribe nada hasta que confirmas.
- Importar crea mazos nuevos con IDs nuevos; no inventa tarjetas.
- Deshacer eliminación (~8 s) con confirmación al borrar un mazo.
- Aviso de respaldo tras ~14 días con cambios sin exportar.

**App**

- **APK Android** (Capacitor) — camino principal en el teléfono; misma app local-first.
- Al abrir (y en Ajustes) comprueba si hay un APK más nuevo en GitHub Releases.
- Demo web en GitHub Pages (PC / compartir enlace); también funciona offline como PWA si alguien la instala desde el navegador.
- Ajustes: perfil local (nombre + foto), tema claro/oscuro/sistema, import/export.
- Interfaz en español; código y esquema en inglés.
- Sin cuentas ni sincronización en la nube: entre PC y teléfono usas exportar/importar JSON.

## Probarlo ya

**En el teléfono (recomendado):** descarga el [APK](#descargar-apk) e instálalo.

**En el PC / demo:** abre la [demo en GitHub Pages](https://matiasbs027.github.io/open-cards/). Opcional: importa un ejemplo desde [`examples/`](examples/).

Todo se guarda en **tu** dispositivo. Si desinstalas o borras datos del sitio, se pierden: exporta respaldos con regularidad. No hace falta sync: exportas en un lado e importas en el otro.

## Descargar APK

La misma app empaquetada con [Capacitor](https://capacitorjs.com/) para Android:

- **Última release:** [github.com/MatiasBS027/open-cards/releases/latest](https://github.com/MatiasBS027/open-cards/releases/latest)
- El archivo se llama `open-cards-vX.Y.Z.apk` (firmado siempre con la misma keystore de release).
- No hay cuenta ni sync: IndexedDB sigue siendo local en el dispositivo.
- La app consulta la API pública de Releases; si hay una versión mayor, muestra un aviso y enlaza al APK (no instala sola: hay que abrir/descargar e instalar). Ideas para la siguiente iteración en [`SPEC.md`](SPEC.md) §20.

**Firma (CI)** — la keystore **no** está en el repo. GitHub Actions usa secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`). Localmente podés guardar una copia en `signing/` (gitignored). Si instalaste un APK `-debug` de v0.1.0–v0.1.5, desinstalá antes de poner uno firmado: Android no actualiza encima de otra firma.

**Cómo publicar un APK nuevo**

```bash
# 1. bump version in package.json (feeds __APP_VERSION__ + versionCode)
# 2. commit, then:
git tag v0.1.6
git push origin v0.1.6  # dispara Android APK → GitHub Release
```

Un push a `main` actualiza la demo en Pages. El APK del teléfono solo cambia con un tag `v*` nuevo.

## Inicio rápido

Requisitos: [Node.js](https://nodejs.org/) 20+ y [pnpm](https://pnpm.io/).

```bash
git clone https://github.com/MatiasBS027/open-cards.git
cd open-cards
pnpm install
pnpm dev
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm test` | Pruebas (Vitest) |
| `pnpm build` | Build de producción en `dist/` (Pages: `VITE_BASE=/open-cards/`) |
| `pnpm preview` | Previsualizar el build |
| `pnpm lint` | Linter (oxlint) |
| `pnpm icons` | Regenerar PWA + iconos Android desde `public/icon.svg` |
| `pnpm build:android` | Build con `VITE_BASE=/` y `cap sync` |
| `pnpm android:assemble` | Build + APK debug (`android/…/app-debug.apk`) |
| `pnpm cap:open` | Abrir el proyecto en Android Studio |

La ruta base de GitHub Pages se configura con `VITE_BASE` (por defecto `/open-cards/`). El workflow de CI la ajusta al nombre del repositorio. El APK siempre usa `VITE_BASE=/` porque Capacitor sirve los assets desde la raíz del WebView (`HashRouter` no depende de rutas del servidor).

### Construir el APK en local

Requisitos extra: JDK 21+ y Android SDK (`ANDROID_HOME`).

```bash
pnpm icons          # opcional: logo gris/blanco → mipmaps
pnpm android:assemble
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Para release firmado (Play Store / distribución propia), abre el proyecto con `pnpm cap:open`, configura el signing en Android Studio y ejecuta `assembleRelease`.

## Cómo funciona

```
src/domain/        reglas puras (tipos, estados, orden, etiquetas) — sin React ni Dexie
src/storage/       IndexedDB vía Dexie, migraciones y repositorios
src/importExport/  validación Ajv + borradores de importación / exportación
src/update/        chequeo de versión vía GitHub Releases API
src/ui/            pantallas React
src/math/          renderizado KaTeX (trust: false)
android/           proyecto Capacitor (envoltorio nativo / APK)
schema/            open-cards.v1.schema.json
examples/          JSON de demostración
```

Dependencias permitidas: `ui` → `storage` / `importExport` → `domain`. Nunca al revés.

**Seguridad del contenido**

- No se usa `dangerouslySetInnerHTML` / `innerHTML` con texto de tarjetas.
- KaTeX es el único HTML inyectado permitido, siempre con `trust: false`.
- El código de las tarjetas se muestra como texto; no se evalúa.

**Persistencia**

Todo vive en IndexedDB. Al arrancar se pide `navigator.storage.persist()` cuando el navegador lo permite. Un respaldo completo es exportar la biblioteca a JSON. El APK no añade sincronización: es el mismo modelo local-first.

## Formato JSON

El contrato público está en [`schema/open-cards.v1.schema.json`](schema/open-cards.v1.schema.json).

| Archivo | Contenido |
|---|---|
| [`examples/ejemplo-biblioteca.json`](examples/ejemplo-biblioteca.json) | Biblioteca corta de demostración |
| [`examples/probabilidad-biblioteca.json`](examples/probabilidad-biblioteca.json) | Varios mazos de V.A.D. (series, varianza/FGM, modelos discretos) |

**Importar un ejemplo**

1. App → **Importar**.
2. Pega el JSON y pulsa **Usar JSON**, o elige un archivo.
3. Revisa el borrador (nombre, etiquetas, tarjetas) y confirma mazo a mazo.

## Documentación

| Quiero… | Leer |
|---|---|
| Entender el producto y las reglas de negocio | [`SPEC.md`](SPEC.md) |
| Convenciones para contribuir o usar un agente de código | [`AGENTS.md`](AGENTS.md) |
| Validar o generar JSON compatible | [`schema/open-cards.v1.schema.json`](schema/open-cards.v1.schema.json) |
| Ver cómo se despliega la demo | [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) |
| Ver cómo se construye el APK | [`.github/workflows/android-apk.yml`](.github/workflows/android-apk.yml) |
| Ver qué cambió por versión | [`CHANGELOG.md`](CHANGELOG.md) |

## Contribuir

Issues y pull requests son bienvenidos. Antes de abrir un PR grande, lee [`SPEC.md`](SPEC.md) (sobre todo el alcance del MVP) y [`AGENTS.md`](AGENTS.md).

Checklist mínimo:

```bash
pnpm test
pnpm build
pnpm lint
```

Los cambios en `src/domain/` y en importación/exportación deben llevar pruebas Vitest.

## Licencia

[MIT](LICENSE) — Copyright (c) 2026 Matias.

Puedes usar, modificar y redistribuir el código con pocas restricciones. Tus mazos y exportaciones te pertenecen; la app no los sube a ningún servidor.
