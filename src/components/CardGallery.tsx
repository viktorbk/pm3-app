import type { CardType } from '../types'

const CardSVG = ({ icon, color }: { icon: CardType['icon']; color: string }) => {
  switch (icon) {
    case 'card':
      return (
        <svg className="card-svg" width="100" height="64" viewBox="0 0 100 64" fill="none">
          <rect x="2" y="2" width="96" height="60" rx="6" stroke={color} strokeWidth="2" fill={color + '15'} />
          <rect x="12" y="12" width="20" height="14" rx="2" fill={color + '40'} />
          <line x1="12" y1="36" x2="60" y2="36" stroke={color + '30'} strokeWidth="2" />
          <line x1="12" y1="44" x2="45" y2="44" stroke={color + '20'} strokeWidth="2" />
          <circle cx="82" cy="46" r="8" stroke={color + '30'} strokeWidth="1.5" fill="none" />
          <circle cx="82" cy="46" r="4" fill={color + '20'} />
        </svg>
      )
    case 'clamshell':
      return (
        <svg className="card-svg" width="100" height="64" viewBox="0 0 100 64" fill="none">
          <rect x="2" y="2" width="96" height="60" rx="8" stroke={color} strokeWidth="2.5" fill={color + '10'} />
          <rect x="6" y="6" width="88" height="52" rx="5" stroke={color + '30'} strokeWidth="1" fill="none" />
          <circle cx="50" cy="32" r="14" stroke={color + '40'} strokeWidth="2" fill={color + '10'} />
          <circle cx="50" cy="32" r="6" fill={color + '30'} />
          <rect x="14" y="50" width="30" height="4" rx="2" fill={color + '20'} />
        </svg>
      )
    case 'fob':
      return (
        <svg className="card-svg" width="60" height="70" viewBox="0 0 60 70" fill="none">
          <ellipse cx="30" cy="42" rx="24" ry="24" stroke={color} strokeWidth="2" fill={color + '15'} />
          <circle cx="30" cy="42" r="10" stroke={color + '40'} strokeWidth="1.5" fill={color + '10'} />
          <circle cx="30" cy="42" r="4" fill={color + '30'} />
          <path d="M24 18 L30 6 L36 18" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="5" r="3" stroke={color} strokeWidth="1.5" fill="none" />
        </svg>
      )
    case 'coin':
      return (
        <svg className="card-svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
          <circle cx="35" cy="35" r="30" stroke={color} strokeWidth="2" fill={color + '15'} />
          <circle cx="35" cy="35" r="22" stroke={color + '30'} strokeWidth="1" fill="none" />
          <circle cx="35" cy="35" r="10" stroke={color + '40'} strokeWidth="1.5" fill={color + '10'} />
          <circle cx="35" cy="35" r="3" fill={color + '30'} />
        </svg>
      )
    case 'sticker':
      return (
        <svg className="card-svg" width="70" height="70" viewBox="0 0 70 70" fill="none">
          <circle cx="35" cy="35" r="30" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" fill={color + '08'} />
          <circle cx="35" cy="35" r="20" stroke={color + '40'} strokeWidth="1" fill={color + '10'} />
          <path d="M28 35 L42 35 M35 28 L35 42" stroke={color + '50'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'wristband':
      return (
        <svg className="card-svg" width="100" height="50" viewBox="0 0 100 50" fill="none">
          <path d="M10 25 Q10 8 30 8 L70 8 Q90 8 90 25 Q90 42 70 42 L30 42 Q10 42 10 25Z" stroke={color} strokeWidth="2" fill={color + '15'} />
          <rect x="38" y="16" width="24" height="18" rx="3" stroke={color + '40'} strokeWidth="1.5" fill={color + '10'} />
          <circle cx="50" cy="25" r="4" fill={color + '30'} />
        </svg>
      )
    default:
      return null
  }
}

export const SOURCE_CARDS: CardType[] = [
  {
    id: 'mifare-1k',
    name: 'Mifare Classic 1K',
    frequency: 'hf',
    description: '13.56 MHz, most common access card',
    writable: false,
    icon: 'card',
    color: '#8b5cf6',
  },
  {
    id: 'mifare-4k',
    name: 'Mifare Classic 4K',
    frequency: 'hf',
    description: '13.56 MHz, 4KB storage',
    writable: false,
    icon: 'card',
    color: '#8b5cf6',
  },
  {
    id: 'mifare-ul',
    name: 'Mifare Ultralight',
    frequency: 'hf',
    description: '13.56 MHz, NFC stickers & tags',
    writable: false,
    icon: 'sticker',
    color: '#8b5cf6',
  },
  {
    id: 'em4100',
    name: 'EM4100',
    frequency: 'lf',
    description: '125 kHz, common keyfob & card',
    writable: false,
    icon: 'fob',
    color: '#f97316',
  },
  {
    id: 'hid-prox',
    name: 'HID ProxCard',
    frequency: 'lf',
    description: '125 kHz, HID access control',
    writable: false,
    icon: 'card',
    color: '#f97316',
  },
  {
    id: 'indala',
    name: 'Indala',
    frequency: 'lf',
    description: '125 kHz, Indala access card',
    writable: false,
    icon: 'clamshell',
    color: '#f97316',
  },
]

export const TARGET_CARDS: CardType[] = [
  {
    id: 'magic-gen1',
    name: 'Magic Gen1a Card',
    frequency: 'hf',
    description: 'Writable Mifare Classic clone card',
    writable: true,
    icon: 'card',
    color: '#3b82f6',
  },
  {
    id: 'magic-gen2',
    name: 'Magic Gen2/CUID',
    frequency: 'hf',
    description: 'Gen2 UID-changeable Mifare card',
    writable: true,
    icon: 'card',
    color: '#06b6d4',
  },
  {
    id: 'magic-fob-hf',
    name: 'HF Key Fob',
    frequency: 'hf',
    description: '13.56 MHz writable key fob',
    writable: true,
    icon: 'fob',
    color: '#3b82f6',
  },
  {
    id: 't55xx-card',
    name: 'T55xx Card',
    frequency: 'lf',
    description: '125 kHz writable blank card',
    writable: true,
    icon: 'card',
    color: '#eab308',
  },
  {
    id: 't55xx-fob',
    name: 'T55xx Key Fob',
    frequency: 'lf',
    description: '125 kHz writable key fob',
    writable: true,
    icon: 'fob',
    color: '#eab308',
  },
  {
    id: 't55xx-coin',
    name: 'T55xx Coin Tag',
    frequency: 'lf',
    description: '125 kHz writable coin/disc',
    writable: true,
    icon: 'coin',
    color: '#eab308',
  },
  {
    id: 't55xx-wristband',
    name: 'T55xx Wristband',
    frequency: 'lf',
    description: '125 kHz writable wristband',
    writable: true,
    icon: 'wristband',
    color: '#eab308',
  },
  {
    id: 'nfc-sticker',
    name: 'NFC Sticker',
    frequency: 'hf',
    description: '13.56 MHz writable NFC sticker',
    writable: true,
    icon: 'sticker',
    color: '#3b82f6',
  },
]

interface Props {
  cards: CardType[]
  selected: string | null
  onSelect: (card: CardType) => void
  title: string
}

export default function CardGallery({ cards, selected, onSelect, title }: Props) {
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text-secondary)' }}>
        {title}
      </h3>
      <div className="card-gallery">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card-item ${card.frequency} ${selected === card.id ? 'selected' : ''}`}
            onClick={() => onSelect(card)}
          >
            <div className="card-icon-wrapper">
              <CardSVG icon={card.icon} color={card.color} />
            </div>
            <div className="card-item-name">{card.name}</div>
            <div className="card-item-desc">{card.description}</div>
            <span className={`card-freq-tag ${card.frequency}`}>
              {card.frequency === 'hf' ? '13.56 MHz' : '125 kHz'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
