import { PeggingMachine } from './src/game/PeggingMachine.js';
import { Deck, Hand, CardsToString } from './src/game/deck.js';
import { strict as assert } from 'assert';
import { WaitThenExit } from './src/util/ProcessUtils.js';

import {GetModuleLogger} from './src/util/Logger.js';
const log = GetModuleLogger('main');


/*
const h = new Hand( [ 
    { order: 10, value: 10, name: '10', suit: 'C', color: 'B' },
    { order: 2,  value: 2,  name: '2',  suit: 'C', color: 'B' },
]);
const c = h.GetValidCard(29);
h.Remove(c);
log.info(h.String());
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

log.info(`=====`);
log.info(`player 0: dealer: ${players[0].dealer}, hand: ${players[0].originalHand}`);
log.info(`player 1: dealer: ${players[1].dealer}, hand: ${players[1].originalHand}`);
log.info(`=====`);

const m = new PeggingMachine(players);
let timerID = null;
let timerReqID = null;

// Respond to server request for a card 
function selectCard(playerIndex, sum, reqID) {
    log.info(`=====`);
    const p = players[playerIndex];
    let card = p.hand.GetValidCard(sum);
    log.info(`  Player ${playerIndex}: human card selected: ${CardsToString(card)} (req=${reqID})`);
    log.info(`=====`);
    timerID = setTimeout(() => m._dispatch('GOTCARD', playerIndex, reqID, card, false), 4000);
    timerReqID = reqID;
}

// Card accepted on server side 
function cardPlayed(playerIndex, card, reqID, auto) {
    const p = players[playerIndex];
    if (auto && timerID !== null && reqID === timerReqID) {
        clearTimeout(timerID);
    }
    p.hand.Remove(card); 
    log.info(`=====`);
    log.info(`Player ${playerIndex}: card removed/played, ${CardsToString(card)}`);
    log.info(`         P0 hand: ${players[0].hand.String()}`);
    log.info(`         P1 hand: ${players[1].hand.String()}`);
    log.info(`            Pile: ${CardsToString(m._peggingData.pile)}`);
    log.info(`     pegging sum: ${m._peggingData.sum}`);
    log.info(`   pegging score: P0=${m._peggingData.playerData[0].points}, P1=${m._peggingData.playerData[1].points}`);
    log.info(`=====`);
    log.info(``);
}

// Card rejected on server side 
function cardRejected(playerIndex, reqID) {
    log.info(`=====`);
    log.info(`Player ${playerIndex}: card rejected (req=${reqID})`);
    log.info(`=====`);
}

// Respond to pegging machine events
m.Events.on('peg-ready', () => setImmediate(() => m._dispatch('BEGIN')) );
m.Events.on('peg-card-requested', (playerIndex, sum, reqID) => setTimeout(() => selectCard(playerIndex, sum, reqID),0) );
m.Events.on('peg-card-rejected', (playerIndex, reqID) => setTimeout(() => cardRejected(playerIndex, reqID),0) );
m.Events.on('peg-card-played', (playerIndex, card, reqID, auto) => setTimeout(() => cardPlayed(playerIndex, card, reqID, auto),0) );

m.Run();

//await WaitThenExit(5);

/*
import Deck from './src/game/deck.js';

log.info('creating deck');
const deck = new Deck(); 

deck.Shuffle(3);
const bigHand = deck.GetCards(5);

bigHand.forEach((c) => log.info(`dealt card: ${c.name} of ${c.suit}`));

const bigHand2 = deck.GetCards(40);

log.info('---> should be 7 remaining');
log.info('---shuffle');
deck.Shuffle();
deck.Dump();
log.info('---shuffle');
deck.Shuffle();
deck.Dump();
log.info('---shuffle');
deck.Shuffle();
deck.Dump();

*/
