import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Card, StudySession } from '../../domain/types'
import {
  deleteSession,
  getCard,
  getDeck,
  getSessionForDeck,
  resumeSession,
  setCardState,
  updateSessionIndex,
} from '../../storage/repositories'
import { BlockRenderer } from '../blocks/BlockRenderer'

export function StudyPage() {
  const { deckId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<StudySession | null>(null)
  const [card, setCard] = useState<Card | null>(null)
  const [deckName, setDeckName] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const touchX = useRef<number | null>(null)
  const swiped = useRef(false)

  useEffect(() => {
    void getDeck(deckId).then((d) => setDeckName(d?.name ?? ''))
    const load = async () => {
      const s =
        params.get('resume') === '1'
          ? await resumeSession(deckId)
          : await getSessionForDeck(deckId)
      if (!s) {
        navigate(`/decks/${deckId}`)
        return
      }
      setSession(s)
    }
    void load()
  }, [deckId, navigate, params])

  useEffect(() => {
    if (!session) return
    const id = session.cardIds[session.currentIndex]
    void getCard(id).then((c) => {
      setCard(c ?? null)
      setFlipped(false)
    })
  }, [session])

  async function go(delta: number) {
    if (!session) return
    const next = session.currentIndex + delta
    if (next < 0) return
    if (next >= session.cardIds.length) {
      await deleteSession(session.id)
      setDone(true)
      return
    }
    await updateSessionIndex(session.id, next)
    setSession({ ...session, currentIndex: next })
  }

  function flip() {
    setFlipped((f) => !f)
    if (card && card.state === 'unseen') {
      void setCardState(card.id, 'flip').then((updated) => {
        if (updated) setCard(updated)
      })
    }
  }

  async function classify(kind: 'understood' | 'needs_review') {
    if (!card || !session) return
    await setCardState(card.id, kind)
    await go(1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!session || !card || done) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        flip()
      } else if (e.key === 'c' || e.key === 'C') {
        void classify('understood')
      } else if (e.key === 'r' || e.key === 'R') {
        void classify('needs_review')
      } else if (e.key === 'ArrowRight') {
        void go(1)
      } else if (e.key === 'ArrowLeft') {
        void go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done) {
    return (
      <div className="page center study-done">
        <h1>Terminaste el mazo</h1>
        <Link className="button primary" to={`/decks/${deckId}`}>
          Volver al mazo
        </Link>
      </div>
    )
  }

  if (!session || !card) {
    return <div className="page">Cargando sesión…</div>
  }

  const canGoPrev = session.currentIndex > 0

  return (
    <div className="page study-page">
      <header className="study-top">
        <div>
          <Link to={`/decks/${deckId}`}>← Salir</Link>
          <p className="muted study-deck-name">{deckName}</p>
        </div>
        <p className="study-progress">
          {session.currentIndex + 1} / {session.cardIds.length}
        </p>
      </header>

      <div className="study-stage">
        <div className="study-card-row">
          <button
            type="button"
            className="study-nav-arrow"
            aria-label="Anterior"
            disabled={!canGoPrev}
            onClick={() => void go(-1)}
          >
            ‹
          </button>

          <div className="study-flash-scene">
            <button
              type="button"
              className={`study-flash${flipped ? ' is-flipped' : ''}`}
              onClick={() => {
                if (swiped.current) {
                  swiped.current = false
                  return
                }
                flip()
              }}
              onTouchStart={(e) => {
                touchX.current = e.changedTouches[0]?.clientX ?? null
                swiped.current = false
              }}
              onTouchEnd={(e) => {
                if (touchX.current == null) return
                const x = e.changedTouches[0]?.clientX ?? touchX.current
                const dx = x - touchX.current
                if (dx > 80) {
                  swiped.current = true
                  void classify('understood')
                } else if (dx < -80) {
                  swiped.current = true
                  void classify('needs_review')
                }
                touchX.current = null
              }}
            >
              {flipped ? (
                <div className="study-flash-split" key="flipped">
                  <div className="study-flash-pane">
                    <span className="study-face-label">Anverso</span>
                    <div className="study-flash-content">
                      <BlockRenderer blocks={card.front} />
                    </div>
                  </div>
                  <div className="study-flash-divider" aria-hidden />
                  <div className="study-flash-pane">
                    <span className="study-face-label">Reverso</span>
                    <div className="study-flash-content">
                      <BlockRenderer blocks={card.back} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="study-flash-front" key="front">
                  <span className="study-face-label">Anverso</span>
                  <div className="study-flash-content">
                    <BlockRenderer blocks={card.front} />
                  </div>
                  <span className="study-flash-hint">
                    Pulsa la tarjeta para revelar la respuesta
                  </span>
                </div>
              )}
            </button>
          </div>

          <button
            type="button"
            className="study-nav-arrow"
            aria-label="Siguiente"
            onClick={() => void go(1)}
          >
            ›
          </button>
        </div>

        <div className="study-grade">
          <button
            type="button"
            className="study-grade-btn"
            onClick={() => void classify('needs_review')}
          >
            <span className="study-grade-icon" aria-hidden>
              ↺
            </span>
            <strong>Repasar</strong>
            <small>Volver a estudiar</small>
          </button>
          <button
            type="button"
            className="study-grade-btn"
            onClick={() => void classify('understood')}
          >
            <span className="study-grade-icon" aria-hidden>
              ✓
            </span>
            <strong>Aprendida</strong>
            <small>La domino</small>
          </button>
        </div>
      </div>
    </div>
  )
}
