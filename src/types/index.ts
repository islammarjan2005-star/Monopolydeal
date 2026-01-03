// Monopoly Deal Card Types

export type PropertyColor =
  | 'brown'
  | 'lightBlue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'railroad'
  | 'utility';

export type CardType = 'property' | 'money' | 'action' | 'rent' | 'wild';

export interface BaseCard {
  id: string;
  type: CardType;
  value: number;
}

export interface PropertyCard extends BaseCard {
  type: 'property';
  name: string;
  color: PropertyColor;
  isWild?: false;
}

export interface WildPropertyCard extends BaseCard {
  type: 'wild';
  colors: PropertyColor[];
  currentColor?: PropertyColor;
  isMultiColor?: boolean;
}

export interface MoneyCard extends BaseCard {
  type: 'money';
}

export type ActionType =
  | 'dealBreaker'
  | 'justSayNo'
  | 'slyDeal'
  | 'forcedDeal'
  | 'debtCollector'
  | 'itsMyBirthday'
  | 'passGo'
  | 'house'
  | 'hotel'
  | 'doubleRent';

export interface ActionCard extends BaseCard {
  type: 'action';
  actionType: ActionType;
  name: string;
  description: string;
}

export interface RentCard extends BaseCard {
  type: 'rent';
  colors: PropertyColor[];
  isWildRent: boolean;
}

export type Card = PropertyCard | WildPropertyCard | MoneyCard | ActionCard | RentCard;

export interface PropertySet {
  color: PropertyColor;
  properties: (PropertyCard | WildPropertyCard)[];
  house?: boolean;
  hotel?: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  bank: (MoneyCard | ActionCard | RentCard)[];
  properties: PropertySet[];
  avatar: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  phase: 'setup' | 'draw' | 'play' | 'discard' | 'respond' | 'gameOver';
  actionsRemaining: number;
  turnCount: number;
  winner: Player | null;
  pendingAction: PendingAction | null;
  message: string;
}

export interface PendingAction {
  type: ActionType | 'rent' | 'payment';
  sourcePlayerId: string;
  targetPlayerId?: string;
  amount?: number;
  card?: Card;
  propertyColor?: PropertyColor;
  canSayNo: boolean;
}

export const PROPERTY_SET_SIZES: Record<PropertyColor, number> = {
  brown: 2,
  lightBlue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  blue: 2,
  railroad: 4,
  utility: 2,
};

export const PROPERTY_RENT_VALUES: Record<PropertyColor, number[]> = {
  brown: [1, 2],
  lightBlue: [1, 2, 3],
  pink: [1, 2, 4],
  orange: [1, 3, 5],
  red: [2, 3, 6],
  yellow: [2, 4, 6],
  green: [2, 4, 7],
  blue: [3, 8],
  railroad: [1, 2, 3, 4],
  utility: [1, 2],
};

export const PROPERTY_COLORS_DISPLAY: Record<PropertyColor, string> = {
  brown: '#8B4513',
  lightBlue: '#87CEEB',
  pink: '#FF69B4',
  orange: '#FF8C00',
  red: '#DC143C',
  yellow: '#FFD700',
  green: '#228B22',
  blue: '#0000CD',
  railroad: '#2F2F2F',
  utility: '#90EE90',
};

export const PROPERTY_NAMES: Record<PropertyColor, string[]> = {
  brown: ['Mediterranean Avenue', 'Baltic Avenue'],
  lightBlue: ['Oriental Avenue', 'Vermont Avenue', 'Connecticut Avenue'],
  pink: ['St. Charles Place', 'States Avenue', 'Virginia Avenue'],
  orange: ['St. James Place', 'Tennessee Avenue', 'New York Avenue'],
  red: ['Kentucky Avenue', 'Indiana Avenue', 'Illinois Avenue'],
  yellow: ['Atlantic Avenue', 'Ventnor Avenue', 'Marvin Gardens'],
  green: ['Pacific Avenue', 'North Carolina Avenue', 'Pennsylvania Avenue'],
  blue: ['Park Place', 'Boardwalk'],
  railroad: ['Reading Railroad', 'Pennsylvania Railroad', 'B&O Railroad', 'Short Line'],
  utility: ['Electric Company', 'Water Works'],
};
