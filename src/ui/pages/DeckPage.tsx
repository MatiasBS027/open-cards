import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { UNDO_MS } from '../../config'
import { reorderCards } from '../../domain/order'
import { stateLabel } from '../../domain/session'
import { computeProgress } from '../../domain/state'
import type { Card, Deck, StudyFilter, StudyOrder } from '../../domain/types'
import { downloadJson, exportDeck } from '../../importExport/exportLibrary'
import {
  deleteCard,
  duplicateCard,
  getDeck,
  getDeckTags,
  getSessionForDeck,
  listCards,
  listDecks,
  moveCard,
  reorderDeckCards,
  restoreCard,
  setCardState,
  setDeckTags,
  startSession,
  updateDeck,
} from '../../storage/repositories'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { UndoToast } from '../components/UndoToast'

function SortableCard({
  card,
  flipped,
  editing,
  otherDecks,
  onFlip,
  onOpen,
  onDelete,
  onDuplicate,
  onMove,
}: {
  card: Card
  flipped: boolean
  editing: boolean
  otherDecks: Deck[]
  onFlip: () => void
  onOpen: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMove: (targetDeckId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: !editing })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`flash-card${editing ? ' is-editing' : ''}${isDragging ? ' is-dragging' : ''}`}
    >
      <header className="flash-card-top">
        {editing ? (
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="drag-handle flash-card-drag"
            aria-label="Arrastrar para reordenar"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        ) : (
          <span className="flash-card-drag-spacer" aria-hidden />
        )}
        <span className="flash-card-state">{stateLabel(card.state)}</span>
      </header>
      <button type="button" className="flash-card-body" onClick={onFlip}>
        <div className="flash-card-content">
          <BlockRenderer blocks={flipped ? card.back : card.front} />
        </div>
        <span className="flash-card-hint">
          {flipped ? 'Reverso' : 'Frente'} · tocar para voltear
        </span>
      </button>
      {editing ? (
        <div className="flash-card-side-actions">
          <button type="button" className="button-quiet" onClick={onOpen}>
            Editar
          </button>
          <button type="button" className="button-quiet" onClick={onDuplicate}>
            Duplicar
          </button>
          <button
            type="button"
            className="button-quiet danger"
            onClick={onDelete}
          >
            Eliminar
          </button>
          {otherDecks.length > 0 ? (
            <select
              className="move-card-select"
              aria-label="Mover a otro mazo"
              defaultValue=""
              onChange={(e) => {
                const target = e.target.value
                e.target.value = ''
                if (target) onMove(target)
              }}
            >
              <option value="" disabled>
                Mover a…
              </option>
              {otherDecks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function parseTagsInput(value: string): string[] {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function DeckPage() {
  const { deckId = '' } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<StudyFilter>('all')
  const [order, setOrder] = useState<StudyOrder>('sequential')
  const [message, setMessage] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const [undoCard, setUndoCard] = useState<Card | null>(null)
  const [editingMeta, setEditingMeta] = useState(false)
  const [editingCards, setEditingCards] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState('')
  const [otherDecks, setOtherDecks] = useState<Deck[]>([])
  // Mouse + Touch (not PointerSensor): avoids double-handling on touch devices
  // and lets the body button keep click-to-flip without fighting the handle.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const reload = async () => {
    const d = await getDeck(deckId)
    if (!d) {
      navigate('/')
      return
    }
    setDeck(d)
    setTags(await getDeckTags(deckId))
    setCards(await listCards(deckId))
    setHasSession(Boolean(await getSessionForDeck(deckId)))
    const all = await listDecks()
    setOtherDecks(all.filter((x) => x.id !== deckId))
  }

  useEffect(() => {
    void reload()
  }, [deckId])

  useEffect(() => {
    if (!undoCard) return
    const t = window.setTimeout(() => setUndoCard(null), UNDO_MS)
    return () => window.clearTimeout(t)
  }, [undoCard])

  const progress = computeProgress(cards.map((c) => c.state))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeId = String(active.id)
    const overId = String(over.id)
    // Optimistic reorder so @dnd-kit does not snap back to the old layout
    // while IndexedDB persists the new `position` values (SPEC: DB order).
    const next = reorderCards(cards, activeId, overId)
    setCards(next)
    void reorderDeckCards(deckId, activeId, overId).then(setCards).catch(() => {
      void reload()
    })
  }

  const beginStudy = async (forceNew: boolean) => {
    if (!forceNew && hasSession) {
      navigate(`/decks/${deckId}/study?resume=1`)
      return
    }
    const session = await startSession(deckId, filter, order)
    if (!session) {
      setMessage('No hay tarjetas para ese filtro.')
      return
    }
    navigate(`/decks/${deckId}/study`)
  }

  const openMetaEditor = () => {
    if (!deck) return
    setEditName(deck.name)
    setEditDescription(deck.description ?? '')
    setEditTags(tags.join(', '))
    setEditingMeta(true)
  }

  const saveMeta = async () => {
    if (!deck || !editName.trim()) return
    await updateDeck(deck.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    })
    await setDeckTags(deck.id, parseTagsInput(editTags))
    setEditingMeta(false)
    await reload()
  }

  if (!deck) return <div className="page">Cargando…</div>

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-main">
          <Link className="muted" to="/">
            ← Mazos
          </Link>
          <h1>{deck.name}</h1>
          {deck.description ? (
            <p className="muted">{deck.description}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="tag-row" aria-label="Etiquetas">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="muted">
            {progress.total} total · {progress.unseen} no vistas ·{' '}
            {progress.understood} comprendidas · {progress.needs_review} repasar
          </p>
        </div>
        <div className="page-header-actions">
          {!editingMeta ? (
            <button type="button" className="ghost" onClick={openMetaEditor}>
              Editar mazo
            </button>
          ) : null}
          <Link className="button" to={`/decks/${deckId}/cards/new`}>
            + Tarjeta
          </Link>
          <button
            type="button"
            onClick={() =>
              void exportDeck(deckId).then((data) =>
                downloadJson(`open-cards-${deck.name}.json`, data),
              )
            }
          >
            Exportar mazo
          </button>
        </div>
      </header>

      {editingMeta ? (
        <section className="panel stack">
          <h2>Editar mazo</h2>
          <label className="field">
            <span>Nombre</span>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
          </label>
          <label className="field">
            <span>Descripción</span>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Opcional"
            />
          </label>
          <label className="field">
            <span>Etiquetas</span>
            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Probabilidad, Examen"
            />
          </label>
          <div className="row gap wrap">
            <button type="button" onClick={() => void saveMeta()}>
              Guardar
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => setEditingMeta(false)}
            >
              Cancelar
            </button>
          </div>
        </section>
      ) : (
        <section className="panel stack">
          <h2>Estudiar</h2>
          {hasSession ? (
            <div className="row gap wrap">
              <button type="button" onClick={() => void beginStudy(false)}>
                Continuar sesión
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => void beginStudy(true)}
              >
                Empezar de nuevo
              </button>
            </div>
          ) : (
            <>
              <div className="study-controls">
                <label>
                  Filtro
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as StudyFilter)}
                  >
                    <option value="all">Todas ({progress.total})</option>
                    <option value="unseen">No vistas ({progress.unseen})</option>
                    <option value="needs_review">
                      Para repasar ({progress.needs_review})
                    </option>
                  </select>
                </label>
                <label>
                  Orden
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value as StudyOrder)}
                  >
                    <option value="sequential">Secuencial</option>
                    <option value="shuffled">Aleatorio</option>
                  </select>
                </label>
                <button type="button" onClick={() => void beginStudy(true)}>
                  Iniciar
                </button>
              </div>
              {message ? <p className="math-error">{message}</p> : null}
            </>
          )}
        </section>
      )}

      <section className="section-gap">
        <div className="section-heading-row">
          <h2>Tarjetas ({cards.length})</h2>
          {cards.length > 0 ? (
            <button
              type="button"
              className="ghost"
              onClick={() => setEditingCards((v) => !v)}
            >
              {editingCards ? 'Listo' : 'Editar tarjetas'}
            </button>
          ) : null}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={cards.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flash-card-grid">
              <Link
                to={`/decks/${deckId}/cards/new`}
                className="flash-create-card"
              >
                <span className="deck-create-plus" aria-hidden>
                  +
                </span>
                <span className="deck-create-label">Nueva tarjeta</span>
              </Link>
              {cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  flipped={Boolean(flipped[card.id])}
                  editing={editingCards}
                  otherDecks={otherDecks}
                  onFlip={() => {
                    setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))
                    if (card.state === 'unseen') {
                      void setCardState(card.id, 'flip').then(() => reload())
                    }
                  }}
                  onOpen={() =>
                    navigate(`/decks/${deckId}/cards/${card.id}`)
                  }
                  onDuplicate={() =>
                    void duplicateCard(card.id).then(() => reload())
                  }
                  onMove={(targetDeckId) =>
                    void moveCard(card.id, targetDeckId).then(() => reload())
                  }
                  onDelete={() =>
                    void deleteCard(card.id).then((removed) => {
                      if (removed) setUndoCard(removed)
                      void reload()
                    })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {cards.length === 0 ? (
          <p className="muted">Aún no hay tarjetas. Usa el + para crear la primera.</p>
        ) : null}
      </section>

      {undoCard ? (
        <UndoToast
          message="Tarjeta eliminada"
          onUndo={() => {
            void restoreCard(undoCard).then(() => {
              setUndoCard(null)
              void reload()
            })
          }}
          onDismiss={() => setUndoCard(null)}
        />
      ) : null}
    </div>
  )
}
