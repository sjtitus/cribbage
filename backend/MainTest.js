import { PeggingMachine } from './src/game/PeggingMachine.js';
import { Deck, Hand, CardsToString } from './src/game/deck.js';
import { strict as assert } from 'assert';
import { WaitThenExit } from './src/util/ProcessUtils.js';


/*
const h = new Hand( [ 
    { order: 10, value: 10, name: '10', suit: 'C', color: 'B' },
    { order: 2,  value: 2,  name: '2',  suit: 'C', color: 'B' },
]);
const c = h.GetValidCard(29);
h.Remove(c);
console.log(h.String());
process.exit(0);
*/

const deck = new Deck();
deck.Shuffle(3);

const p0Hand = new Hand(deck,4);
const p1Hand = new Hand(deck,4);

const players = [
    { name: "Ann", dealer: true, hand: p0Hand, originalHand: p0Hand.String()   },
    { name: "Bob", dealer: false, hand: p1Hand,  originalHand: p1Hand.String() },
];

console.log(`___________________________________________`);
console.log(`player 0: dealer: ${players[0].dealer}, hand: ${players[0].originalHand}`);
console.log(`player 1: dealer: ${players[1].dealer}, hand: ${players[1].originalHand}`);
console.log(`___________________________________________`);

const m = new PeggingMachine(players);

// Respond to server request for a card 
function selectCard(playerIndex, sum, reqID) {
    //console.log(`___________________________________________`);
    const p = players[playerIndex];
    //console.log(`player ${playerIndex} turn: (req=${reqID})`);
    //console.log(`   hand: ${players[playerIndex].hand.String()}`);
    //console.log(`   Pile: ${CardsToString(m._peggingData.pile)}`);
    //console.log(`   Sum: ${sum}`);
    let card = p.hand.GetValidCard(sum);
    //console.log(`  card: ${CardsToString(card)}`);
    //console.log(`___________________________________________`);
    m._dispatch('GOTCARD', playerIndex, reqID, card, false);    // human submitted (not auto)
}

// Card accepted on server side 
function cardPlayed(playerIndex, card) {
    const p = players[playerIndex];
    p.hand.Remove(card); 
    console.log(`___________________________________________`);
    console.log(`Player ${playerIndex}: card played, ${CardsToString(card)}`);
    console.log(`         P0 hand: ${players[0].hand.String()}`);
    console.log(`         P1 hand: ${players[1].hand.String()}`);
    console.log(`            Pile: ${CardsToString(m._peggingData.pile)}`);
    console.log(`     pegging sum: ${m._peggingData.sum}`);
    console.log(`   pegging score: P0=${m._peggingData.playerData[0].points}, P1=${m._peggingData.playerData[1].points}`);
    console.log(`___________________________________________`);
    console.log(``);
}

// Card rejected on server side 
function cardRejected(playerIndex, reqID) {
    console.log(`___________________________________________`);
    console.log(`Player ${playerIndex}: card rejected (req=${reqID})`);
    console.log(` . how could this happen to me?`);
    console.log(`___________________________________________`);
}


// Respond to pegging machine events
m.Events.on('peg-start', () => setImmediate(() => m._dispatch('PROCEED')) );
m.Events.on('peg-requestcard', (playerIndex, sum, reqID) => setTimeout(() => selectCard(playerIndex, sum, reqID),2000) );
m.Events.on('peg-card-rejected', (playerIndex, reqID) => setTimeout(() => cardRejected(playerIndex, reqID),0) );
m.Events.on('peg-card-played', (playerIndex, card) => setTimeout(() => cardPlayed(playerIndex, card),0) );

m.Run();

//await WaitThenExit(5);

/*
import Deck from './src/game/deck.js';

console.log('creating deck');
const deck = new Deck(); 

deck.Shuffle(3);
const bigHand = deck.GetCards(5);

bigHand.forEach((c) => console.log(`dealt card: ${c.name} of ${c.suit}`));

const bigHand2 = deck.GetCards(40);

console.log('---> should be 7 remaining');
console.log('---shuffle');
deck.Shuffle();
deck.Dump();
console.log('---shuffle');
deck.Shuffle();
deck.Dump();
console.log('---shuffle');
deck.Shuffle();
deck.Dump();

*/
