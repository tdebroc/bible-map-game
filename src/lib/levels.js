export const LEVELS = [
  {
    id: 'facile',
    label: 'Facile',
    emoji: '🌱',
    tagline: 'Les grands moments',
    hint: 'Noël, Pâques, le baptême… les scènes les plus connues.',
    className: 'diff-easy',
  },
  {
    id: 'moyen',
    label: 'Moyen',
    emoji: '⚔️',
    tagline: 'Le ministère public',
    hint: 'Miracles, paraboles et voyages en Galilée et en Judée.',
    className: 'diff-medium',
  },
  {
    id: 'difficile',
    label: 'Difficile',
    emoji: '🔥',
    tagline: 'Pour les érudits',
    hint: 'Villages reculés, territoires païens et scènes rares.',
    className: 'diff-hard',
  },
]

export const DEFAULT_LEVEL = LEVELS[0].id

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0]
}
