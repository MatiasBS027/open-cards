import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isCardContentValid } from '../../domain/blocks'
import type { Block } from '../../domain/types'
import {
  createCard,
  getCard,
  updateCard,
} from '../../storage/repositories'
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
    <div className="page">
      <header className="page-header">
        <Link to={`/decks/${deckId}`}>← Mazo</Link>
        <h1>{isNew ? 'Nueva tarjeta' : 'Editar tarjeta'}</h1>
      </header>

      <BlockEditor label="Frente" blocks={front} onChange={setFront} />
      <BlockEditor label="Reverso" blocks={back} onChange={setBack} />

      {error ? <p className="math-error">{error}</p> : null}

      <div className="row gap">
        <button type="button" onClick={() => void save()}>
          Guardar
        </button>
        <button type="button" className="ghost" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>

      <section className="panel">
        <h2>Vista previa</h2>
        <h3>Frente</h3>
        <BlockRenderer blocks={front} />
        <h3>Reverso</h3>
        <BlockRenderer blocks={back} />
      </section>
    </div>
  )
}
