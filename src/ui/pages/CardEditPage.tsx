import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isCardContentValid } from '../../domain/blocks'
import type { Block } from '../../domain/types'
import { createCard, getCard, updateCard } from '../../storage/repositories'
import { BlockEditor } from '../blocks/BlockEditor'
import { BlockRenderer } from '../blocks/BlockRenderer'

export function CardEditPage() {
  const { deckId = '', cardId } = useParams()
  const isNew = !cardId || cardId === 'new'
  const navigate = useNavigate()
  const [front, setFront] = useState<Block[]>([{ type: 'text', content: '' }])
  const [back, setBack] = useState<Block[]>([{ type: 'text', content: '' }])
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    void getCard(cardId).then((card) => {
      if (!card) {
        navigate(`/decks/${deckId}`)
        return
      }
      setFront(card.front)
      setBack(card.back)
    })
  }, [cardId, deckId, isNew, navigate])

  const save = async () => {
    if (!isCardContentValid(front, back)) {
      setError('Frente y reverso necesitan contenido no vacío.')
      return
    }
    if (isNew) {
      await createCard(deckId, front, back)
    } else {
      await updateCard(cardId, front, back)
    }
    navigate(`/decks/${deckId}`)
  }

  return (
    <div className="page card-edit-page">
      <header className="page-header">
        <div className="page-header-main">
          <Link to={`/decks/${deckId}`}>← Mazo</Link>
          <h1>{isNew ? 'Nueva tarjeta' : 'Editar tarjeta'}</h1>
        </div>
      </header>

      <div className="card-edit-layout">
        <BlockEditor label="Frente" blocks={front} onChange={setFront} />
        <BlockEditor label="Reverso" blocks={back} onChange={setBack} />
      </div>

      {error ? <p className="math-error">{error}</p> : null}

      <div className="row gap wrap">
        <button type="button" onClick={() => void save()}>
          Guardar
        </button>
        <button type="button" className="ghost" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>

      <section className="panel card-edit-preview">
        <h2>Vista previa</h2>
        <div className="card-edit-preview-grid">
          <div className="preview-mini">
            <span className="muted">Frente</span>
            <BlockRenderer blocks={front} />
          </div>
          <div className="preview-mini">
            <span className="muted">Reverso</span>
            <BlockRenderer blocks={back} />
          </div>
        </div>
      </section>
    </div>
  )
}
