import { v4 as uuidv4 } from 'uuid';
import type {
  Card,
  PropertyCard,
  WildPropertyCard,
  MoneyCard,
  ActionCard,
  RentCard,
  PropertyColor,
} from '../types';
import { PROPERTY_NAMES } from '../types';

// Helper functions to create cards
const createPropertyCard = (color: PropertyColor, name: string, value: number): PropertyCard => ({
  id: uuidv4(),
  type: 'property',
  color,
  name,
  value,
});

const createWildCard = (colors: PropertyColor[], value: number, isMultiColor = false): WildPropertyCard => ({
  id: uuidv4(),
  type: 'wild',
  colors,
  value,
  isMultiColor,
});

const createMoneyCard = (value: number): MoneyCard => ({
  id: uuidv4(),
  type: 'money',
  value,
});

const createActionCard = (
  actionType: ActionCard['actionType'],
  name: string,
  description: string,
  value: number
): ActionCard => ({
  id: uuidv4(),
  type: 'action',
  actionType,
  name,
  description,
  value,
});

const createRentCard = (colors: PropertyColor[], isWildRent: boolean, value: number): RentCard => ({
  id: uuidv4(),
  type: 'rent',
  colors,
  isWildRent,
  value,
});

// Create the full Monopoly Deal deck (106 cards)
export const createDeck = (): Card[] => {
  const deck: Card[] = [];

  // Property Cards (28 cards)
  // Brown (2 cards)
  PROPERTY_NAMES.brown.forEach(name => deck.push(createPropertyCard('brown', name, 1)));

  // Light Blue (3 cards)
  PROPERTY_NAMES.lightBlue.forEach(name => deck.push(createPropertyCard('lightBlue', name, 1)));

  // Pink (3 cards)
  PROPERTY_NAMES.pink.forEach(name => deck.push(createPropertyCard('pink', name, 2)));

  // Orange (3 cards)
  PROPERTY_NAMES.orange.forEach(name => deck.push(createPropertyCard('orange', name, 2)));

  // Red (3 cards)
  PROPERTY_NAMES.red.forEach(name => deck.push(createPropertyCard('red', name, 3)));

  // Yellow (3 cards)
  PROPERTY_NAMES.yellow.forEach(name => deck.push(createPropertyCard('yellow', name, 3)));

  // Green (3 cards)
  PROPERTY_NAMES.green.forEach(name => deck.push(createPropertyCard('green', name, 4)));

  // Blue (2 cards)
  PROPERTY_NAMES.blue.forEach(name => deck.push(createPropertyCard('blue', name, 4)));

  // Railroad (4 cards)
  PROPERTY_NAMES.railroad.forEach(name => deck.push(createPropertyCard('railroad', name, 2)));

  // Utility (2 cards)
  PROPERTY_NAMES.utility.forEach(name => deck.push(createPropertyCard('utility', name, 2)));

  // Wild Property Cards (11 cards)
  // 2-color wilds
  deck.push(createWildCard(['brown', 'lightBlue'], 1));
  deck.push(createWildCard(['pink', 'orange'], 2));
  deck.push(createWildCard(['red', 'yellow'], 3));
  deck.push(createWildCard(['green', 'blue'], 4));
  deck.push(createWildCard(['green', 'railroad'], 4));
  deck.push(createWildCard(['lightBlue', 'railroad'], 4));
  deck.push(createWildCard(['utility', 'railroad'], 2));
  deck.push(createWildCard(['lightBlue', 'brown'], 1));

  // Multi-color wilds (can be any color) - 2 cards
  deck.push(createWildCard(['brown', 'lightBlue', 'pink', 'orange', 'red', 'yellow', 'green', 'blue', 'railroad', 'utility'], 0, true));
  deck.push(createWildCard(['brown', 'lightBlue', 'pink', 'orange', 'red', 'yellow', 'green', 'blue', 'railroad', 'utility'], 0, true));

  // Money Cards (20 cards)
  // $1M - 6 cards
  for (let i = 0; i < 6; i++) deck.push(createMoneyCard(1));
  // $2M - 5 cards
  for (let i = 0; i < 5; i++) deck.push(createMoneyCard(2));
  // $3M - 3 cards
  for (let i = 0; i < 3; i++) deck.push(createMoneyCard(3));
  // $4M - 3 cards
  for (let i = 0; i < 3; i++) deck.push(createMoneyCard(4));
  // $5M - 2 cards
  for (let i = 0; i < 2; i++) deck.push(createMoneyCard(5));
  // $10M - 1 card
  deck.push(createMoneyCard(10));

  // Action Cards (34 cards)
  // Deal Breaker - 2 cards
  for (let i = 0; i < 2; i++) {
    deck.push(createActionCard('dealBreaker', 'Deal Breaker', 'Steal a complete set of properties from any player', 5));
  }

  // Just Say No - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createActionCard('justSayNo', 'Just Say No!', 'Cancel any action card played against you', 4));
  }

  // Sly Deal - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createActionCard('slyDeal', 'Sly Deal', 'Steal a property from any player (not from a complete set)', 3));
  }

  // Forced Deal - 4 cards
  for (let i = 0; i < 4; i++) {
    deck.push(createActionCard('forcedDeal', 'Forced Deal', 'Swap a property with any player (not from complete sets)', 3));
  }

  // Debt Collector - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createActionCard('debtCollector', 'Debt Collector', 'Force any player to pay you $5M', 3));
  }

  // It's My Birthday - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createActionCard('itsMyBirthday', "It's My Birthday!", 'All players pay you $2M', 2));
  }

  // Pass Go - 10 cards
  for (let i = 0; i < 10; i++) {
    deck.push(createActionCard('passGo', 'Pass Go', 'Draw 2 extra cards', 1));
  }

  // House - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createActionCard('house', 'House', 'Add to a complete set. +$3M rent', 3));
  }

  // Hotel - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createActionCard('hotel', 'Hotel', 'Add to a complete set with a house. +$4M rent', 4));
  }

  // Double the Rent - 2 cards
  for (let i = 0; i < 2; i++) {
    deck.push(createActionCard('doubleRent', 'Double The Rent!', 'Play with a rent card to double the rent', 1));
  }

  // Rent Cards (13 cards)
  // 2-color rent cards (2 of each)
  deck.push(createRentCard(['brown', 'lightBlue'], false, 1));
  deck.push(createRentCard(['brown', 'lightBlue'], false, 1));
  deck.push(createRentCard(['pink', 'orange'], false, 1));
  deck.push(createRentCard(['pink', 'orange'], false, 1));
  deck.push(createRentCard(['red', 'yellow'], false, 1));
  deck.push(createRentCard(['red', 'yellow'], false, 1));
  deck.push(createRentCard(['green', 'blue'], false, 1));
  deck.push(createRentCard(['green', 'blue'], false, 1));
  deck.push(createRentCard(['railroad', 'utility'], false, 1));
  deck.push(createRentCard(['railroad', 'utility'], false, 1));

  // Wild rent (any color) - 3 cards
  for (let i = 0; i < 3; i++) {
    deck.push(createRentCard(['brown', 'lightBlue', 'pink', 'orange', 'red', 'yellow', 'green', 'blue', 'railroad', 'utility'], true, 3));
  }

  return deck;
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
