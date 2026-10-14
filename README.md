# Open Cards

Aplicación de tarjetas de estudio de código abierto, **local-first** y sin conexión. Pensada para estudiar con matemáticas (LaTeX) y código, sin gamificación ni cuentas.

> Estado: núcleo usable en desarrollo. La especificación está en [`SPEC.md`](SPEC.md).

## Características (MVP)

- Mazos y tarjetas con bloques de texto, matemáticas (LaTeX) y código.
- LaTeX también dentro de una frase: `$x^2$`.
- Orden de tarjetas editable arrastrando.
- Estudio con filtro (todas / no vistas / para repasar), orden secuencial o aleatorio, y sesión que se puede retomar.
- Estados por tarjeta: no vista, vista, comprendida, para repasar.
- Etiquetas, búsqueda y filtros.
- Importación y exportación en JSON (un mazo o toda la biblioteca), con borrador de revisión antes de guardar.
- PWA instalable, funciona sin conexión, modo oscuro.

## Stack

TypeScript, Vite, React, Dexie (IndexedDB), MathLive + KaTeX, CodeMirror 6, `@dnd-kit`, `vite-plugin-pwa`, Vitest.

## Empezar

Requisitos: Node.js 20 o superior.

```bash
pnpm install
pnpm dev           # servidor de desarrollo
pnpm test          # pruebas (Vitest)
pnpm build         # build de producción en dist/
pnpm preview       # previsualizar el build
```

La ruta base para GitHub Pages se configura con la variable `VITE_BASE` (por defecto `/open-cards/`). En CI se usa `/{nombre-del-repo}/`.

## GitHub Pages (Android / PWA)

El workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) construye con pnpm/Vite y publica `dist/`.

### Pasos manuales (si aún no está publicado)

1. Crea un repositorio en GitHub (recomendado: `open-cards`) y súbelo:
   ```bash
   git init
   git add .
   git commit -m "Initial Open Cards app"
   git branch -M main
   git remote add origin https://github.com/<TU_USUARIO>/open-cards.git
   git push -u origin main
   ```
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Tras el workflow verde, la URL será:
   `https://<TU_USUARIO>.github.io/<nombre-del-repo>/`
   (con HashRouter, las rutas van después de `#/`, p. ej. `.../open-cards/#/`).
4. En Android: abre esa URL en Chrome → menú → **Instalar aplicación** / **Añadir a la pantalla de inicio**.

Si el repo no se llama `open-cards`, el workflow ya ajusta `VITE_BASE` al nombre del repo.

## Tus datos

Todo se guarda en el navegador (IndexedDB). Si borras los datos del sitio, se pierden. **Exporta respaldos con regularidad** desde la app (un mazo o toda la biblioteca).

## Formato JSON

El esquema está en [`schema/open-cards.v1.schema.json`](schema/open-cards.v1.schema.json).

Ejemplos:

- [`examples/ejemplo-biblioteca.json`](examples/ejemplo-biblioteca.json) — biblioteca corta de demostración.
- [`examples/probabilidad-biblioteca.json`](examples/probabilidad-biblioteca.json) — varios mazos de V.A.D. (series, varianza/FGM, modelos discretos) para probar importación.

### Cómo importar un ejemplo

1. Abre la app → **Importar**.
2. Elige el archivo JSON (o pégalo).
3. Revisa el borrador (nombre, descripción, etiquetas, tarjetas) y confirma.
4. La importación **nunca** escribe en la base hasta que confirmas; crea mazos nuevos con IDs nuevos.

## Estructura

```
src/domain/        reglas puras (sin React ni Dexie)
src/storage/       persistencia con Dexie
src/importExport/  esquema, validación e importación/exportación
src/ui/            interfaz React
schema/            esquema JSON
examples/          archivos de ejemplo
```

## Contribuir

Lee [`AGENTS.md`](AGENTS.md) para las convenciones del proyecto.

## Licencia

[MIT](LICENSE)
