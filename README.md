<div align="center">

<img src="public/icon.svg" alt="Open Cards" width="96" height="96">

# Open Cards

**Flashcards locales que puedes estudiar offline — con matemáticas y código, sin cuentas.**

Crea mazos, edita tarjetas con LaTeX y bloques de código, estudia en el teléfono o en el PC.<br>
Todo vive en tu navegador. Sin servidor, sin suscripción, sin gamificación.

[![License: MIT](https://img.shields.io/badge/license-MIT-3dbaa3?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/MatiasBS027/open-cards?style=flat-square&logo=github&logoColor=white)](https://github.com/MatiasBS027/open-cards/stargazers)
[![Pages](https://img.shields.io/github/actions/workflow/status/MatiasBS027/open-cards/deploy-pages.yml?branch=main&label=pages&style=flat-square)](https://github.com/MatiasBS027/open-cards/actions/workflows/deploy-pages.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square)](https://matiasbs027.github.io/open-cards/)

[Demo en vivo](https://matiasbs027.github.io/open-cards/) ·
[Especificación](SPEC.md) ·
[Esquema JSON](schema/open-cards.v1.schema.json) ·
[Guía para agentes](AGENTS.md)

</div>

---

## Por qué Open Cards

Muchas apps de flashcards meten tu progreso en la nube, te empujan a una cuenta o se llenan de rachas y monedas. Open Cards va al revés: **tus mazos son tuyos**, se guardan en IndexedDB, se exportan a un JSON documentado y se estudian sin red.

Está pensada para materias con fórmulas (probabilidad, álgebra, física…) y trozos de código. El contenido importado es **dato**, nunca se ejecuta.

> Estado actual: núcleo usable (mazos, editor, estudio, import/export, PWA). La hoja de ruta del producto está en [`SPEC.md`](SPEC.md).

## Características

**Mazos y tarjetas**

- Mazos con nombre, descripción y etiquetas.
- Tarjetas con bloques combinables: texto, matemáticas y código.
- LaTeX en línea dentro del texto (`$x^2$`) y fórmulas destacadas con MathLive + KaTeX.
- Código con resaltado (CodeMirror); nunca se ejecuta.
- Reordenar tarjetas arrastrando (ratón, tacto y teclado).

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

**App**

- PWA instalable; funciona offline.
- Tema claro / oscuro / sistema.
- Interfaz en español; código y esquema en inglés.

## Probarlo ya

No hace falta clonar el repo:

1. Abre la [demo en GitHub Pages](https://matiasbs027.github.io/open-cards/).
2. En Android (Chrome): menú → **Instalar aplicación** / **Añadir a la pantalla de inicio**.
3. Opcional: importa un ejemplo desde [`examples/`](examples/) (p. ej. [`probabilidad-biblioteca.json`](examples/probabilidad-biblioteca.json)).

Todo se guarda en **tu** navegador. Si borras los datos del sitio, se pierden: exporta respaldos con regularidad.

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
| `pnpm build` | Build de producción en `dist/` |
| `pnpm preview` | Previsualizar el build |
| `pnpm lint` | Linter (oxlint) |

La ruta base de GitHub Pages se configura con `VITE_BASE` (por defecto `/open-cards/`). El workflow de CI la ajusta al nombre del repositorio.

## Cómo funciona

```
src/domain/        reglas puras (tipos, estados, orden, etiquetas) — sin React ni Dexie
src/storage/       IndexedDB vía Dexie, migraciones y repositorios
src/importExport/  validación Ajv + borradores de importación / exportación
src/ui/            pantallas React
src/math/          renderizado KaTeX (trust: false)
schema/            open-cards.v1.schema.json
examples/          JSON de demostración
```

Dependencias permitidas: `ui` → `storage` / `importExport` → `domain`. Nunca al revés.

**Seguridad del contenido**

- No se usa `dangerouslySetInnerHTML` / `innerHTML` con texto de tarjetas.
- KaTeX es el único HTML inyectado permitido, siempre con `trust: false`.
- El código de las tarjetas se muestra como texto; no se evalúa.

**Persistencia**

Todo vive en IndexedDB. Al arrancar se pide `navigator.storage.persist()` cuando el navegador lo permite. Un respaldo completo es exportar la biblioteca a JSON.

## Formato JSON

El contrato público está en [`schema/open-cards.v1.schema.json`](schema/open-cards.v1.schema.json).

| Archivo | Contenido |
|---|---|
| [`examples/ejemplo-biblioteca.json`](examples/ejemplo-biblioteca.json) | Biblioteca corta de demostración |
| [`examples/probabilidad-biblioteca.json`](examples/probabilidad-biblioteca.json) | Varios mazos de V.A.D. (series, varianza/FGM, modelos discretos) |

**Importar un ejemplo**

1. App → **Importar**.
2. Elige el archivo (o pégalo).
3. Revisa el borrador (nombre, etiquetas, tarjetas) y confirma mazo a mazo.

## Documentación

| Quiero… | Leer |
|---|---|
| Entender el producto y las reglas de negocio | [`SPEC.md`](SPEC.md) |
| Convenciones para contribuir o usar un agente de código | [`AGENTS.md`](AGENTS.md) |
| Validar o generar JSON compatible | [`schema/open-cards.v1.schema.json`](schema/open-cards.v1.schema.json) |
| Ver cómo se despliega la demo | [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) |

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
