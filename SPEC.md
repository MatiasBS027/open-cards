# Open Cards — Especificación del proyecto

**Estado:** especificación v2.1 (decisiones consolidadas + arranque por núcleo usable)
**Objetivo:** definir el producto, las decisiones tomadas, la arquitectura, los requisitos funcionales, las pruebas de aceptación y lo que sigue abierto, de modo que una persona o un agente de código pueda implementar el MVP sin adivinar.

Documentos relacionados: `README.md`, `AGENTS.md`, `schema/open-cards.v1.schema.json`, `examples/ejemplo-biblioteca.json`.

---

## 1. Visión del producto

Open Cards es una aplicación de tarjetas de estudio de código abierto, local-first, pensada principalmente para uso personal. Debe servir para crear, organizar, importar, editar y estudiar tarjetas, sobre todo con matemáticas. No incorpora monedas, puntos, gamificación ni funciones comerciales.

### Principios

- **Local-first:** funciona sin conexión; no depende de ningún servidor para estudiar.
- **Datos de la persona usuaria:** todo se puede exportar en un formato JSON documentado.
- **Multiplataforma:** una sola interfaz adaptable a teléfono y PC.
- **Código abierto:** arquitectura comprensible; licencia MIT.
- **Importación segura:** el contenido importado es dato, nunca código ejecutable.
- **Estudio antes que analítica:** basta el estado actual de cada tarjeta; el historial detallado queda para después.
- **Sincronización posterior:** los identificadores y el esquema se diseñan para permitirla en el futuro, sin implementarla.

## 2. Casos de uso

1. Crear, editar, duplicar y eliminar mazos.
2. Crear, editar, duplicar, mover entre mazos y eliminar tarjetas.
3. Escribir tarjetas con texto, fórmulas (también dentro de una frase) y bloques de código.
4. Ordenar las tarjetas de un mazo arrastrándolas.
5. Estudiar un mazo con filtro (todas / no vistas / para repasar) y orden (secuencial / aleatorio).
6. Retomar una sesión de estudio interrumpida.
7. Abrir y voltear una tarjeta individual sin iniciar una sesión.
8. Etiquetar mazos, y buscar/filtrar mazos y tarjetas.
9. Importar uno o varios mazos desde JSON (texto pegado o archivo), revisándolos en un borrador.
10. Exportar un mazo o toda la biblioteca como JSON.
11. Deshacer rápidamente una eliminación.
12. Usar la aplicación sin conexión, en teléfono y PC, con modo claro u oscuro.

## 3. Decisiones tomadas

### Producto

| Área | Decisión |
|---|---|
| Idioma | Interfaz en español. Identificadores de código, nombres de campos JSON y commits en inglés. |
| Navegación | Estudio en secuencia y navegación/edición individual de tarjetas. |
| Editor | Bloques combinables `text`, `math`, `code`. |
| Texto con matemáticas | El bloque `text` admite LaTeX en línea con `$...$` (ver §9.1). El bloque `math` es para fórmulas destacadas. |
| Etiquetas | Se aplican a **mazos** en el MVP. El modelo permite añadir etiquetas de tarjeta después. |
| Orden de tarjetas | Cada tarjeta tiene posición; se reordena arrastrando (§8). |
| Estudio | Filtro por estado, orden secuencial o aleatorio, sesión guardada y retomable (§7). |
| Gestos | Tocar voltea; deslizar a la derecha = «Comprendida», a la izquierda = «Para repasar»; hay botones equivalentes. |
| Fin de mazo | Pantalla «Terminaste el mazo» con botón para volver al menú del mazo. |
| Mazo vacío | La pantalla del mazo muestra lista vacía (contador 0) y botón **+** para añadir tarjeta. No es un error ni una sesión de estudio. |
| Estado tras editar | Si el JSON canónico de `front` o `back` cambia, vuelve a `unseen`. Cambiar solo nombre o etiquetas del mazo no reinicia. Guardar sin cambios de bloques no reinicia. |
| Estado al importar | El estado del JSON se respeta y se puede editar en el borrador. |
| Duplicar | Duplicar una tarjeta o un mazo crea copias con IDs nuevos y estado `unseen`. |
| Mover tarjetas | Mover una tarjeta a otro mazo conserva su estado y la coloca al final del mazo destino. |
| Búsqueda | Buscador de mazos y de tarjetas, y filtro por etiquetas. |
| Deshacer | Tras eliminar una tarjeta o un mazo aparece un aviso inferior con «Deshacer» (≈8 s). Los mazos además piden confirmación indicando cuántas tarjetas se eliminan. Deshacer un mazo restaura mazo y tarjetas; **no** restaura la sesión de estudio. |
| Exportación | Se puede exportar un mazo o toda la biblioteca. Incluye el estado de aprendizaje. |
| Importación | Siempre **añade** mazos nuevos (IDs nuevos). No hay «reemplazar biblioteca» en el núcleo. Con varios mazos, cada uno se revisa y confirma por separado. |
| Settings | `theme`, `lastBackupAt`, `hasLocalChangesSinceBackup`, `storagePersistAsked` (ver §9). |
| Arranque | Primero núcleo usable (mazos, editor, estados, sesión, export/import añadir, tema); el resto del MVP después. |
| `targetCardCount` | **Eliminado** del modelo y del formato: no tenía uso real. |
| Modo oscuro | Sí: sistema / claro / oscuro. Tamaño de letra: sin ajuste propio. |
| Código en tarjetas | Se muestra con lenguaje seleccionado; nunca se ejecuta ni se verifica. |
| Imágenes | Fuera del MVP; el modelo de bloques permite añadirlas después. |
| Sincronización | Fuera del MVP. |
| Plataformas objetivo | Android y escritorio (Chrome/Edge/Firefox recientes). iOS no es objetivo por ahora. |

### Técnicas

| Área | Decisión |
|---|---|
| Lenguaje y herramientas | TypeScript (estricto), Vite, React, Vitest. |
| Persistencia | IndexedDB mediante Dexie. |
| Matemáticas | MathLive (edición visual + LaTeX directo), KaTeX (renderizado). |
| Código | CodeMirror 6. |
| Arrastrar y soltar | `@dnd-kit` (con soporte táctil y teclado). |
| Enrutado | `HashRouter` de React Router (GitHub Pages no soporta rutas de SPA). |
| PWA | `vite-plugin-pwa` (service worker, manifest, caché offline). |
| Validación del JSON | Ajv usando el mismo `schema/open-cards.v1.schema.json` publicado como documentación. |
| Despliegue | GitHub Pages con GitHub Actions. Docker no es necesario. |
| IDs | UUID v4 (`crypto.randomUUID()`) generados en el cliente. |
| Límites de importación | 5 MB por archivo y 1000 tarjetas por mazo; definidos como constantes en un único archivo de configuración. |

## 4. Decisiones abiertas

Ninguna bloquea empezar. Cada una tiene un valor por defecto que se aplica si no se decide otra cosa.

| # | Pregunta | Valor por defecto |
|---|---|---|
| A1 | ¿Los límites de importación (5 MB, 1000 tarjetas por mazo) son adecuados? | Sí, y son fáciles de cambiar. |
| A2 | Nombre de la carpeta/repositorio y, por tanto, la ruta base de GitHub Pages (`/<repo>/`). | `open-cards`; la base se lee de la variable `VITE_BASE`. |
| A3 | ¿El texto admite además formato básico (negrita, listas)? | No en el MVP: solo texto plano con saltos de línea y LaTeX en línea. |
| A4 | Política ante fórmulas no renderizables al importar. | Bloquear la confirmación mientras existan; el usuario corrige o elimina el bloque. |
| A5 | ¿Aviso de respaldo si pasan muchos días sin exportar? | Sí: aviso discreto tras 14 días desde el último respaldo si hubo cambios. |
| A6 | Etiquetas en tarjetas. | Posterior al MVP. |

### 4.1 Decisiones cerradas en el arranque (v2.1)

| Tema | Decisión |
|---|---|
| SES-08 | Mazo vacío = menú del mazo con lista 0 y botón +; no iniciar estudio. |
| SES-09 | Filtro sin tarjetas → mensaje; no se crea sesión. |
| Schema vs dominio | El JSON Schema valida forma; el dominio exige contenido no vacío (trim) en frente/reverso. |
| Importar | Solo añadir mazos nuevos; confirmación por mazo. |
| Deshacer mazo | Sin restaurar sesión. |
| Nombres | Nombre de mazo = texto plano. Las tarjetas no tienen nombre; búsqueda en frente/reverso. |
| Plataformas | Android + PC; iOS fuera por ahora. |

## 5. Stack y estructura del proyecto

```
src/
  domain/        # TypeScript puro: tipos, reglas de estado, orden, etiquetas, validación. Sin React, sin Dexie.
  storage/       # Dexie: tablas, migraciones, repositorios.
  importExport/  # Esquema, validación con Ajv, borrador de importación, exportación.
  ui/            # React: pantallas, componentes, editor de bloques, tema.
  config.ts      # Constantes (límites, tiempos de deshacer, días de aviso de respaldo).
schema/          # open-cards.v1.schema.json
examples/        # JSON de ejemplo
```

Regla de dependencias: `ui` → `storage` / `importExport` → `domain`. `domain` no importa a nadie.

### Qué es Vitest

Vitest es el ejecutor de pruebas automáticas que se integra con Vite. Se escriben archivos `*.test.ts` con casos como «si una tarjeta `understood` se edita, queda `unseen`» y se ejecutan con `npm test`. Se usa sobre todo para el dominio (reglas de estado, orden, importación), porque son pruebas rápidas, sin navegador, y evitan romper reglas al cambiar código.

## 6. Modelo de estudio de las tarjetas

### Estados

- `unseen`: no volteada ni clasificada.
- `seen`: volteada al menos una vez, sin clasificar.
- `understood`: comprendida.
- `needs_review`: para repasar.

### Reglas de transición

1. Las tarjetas nuevas empiezan en `unseen`.
2. Voltear por primera vez: `unseen` → `seen`. Voltear de nuevo no cambia el estado.
3. Se puede clasificar (`understood` / `needs_review`) sin haber volteado.
4. La clasificación explícita prevalece sobre el estado de vista, y se puede cambiar entre ambas.
5. Voltear una tarjeta ya clasificada no quita su clasificación.
6. Editar el contenido (frente o reverso, de forma efectiva) reinicia a `unseen`. Guardar sin cambios, o cambiar solo metadatos del mazo, no reinicia.
7. Duplicar → copia en `unseen`. Mover a otro mazo → conserva el estado.
8. No hay historial de estados en el MVP.

### Progreso

Cada mazo muestra: no vistas, vistas sin clasificar, comprendidas, para repasar y total. «Consultadas» = `seen` + `understood` + `needs_review` = total − `unseen`. Cada tarjeta se cuenta una sola vez.

## 7. Sesiones de estudio

### Inicio

Al iniciar el estudio de un mazo se eligen:

- **Filtro:** todas, no vistas (`unseen`) o para repasar (`needs_review`). Se muestra cuántas tarjetas cumplen cada filtro.
- **Orden:** secuencial (el orden del mazo) o aleatorio.

El filtro se evalúa **al iniciar**: la sesión toma una lista fija de IDs de tarjeta. Una tarjeta clasificada durante la sesión no desaparece de ella. Si el filtro no tiene tarjetas, se muestra un mensaje y no se crea sesión.

### Sesión guardada

Se guarda en IndexedDB (tabla `studySessions`), una activa como máximo por mazo:

```ts
interface StudySession {
  id: string;
  deckId: string;
  filter: 'all' | 'unseen' | 'needs_review';
  order: 'sequential' | 'shuffled';
  cardIds: string[];      // lista ya ordenada (y mezclada, si aplica)
  currentIndex: number;
  startedAt: string;      // ISO 8601
  updatedAt: string;
}
```

- Se actualiza tras cada cambio de tarjeta o clasificación.
- Al abrir un mazo con sesión activa se ofrece **Continuar** o **Empezar de nuevo**.
- Al reanudar, se descartan los IDs de tarjetas que ya no existan; si no queda ninguna, se informa y se borra la sesión.
- Si se elimina el mazo, se elimina su sesión.
- Al terminar la última tarjeta, la sesión se elimina.

### Pantalla de estudio

- Tocar la tarjeta la voltea.
- Deslizar a la derecha = «Comprendida»; a la izquierda = «Para repasar». Ambas acciones tienen botón visible y avanzan a la siguiente tarjeta.
- Botones/flechas para ir a la anterior o siguiente **sin** clasificar.
- Teclado en PC: espacio voltea; `C` comprendida; `R` para repasar; flechas izquierda/derecha navegan.
- Indicador de posición («12 / 40»).
- Al terminar: pantalla «Terminaste el mazo» y botón para volver al menú del mazo.

### Tarjeta individual

Desde la lista de tarjetas se puede abrir una tarjeta, voltearla (aplica la regla 2) y clasificarla, sin crear sesión.

## 8. Orden de tarjetas

- Cada tarjeta tiene un campo `position` (entero) dentro de su mazo.
- La vista de lista de tarjetas permite **reordenar arrastrando** (asa de arrastre visible; funciona con táctil y teclado). Al soltar se guarda el nuevo orden.
- Las tarjetas nuevas y las movidas desde otro mazo se añaden al final.
- Al eliminar o mover una tarjeta, las posiciones restantes se normalizan.
- La lista permite tocar una tarjeta para ver una vista previa y voltearla (frente/reverso).
- Exportación e importación: el orden del arreglo `cards` **es** el orden; `position` no se serializa.
- El orden aleatorio solo afecta a la sesión; nunca cambia el orden guardado.

## 9. Datos y contenido

### Entidades

- **Deck:** `id`, `name`, `description?`, `createdAt`, `updatedAt`.
- **Card:** `id`, `deckId`, `position`, `front: Block[]`, `back: Block[]`, `state`, `createdAt`, `updatedAt`.
- **Tag:** `id`, `name` (nombre original), `normalizedName` (recortado, espacios colapsados, minúsculas; único).
- **DeckTag:** relación mazo–etiqueta.
- **StudySession:** ver §7.
- **Settings:** `theme` (`system` \| `light` \| `dark`), `lastBackupAt` (ISO \| null), `hasLocalChangesSinceBackup` (boolean), `storagePersistAsked` (boolean).

Todos los IDs son UUID v4 generados en el cliente.

### Bloques

```ts
type Block =
  | { type: 'text'; content: string }
  | { type: 'math'; content: string }              // LaTeX
  | { type: 'code'; language: string; content: string };
```

Una tarjeta es válida si frente y reverso tienen al menos un bloque con contenido no vacío (tras `trim`). El JSON Schema solo exige ≥1 bloque por lado; la regla de contenido no vacío se aplica en el dominio (editor e importación). Si falta `state` en el JSON, se trata como `unseen`. Un tipo de bloque desconocido es un error de importación en la v1. Añadir tipos (por ejemplo, `image`) en el futuro significa subir la versión del formato.

### 9.1 Texto

- Texto plano; los saltos de línea se conservan.
- LaTeX en línea con `$...$`. Un `$` literal se escribe `\$`. Un `$` sin cerrar se trata como texto literal y se avisa en el editor.
- Se divide en segmentos texto/fórmula y se renderiza como nodos de React, **nunca como HTML**. Cada fórmula en línea se valida igual que un bloque `math`.
- En el editor, un botón «Insertar fórmula» abre MathLive y coloca `$latex$` en la posición del cursor.
- Sin Markdown ni HTML en el MVP.

### 9.2 Matemáticas

- Bloque `math`: editor visual (MathLive) y campo LaTeX directo; el contenido se guarda como LaTeX.
- Renderizado con KaTeX.
- Una fórmula se valida intentando renderizarla; si falla, se muestra un error junto al bloque y se conserva la fuente original. Esto no verifica que la fórmula sea matemáticamente correcta.
- El prototipo debe comprobar que el LaTeX que genera MathLive siempre lo soporta KaTeX.

### 9.3 Código

- CodeMirror 6 con selección de lenguaje (Python, JavaScript, TypeScript, Java, PHP, SQL, PostgreSQL, texto plano, y más si es trivial).
- Se conservan saltos de línea, espacios e indentación. Resaltado cuando el lenguaje esté soportado; si no, texto plano.
- No se ejecuta ni se juzga.

## 10. Etiquetas, búsqueda y organización

- Un mazo puede tener varias etiquetas; las etiquetas se reutilizan y se normalizan para evitar duplicados triviales (espacios, mayúsculas).
- Pantalla de mazos: buscador por nombre/descripción y filtro por una o varias etiquetas (un mazo debe tener **todas** las seleccionadas).
- Buscador de tarjetas: busca en el texto de frente y reverso (también dentro de un mazo). Los resultados indican el mazo.
- Duplicar mazo, duplicar tarjeta, mover tarjeta(s) a otro mazo.
- Etiquetas sin mazos: se pueden eliminar desde una pantalla de gestión de etiquetas, o se limpian automáticamente cuando quedan huérfanas (implementación libre, pero sin dejar basura visible).

## 11. Deshacer y eliminación

- Eliminar una tarjeta: se elimina de inmediato y aparece un aviso inferior con «Deshacer» durante ≈8 s (`config.ts`).
- Eliminar un mazo: diálogo de confirmación con el número de tarjetas, y después el mismo aviso de deshacer.
- Deshacer restaura el elemento con su contenido, estado y posición. En un mazo, **no** se restaura la sesión de estudio (queda eliminada).
- Si la pestaña se cierra durante la ventana de deshacer, la eliminación queda firme.
- El mecanismo concreto (instantánea en memoria o borrado diferido) lo elige la implementación, con tests que cubran el caso.

## 12. Importación

### Flujo obligatorio

1. La persona pega JSON o selecciona un `.json` (se rechaza lo que supere los límites de §13 antes de analizarlo).
2. Se analiza la sintaxis.
3. Se valida contra el esquema v1.
4. Si hay un único mazo, se abre directamente un borrador en el **mismo editor** de creación manual. Si hay varios (por ejemplo, una biblioteca), primero se muestra una lista; cada mazo marcado se abre, revisa y **confirma por separado**.
5. En el borrador se pueden editar nombre, descripción, etiquetas, estados y cada tarjeta; añadir, quitar o corregir tarjetas; y previsualizar.
6. Errores y advertencias aparecen junto al contenido afectado.
7. Solo se guarda tras una confirmación explícita (por mazo).
8. Cancelar descarta el borrador de ese mazo sin tocar la biblioteca.

### Reglas

- Nunca se guarda automáticamente, ni se ejecuta contenido importado.
- Cada mazo importado se guarda **como mazo nuevo con IDs nuevos**; los IDs del archivo solo sirven para relacionar datos dentro del archivo. Importar dos veces el mismo archivo crea dos mazos. Si ya existe un mazo con el mismo nombre, se muestra una advertencia (sin bloquear).
- No se inventan tarjetas.
- Posibles tarjetas duplicadas (mismo frente) dentro del borrador se señalan; nunca se eliminan solas.
- Las etiquetas existentes se reutilizan (comparación normalizada).
- Campos desconocidos del archivo se ignoran con advertencia; tipos de bloque desconocidos son un error.
- Una tarjeta incompleta bloquea la confirmación hasta corregirla o eliminarla.
- Una fórmula no renderizable bloquea la confirmación (decisión A4); se conserva su fuente original.
- JSON mal formado o que incumple el esquema: error comprensible, biblioteca intacta.
- El borrador no marca ninguna tarjeta como «editada»; no hay estado previo que reiniciar.

## 13. Exportación, respaldo y límites

- **Exportar un mazo** y **exportar toda la biblioteca** producen el mismo formato (`decks` es siempre un arreglo).
- Se incluyen contenido, etiquetas, orden (orden del arreglo), IDs y el estado de aprendizaje. Las sesiones de estudio no se exportan.
- Se registra la fecha del último respaldo; tras 14 días con cambios sin respaldar se muestra un aviso discreto (A5).
- Esquema y versión: `format: "open-cards"`, `version: 1`. Al cambiar el esquema se sube la versión y se documenta la migración.
- Límites de importación (constantes en `config.ts`): 5 MB por archivo y 1000 tarjetas por mazo.
- El JSON es respaldo portable; no equivale a sincronización ni a copia del almacenamiento interno del navegador.

## 14. Persistencia y almacenamiento

- Dexie con versiones y migraciones propias. **No confundir** `version` del JSON con la versión del esquema de IndexedDB.
- Se solicita almacenamiento persistente (`navigator.storage.persist()`) al iniciar.
- Los errores de almacenamiento (cuota llena, base inaccesible, datos borrados) se capturan y se muestran con un mensaje claro que sugiere exportar un respaldo.
- Si la base está vacía pero hay un respaldo reciente registrado, el aviso lo menciona.
- Las operaciones de varias escrituras (eliminar mazo, importar, mover) se hacen en transacciones.

## 15. Despliegue

- GitHub Pages mediante GitHub Actions (build de Vite → publicar `dist/`).
- Ruta base configurable con `VITE_BASE` (por defecto `/open-cards/`).
- `HashRouter` para evitar problemas con rutas.
- HTTPS lo proporciona GitHub Pages, lo que habilita el service worker y la instalación como PWA.
- Se debe poder instalar en Android y en escritorio, y abrir sin conexión tras la primera carga.
- Estrategia de actualización del service worker: avisar de que hay una versión nueva y recargar cuando la persona lo acepte (sin perder una edición en curso).

## 16. Interfaz y experiencia

- Interfaz compacta y adaptable (teléfono y PC); áreas táctiles accesibles.
- Frente y reverso claramente diferenciados.
- Acciones «Comprendida» y «Para repasar» siempre visibles en estudio.
- Tema: sistema / claro / oscuro, con alternancia manual guardada. KaTeX y CodeMirror deben verse bien en ambos.
- Confirmación visible al guardar, importar, exportar y eliminar.
- Errores de importación y de fórmulas junto al campo afectado.
- Accesibilidad básica: foco visible, contraste suficiente, controles etiquetados, uso por teclado en PC.

## 17. Requisitos de seguridad

- Texto y código se renderizan como nodos de texto de React; **sin** `dangerouslySetInnerHTML` ni `innerHTML` sobre contenido de tarjetas.
- KaTeX siempre con `trust: false`; la salida de KaTeX es el único HTML inyectado permitido.
- El contenido de código nunca se evalúa ni se ejecuta.
- No hay peticiones de red salvo la descarga de la propia app; ningún contenido importado dispara red.
- Validación estricta del JSON antes de crear el borrador; límites de tamaño y cantidad.
- Dependencias fijadas por `package-lock.json`.

## 18. Alcance del MVP

### Incluido

- Mazos y tarjetas: crear, editar, duplicar, mover, eliminar, reordenar arrastrando.
- Etiquetas de mazos, buscador de mazos/tarjetas y filtro por etiquetas.
- Bloques de texto (con LaTeX en línea), matemáticas y código.
- Estados de aprendizaje y progreso; reinicio al editar contenido.
- Estudio con filtro, orden secuencial/aleatorio, gestos o botones, y sesión retomable.
- Vista previa/volteo de tarjetas desde la lista.
- Importación con borrador (uno o varios mazos); exportación de mazo y de biblioteca.
- Deshacer tras eliminar.
- Persistencia local, modo sin conexión, PWA instalable.
- Modo oscuro.
- Aviso de respaldo.

### Fuera del MVP

- Sincronización, historial de aprendizaje, repetición espaciada, cronómetro y estadísticas avanzadas.
- Imágenes y adjuntos.
- Ejecución o verificación de código.
- MCP o generación de tarjetas con IA.
- Etiquetas de tarjeta.
- Markdown/formato de texto.
- Docker y soporte específico de iOS. El empaquetado Android opcional vía Capacitor (APK) es un envoltorio de la misma app web local-first; no añade sincronización.
- Ajuste de tamaño de letra.

## 19. Pruebas de aceptación

### Importación

| ID | Prueba | Resultado esperado |
|---|---|---|
| IMP-01 | Importar JSON válido de un mazo | Se abre un borrador con los campos cargados. |
| IMP-02 | Editar nombre y etiquetas en el borrador | Los cambios permanecen en el borrador. |
| IMP-03 | Editar texto, fórmula o código | La previsualización refleja los cambios. |
| IMP-04 | Importar fórmula no renderizable | Error localizado, fuente conservada y confirmación bloqueada. |
| IMP-05 | Importar tarjeta incompleta | No se puede confirmar hasta corregirla o eliminarla. |
| IMP-06 | Mostrar fórmula válida | Se renderiza en edición y estudio. |
| IMP-07 | Cancelar la importación | No se crea ni modifica ningún mazo. |
| IMP-08 | Confirmar la importación | Se guarda el borrador revisado, no el archivo original. |
| IMP-09 | Importar etiquetas existentes | Se reutilizan sin duplicados triviales. |
| IMP-10 | Importar JSON mal formado | Error comprensible; biblioteca intacta. |
| IMP-11 | Importar texto parecido a código ejecutable o HTML (`<script>`) | Se trata como contenido; nunca se ejecuta ni se interpreta como HTML. |
| IMP-12 | Importar el mismo archivo dos veces | Se crean dos mazos con IDs distintos; se avisa del nombre repetido. |
| IMP-13 | Importar una biblioteca con varios mazos | Lista con casillas; se importan solo los marcados y confirmados. |
| IMP-14 | Importar archivo mayor de 5 MB o mazo con más de 1000 tarjetas | Se rechaza con un mensaje claro. |
| IMP-15 | Importar tipo de bloque desconocido | Error localizado; no se importa hasta corregir. |
| IMP-16 | Importar con estados distintos de `unseen` | Los estados se respetan y se pueden editar en el borrador. |

### Estados y estudio

| ID | Prueba | Resultado esperado |
|---|---|---|
| EST-01 | Crear una tarjeta | Empieza en `unseen`. |
| EST-02 | Voltear sin clasificar | Pasa a `seen`. |
| EST-03 | Clasificar sin voltear | Pasa directo a `understood` o `needs_review`. |
| EST-04 | Cambiar la clasificación | Se actualiza sin duplicar el conteo. |
| EST-05 | Editar el contenido de una tarjeta clasificada | Vuelve a `unseen`. |
| EST-06 | Voltear una tarjeta ya clasificada | Conserva su clasificación. |
| EST-07 | Guardar una tarjeta sin cambiar el contenido | El estado no cambia. |
| EST-08 | Cambiar solo nombre o etiquetas del mazo | Ningún estado cambia. |
| EST-09 | Duplicar una tarjeta clasificada | La copia queda en `unseen`. |
| EST-10 | Mover una tarjeta a otro mazo | Conserva su estado y queda al final del destino. |
| SES-01 | Iniciar con filtro «no vistas» | Solo entran tarjetas `unseen`. |
| SES-02 | Iniciar con filtro «para repasar» | Solo entran tarjetas `needs_review`. |
| SES-03 | Orden aleatorio | La sesión usa orden mezclado; el orden del mazo no cambia. |
| SES-04 | Cerrar la app a mitad de sesión y reabrir | Se ofrece Continuar en la misma tarjeta, con el mismo orden. |
| SES-05 | Continuar tras eliminar tarjetas de la sesión | Se omiten las que ya no existen. |
| SES-06 | Llegar a la última tarjeta | Aparece la pantalla de fin con botón al menú del mazo; la sesión se elimina. |
| SES-07 | Deslizar a derecha / izquierda | Marca «Comprendida» / «Para repasar» y avanza. |
| SES-08 | Abrir un mazo vacío | Lista vacía con contador 0 y botón para añadir tarjeta; sin errores. |
| SES-09 | Iniciar con un filtro sin tarjetas | Mensaje informativo; no se crea sesión. |

### Organización

| ID | Prueba | Resultado esperado |
|---|---|---|
| ORD-01 | Arrastrar una tarjeta a otra posición | El orden se guarda y persiste tras recargar. |
| ORD-02 | Estudiar en modo secuencial | Sigue el orden guardado. |
| ORD-03 | Exportar e importar un mazo reordenado | Se conserva el orden. |
| ORD-04 | Vista previa desde la lista | Al tocar se voltea frente/reverso. |
| SRC-01 | Buscar un mazo por nombre | Aparecen solo los coincidentes. |
| SRC-02 | Buscar una tarjeta por texto | Resultados con indicación del mazo. |
| SRC-03 | Filtrar por dos etiquetas | Solo mazos con ambas. |
| DUP-01 | Duplicar un mazo | Copia con IDs nuevos, mismas tarjetas y estados `unseen`. |
| MOV-01 | Mover varias tarjetas a otro mazo | Salen del origen, entran al final del destino. |

### Contenido

| ID | Prueba | Resultado esperado |
|---|---|---|
| TXT-01 | Texto con `$x^2$` en medio de una frase | La fórmula se renderiza dentro de la frase. |
| TXT-02 | `\$` y `$` sin cerrar | Se muestran como texto literal; hay aviso. |
| TXT-03 | Fórmula en línea inválida | Error localizado en el editor. |
| MTH-01 | LaTeX generado por MathLive para un conjunto de fórmulas de prueba | KaTeX lo renderiza sin error. |

### Eliminación y deshacer

| ID | Prueba | Resultado esperado |
|---|---|---|
| DEL-01 | Eliminar un mazo | Confirmación con número de tarjetas; luego aviso de deshacer. |
| DEL-02 | Eliminar una tarjeta | Aviso de deshacer. |
| DEL-03 | Pulsar «Deshacer» | Se restaura con contenido, estado y posición. |
| DEL-04 | Eliminar el mazo con una sesión activa | La sesión se elimina también. |

### Exportación, respaldo y almacenamiento

| ID | Prueba | Resultado esperado |
|---|---|---|
| EXP-01 | Exportar un mazo y reimportarlo | Contenido, etiquetas, orden y estados se conservan. |
| EXP-02 | Exportar toda la biblioteca y reimportarla | Todos los mazos se conservan. |
| EXP-03 | Pasar 14 días con cambios sin respaldar | Aparece el aviso de respaldo. |
| OFF-01 | Abrir la app sin conexión tras la primera carga | Se puede estudiar y acceder a los datos locales. |
| STO-01 | Simular error de cuota de almacenamiento | Mensaje claro; sin pérdida de datos existentes. |
| STO-02 | Mazo de 1000 tarjetas | Listas y estudio siguen siendo fluidos. |
| SEC-01 | Tarjeta con `<img src=x onerror=...>` en un bloque de texto | Se muestra como texto; nada se ejecuta. |

## 20. Plan de desarrollo

1. **Reorganizar docs** en la raíz (`SPEC.md`, `schema/`, `examples/`, `AGENTS.md`).
2. **Prototipo math:** MathLive → LaTeX → KaTeX e inline `$...$` (MTH-01, TXT-*).
3. **Dominio:** tipos, estados, orden, validación de contenido no vacío, Vitest.
4. **Núcleo usable:** Dexie, mazos/tarjetas, editor por bloques, reordenar, estados, sesión (filtro/orden/retomar), export/import (añadir), tema.
5. **Resto del MVP:** etiquetas/búsqueda, deshacer pulido, aviso 14 días, PWA offline, CI GitHub Pages, duplicar/mover avanzado.
6. **Calidad y docs:** pruebas de aceptación §19, accesibilidad, mantener SPEC/AGENTS.

Posteriores: sincronización, Docker, MCP, imágenes, historial y repetición espaciada.

## 21. Referencias de inspiración

- `namidaco/namida`: https://github.com/namidaco/namida
- `DuarteSantos8/openGym`: https://github.com/DuarteSantos8/openGym

Son solo inspiración de producto y despliegue; no implican copiar código ni arquitectura.
