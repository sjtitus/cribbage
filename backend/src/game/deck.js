import { strict as assert } from 'assert';
import KS from 'knuth-shuffle';
import {GetModuleLogger} from '../util/Logger.js';
const log = GetModuleLogger('DeckHand');

console.log(`deck/hand logging level is ${log.transports[1].level}`);

const cardArray = [
    // clubs
    { order: 1,  value: 1,  name: 'A',  suit: 'C', color: 'B' },
    { order: 2,  value: 2,  name: '2',  suit: 'C', color: 'B' },
    { order: 3,  value: 3,  name: '3',  suit: 'C', color: 'B' },
    { order: 4,  value: 4,  name: '4',  suit: 'C', color: 'B' },
    { order: 5,  value: 5,  name: '5',  suit: 'C', color: 'B' },
    { order: 6,  value: 6,  name: '6',  suit: 'C', color: 'B' },
    { order: 7,  value: 7,  name: '7',  suit: 'C', color: 'B' },
    { order: 8,  value: 8,  name: '8',  suit: 'C', color: 'B' },
    { order: 9,  value: 9,  name: '9',  suit: 'C', color: 'B' },
    { order: 10, value: 10, name: '10', suit: 'C', color: 'B' },
    { order: 11, value: 10, name: 'J',  suit: 'C', color: 'B' },
    { order: 12, value: 10, name: 'Q',  suit: 'C', color: 'B' },
    { order: 13, value: 10, name: 'K',  suit: 'C', color: 'B' },
    // hearts 
    { order: 1,  value: 1,  name: 'A',  suit: 'H', color: 'R' },
    { order: 2,  value: 2,  name: '2',  suit: 'H', color: 'R' },
    { order: 3,  value: 3,  name: '3',  suit: 'H', color: 'R' },
    { order: 4,  value: 4,  name: '4',  suit: 'H', color: 'R' },
    { order: 5,  value: 5,  name: '5',  suit: 'H', color: 'R' },
    { order: 6,  value: 6,  name: '6',  suit: 'H', color: 'R' },
    { order: 7,  value: 7,  name: '7',  suit: 'H', color: 'R' },
    { order: 8,  value: 8,  name: '8',  suit: 'H', color: 'R' },
    { order: 9,  value: 9,  name: '9',  suit: 'H', color: 'R' },
    { order: 10, value: 10, name: '10', suit: 'H', color: 'R' },
    { order: 11, value: 10, name: 'J',  suit: 'H', color: 'R' },
    { order: 12, value: 10, name: 'Q',  suit: 'H', color: 'R' },
    { order: 13, value: 10, name: 'K',  suit: 'H', color: 'R' },
    // diamonds 
    { order: 1,  value: 1,  name: 'A',  suit: 'D', color: 'R' },
    { order: 2,  value: 2,  name: '2',  suit: 'D', color: 'R' },
    { order: 3,  value: 3,  name: '3',  suit: 'D', color: 'R' },
    { order: 4,  value: 4,  name: '4',  suit: 'D', color: 'R' },
    { order: 5,  value: 5,  name: '5',  suit: 'D', color: 'R' },
    { order: 6,  value: 6,  name: '6',  suit: 'D', color: 'R' },
    { order: 7,  value: 7,  name: '7',  suit: 'D', color: 'R' },
    { order: 8,  value: 8,  name: '8',  suit: 'D', color: 'R' },
    { order: 9,  value: 9,  name: '9',  suit: 'D', color: 'R' },
    { order: 10, value: 10, name: '10', suit: 'D', color: 'R' },
    { order: 11, value: 10, name: 'J',  suit: 'D', color: 'R' },
    { order: 12, value: 10, name: 'Q',  suit: 'D', color: 'R' },
    { order: 13, value: 10, name: 'K',  suit: 'D', color: 'R' },
    // spades 
    { order: 1,  value: 1,  name: 'A',  suit: 'S', color: 'B' },
    { order: 2,  value: 2,  name: '2',  suit: 'S', color: 'B' },
    { order: 3,  value: 3,  name: '3',  suit: 'S', color: 'B' },
    { order: 4,  value: 4,  name: '4',  suit: 'S', color: 'B' },
    { order: 5,  value: 5,  name: '5',  suit: 'S', color: 'B' },
    { order: 6,  value: 6,  name: '6',  suit: 'S', color: 'B' },
    { order: 7,  value: 7,  name: '7',  suit: 'S', color: 'B' },
    { order: 8,  value: 8,  name: '8',  suit: 'S', color: 'B' },
    { order: 9,  value: 9,  name: '9',  suit: 'S', color: 'B' },
    { order: 10, value: 10, name: '10', suit: 'S', color: 'B' },
    { order: 11, value: 10, name: 'J',  suit: 'S', color: 'B' },
    { order: 12, value: 10, name: 'Q',  suit: 'S', color: 'B' },
    { order: 13, value: 10, name: 'K',  suit: 'S', color: 'B' }
];


//_________________________________________________________________________________________________
// A deck of cards
export class Deck {

    // Construct a deck of cards (cards are in cardArray order) 
    constructor() {
        this._cards = cardArray;
        this._index = [...cardArray.keys()];
    }

    // Return the number of cards remaining in the deck
    get length() {
        return this._index.length;
    }

    // Shuffle the deck n times
    Shuffle(n=1) {
        assert(n>0);
        for (let i=0; i<n; i++) {
            KS.knuthShuffle(this._index);
        } 
    }

    // Get n cards off the top of the deck.
    // Optionally remove the cards 
    GetCards(n, remove=true) {
        assert(n>0);
        assert(this._index.length >= n, `can not access ${n} cards (only ${this._index.length} in deck)`);
        const action = (remove) ? 'removing':'peeking';
        log.debug(`Deck: ${action} ${n} cards from top of deck (of ${this._index.length})`);
        const indices = (remove)? this._index.splice(0,n):this._index.slice(0,n);
        const out = [];
        for (let i=0; i<n; i++) {
            out[i] = this._cards[indices[i]]; 
        }
        log.debug(`Deck: ${this._index.length} cards left`);
        return out; 
    }


    Dump() {
        this._index.forEach( (i) => log.debug(`${this._cards[i].name} of ${this._cards[i].suit}`));
    }
}

//_________________________________________________________________________________________________
// Dump an array of cards (not a hand) as a string 
export function CardsToString(cards) {
    assert(Array.isArray(cards)); 
    let str = '';
    cards.forEach( (c,i) => {
        str = str.concat(`${c.name}${c.suit}`, (i<cards.length-1) ? ',':'');
    });
    return str;
}

export function CardCanPeg(card, sum) {
    assert(Array.isArray(card) && card.length===1);
    return (sum + card[0].value <= 31);
}

//_________________________________________________________________________________________________
// Hand: a set of cards from a deck
export class Hand {

    // Hand is either n cards from a deck, or a copy of an existing hand
    constructor(source, n) {
        if (source instanceof Hand) {
            this.cards = source.cards.slice(0);
        }
        else if (source instanceof Deck) {
            assert(n>=1);
            this.cards = source.GetCards(n);
        }
        else if (Array.isArray(source)) {
            this.cards = source; 
        }
    }

    get Length() {
        return this.cards.length;
    }
    
    GetValidCard(sum) {
        let outCard = null; 
        log.debug(`GetValidCard: peeking valid card for sum ${sum} (hand ${this.String()})`);
        const index = this.cards.findIndex( ({value}) => (sum + value <= 31) );
        if (index >= 0) { 
            outCard = this.cards.slice(index, index+1); 
            log.debug(`GetValidCard: valid card is ${CardsToString(outCard)}`);
        }
        else {
            log.debug(`GetValidCard: no valid card`); 
        }
        return outCard; 
    }

    String() {
        return CardsToString(this.cards);
    }

    Contains(card) {
        assert(Array.isArray(card) && card.length === 1);
        //log.debug(`Contains: is card ${CardsToString(card)} in ${this.String()} ?`);
        return this.cards.findIndex((hc) => {
            //log.debug(`Contains: comparing ${hc.name} to ${card[0].name} and ${hc.suit} to ${card[0].suit}`);
            return (hc.name === card[0].name && hc.suit === card[0].suit);
        });
    }

    Remove(card) {
        let foundCard = null; 
        log.debug(`Remove: removing card ${CardsToString(card)} from ${this.String()}`);
        const index = this.Contains(card);
        if (index >= 0) {
            foundCard = this.cards.splice(index,1);
        }
        return foundCard; 
    }
    
    CanPeg(sum) {
        const able = this.cards.some( ({value}) => (sum + value <= 31) );
        //log.debug(`CanPeg: can this hand peg against ${sum}? ${able}`);
        return able; 
    }

}


/*
    TEST MATERIAL

console.log(`hand1: ${hand1.String()}`);
console.log(`hand2: ${hand2.String()}`);

console.log(`---\nhand1: min value: ${hand1.MinValue()}`);
console.log(`hand2: max value: ${hand2.MaxValue()}`);

const c1 = hand1.GetCards(1,false);
const c2 = hand2.GetCards(1);

console.log(`---\nhand1: ${hand1.String()}`);
console.log(`hand2: ${hand2.String()}`);

console.log(`---\nc1: ${CardsToString(c1)}`);
console.log(`c2: ${CardsToString(c2)}`);

console.log(`---\nhand1 contains C1: ${hand1.Contains(c1)}`);
console.log(`hand2 contains C2: ${hand2.Contains(c2)}`);

console.log(`cloning hand 1: ${players[0].hand.String()}`);
const copyHand = new Hand(players[0].hand);
console.log(`copy: ${copyHand.String()}`);
copyHand.GetCards(3);
console.log(`copy: ${copyHand.String()}`);
console.log(`hand 1: ${players[0].hand.String()}`);

*/
