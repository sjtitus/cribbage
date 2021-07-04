/*_________________________________________________________________________________________________
    PeggingMachine
    
    Pegging Compute Logic
        compute new sum
        lastCard = length of pile is 8 
        Score 
            sum=15: +2 
            pair(s): add points
            run: add up run points
            "Go/lastcard logic"
                sum=31: +2 
                sum<31 & go & current player can't play with current hand that's left: +1 

        if lastCard: --> End (this is only way to end)
        if (go=0) switch turn
        --> TakeTurn 
  _________________________________________________________________________________________________
*/

import { strict as assert } from 'assert';
import { Hand, CardsToString, CardCanPeg } from  './deck.js';
import {GetModuleLogger} from '../util/Logger.js';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

//const log = Logger.child({module:'Pegging'});
const log = GetModuleLogger('Pegging');

/*
log.transports[1] = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `${info.timestamp} ${info.module} ${info.level} ${info.message}`)
    ),
    level: 'error',
    handleExceptions: true
});
*/
    
//_________________________________________________________________________________________________
// PeggingData
// Data tracking pegging portion of the game 
class PeggingData {
    constructor(players) {
        this.pile = [],
        this.sum = 0,
        this.stackIndex = 0,
        this.turn = (players[0].dealer) ? 1:0,
        this.timerID = null,
        this.cardRequestID = null,
        this.timeoutMillis = 5000,
        this.playerData = [
            { index: 0, player: players[0], hand: new Hand(players[0].hand), points: 0, timeouts: 0, canplay: true }, 
            { index: 1, player: players[1], hand: new Hand(players[1].hand), points: 0, timeouts: 0, canplay: true }, 
        ] 
    }
}

export class PeggingMachine {
    
    constructor(players) {
        assert(Array.isArray(players) && players.length === 2);
        log.debug(`Initializing pegging data`); 
        this._peggingData = new PeggingData(players);
        // state machine
        this._currentState = null, 
        this._previousState = null,
        this._transitions = {
            START: {
                ENTER: this._Start.bind(this),
                PROCEED: function() { return 'REQUESTCARD'; } 
            },
            REQUESTCARD: {
                ENTER: this._RequestCard.bind(this),
                GOTCARD: this._GotCard.bind(this),
            },
            END: {
                ENTER: this._End.bind(this)
            },
        },
        // events 
        this._eventEmitter = new EventEmitter(); 
    }

    get Events() {
        return this._eventEmitter;
    }

    get _CurrentPlayerData() {
        return this._peggingData.playerData[this._peggingData.turn];
    }
    
    get _OtherPlayerData() {
        return this._peggingData.playerData[1-this._peggingData.turn];
    }
    
    //_________________________________________________________________________
    // Run: begin pegging by moving to START state 
    Run() {
        assert(this._currentState === null);
        this._changeState('START');
    }
  
    //_________________________________________________________________________
    // State: Start
    // Emit event signaling start of pegging (and whose turn it is) 
    _Start() {
        const playerData = this._CurrentPlayerData;
        log.debug(`PeggingMachine [${this._currentState}]: starting pegging`); 
        this._emit('peg-start', playerData.index);
    }

    //_________________________________________________________________________
    // State: RequestCard
    // Request a card from the current player. Set a timeout so that if the
    // player takes too long, a card is automatically played.
    // Note: this state will never be entered unless the requested player can play 
    _RequestCard() {
        const playerData = this._CurrentPlayerData;
        assert(playerData.player.hand.CanPeg(this._peggingData.sum));
        const reqID = uuidv4().substring(0,8);
        this._peggingData.cardRequestID = reqID; 
        log.debug(`PeggingMachine [${this._currentState}]: ${playerData.index}: ${playerData.player.name}: request card (req ${reqID})`);
        //this._setPlayerTimeout(playerData.index, reqID);
        this._emit('peg-requestcard', playerData.index, this._peggingData.sum, reqID);
    }

    //_________________________________________________________________________
    // Transition: GotCard
    // On receiving a card: play the card, score, then transition to the 
    // appropriate state based on the outcome (end, request another card, etc.) 
    _GotCard(playerIndex, reqID, card, auto) {
        
        assert(Array.isArray(card) && card.length===1);
        assert(this._currentState === 'REQUESTCARD');
        const currentPlayerData = this._peggingData.playerData[playerIndex];
        const cardStr = CardsToString(card);
        log.debug(`PeggingMachine [${this._currentState}]: card ${cardStr} (player ${playerIndex}, req=${reqID}, auto=${auto})`); 
    
        // card is not valid: wait for a valid card 
        if (!this._validateCard(playerIndex, currentPlayerData, reqID, card, cardStr)) { 
            return 'REQUESTCARD';
        }

        // valid card: cancel pending timeout 
        this._clearPlayerTimeout(auto);
        
        // current request has been handled
        log.debug(`PeggingMachine [${this._currentState}]: card ${cardStr} valid, clearing request`); 
        this._peggingData.cardRequestID = null;
        
        // officially remove the card from the player's hand and put it into the pile
        log.debug(`PeggingMachine [${this._currentState}]: moving card ${cardStr} from player to pile`); 
        const pulledCard = currentPlayerData.hand.Remove(card);
        assert(pulledCard !== null);
        this._peggingData.pile.push(card[0]);
        this._emit('peg-card-played', currentPlayerData.index, card); 

        // add the card to the pile
        log.debug(`PeggingMachine [${this._currentState}]: ---------- Score`); 
        const nextState = this._Score(card, cardStr);

        return nextState; 
    }


    _Score(card, cardStr) {

        const currentData = this._CurrentPlayerData;
        const otherData = this._OtherPlayerData;

        let nextState = null;

        log.debug(`PeggingMachine [${this._currentState}]: Score: player ${currentData.index} scoring with card ${cardStr}`);
        log.debug(`PeggingMachine [${this._currentState}]: Score: pile depth = ${this._peggingData.pile.length}`);
       
        // get the stack to score with
        const stack = this._peggingData.pile.slice(this._peggingData.stackIndex);

        // add to sum
        this._peggingData.sum += card[0].value;
        assert(this._peggingData.sum <= 31);
        log.debug(`PeggingMachine [${this._currentState}]: Score: stack = ${CardsToString(stack)} (sum=${this._peggingData.sum})`);
       
        // conditions determining next state
        const nextStateConditions = {
            peggingDone: (this._peggingData.pile.length == 8),
            currentHasCards: (currentData.hand.Length > 0),
            otherHasCards: (otherData.hand.Length > 0),
            currentCanPeg: (currentData.hand.CanPeg(this._peggingData.sum)),
            otherCanPeg: (otherData.hand.CanPeg(this._peggingData.sum))
        } 
       
        // Scoring
        // score 15
        if (this._peggingData.sum === 15) {
            log.debug(`PeggingMachine [${this._currentState}]: Score: == SCORE 15 ==`); 
            currentData.points += 2;
        }
        if (this._peggingData.sum === 31) {
            log.debug(`PeggingMachine [${this._currentState}]: Score: == SCORE 31 ==`); 
            currentData.points += 2;
        }
        if (this._peggingData.sum < 31 && !nextStateConditions.otherCanPeg && !nextStateConditions.currentCanPeg) {
            log.debug(`PeggingMachine [${this._currentState}]: Score: == SCORE GO/LASTCARD ==`); 
            currentData.points += 1;
        }
        log.debug(`PeggingMachine [${this._currentState}]: Score: sum=${this._peggingData.sum}, P0=${this._peggingData.playerData[0].points}, P1=${this._peggingData.playerData[1].points}`);

        // determine next state
        log.debug(`PeggingMachine [${this._currentState}]: ---------- ComputeNext`); 
        nextState = this._computePostScoreState(nextStateConditions); 
        return nextState;
    }


    _computePostScoreState(cond) {
        
        const otherData = this._OtherPlayerData;

        log.debug(`PeggingMachine [${this._currentState}]: Score: pegging state: done=${cond.peggingDone}`);
        log.debug(`PeggingMachine [${this._currentState}]:    current: (cards=${cond.currentHasCards} , peg=${cond.currentCanPeg})`);
        log.debug(`PeggingMachine [${this._currentState}]:      other: (cards=${cond.otherHasCards} , peg=${cond.otherCanPeg})`);
        let nextState = null;

        // no more cards, pegging done 
        if (cond.peggingDone) {
            log.debug(`PeggingMachine [${this._currentState}]: Score: pegging done (out of cards!)`); 
            assert(!cond.currentHasCards);
            assert(!cond.otherHasCards);
            assert(!cond.currentCanPeg);
            assert(!cond.otherCanPeg);
            this._emit('peg-end');
            nextState = 'END'; 
        }
        // if the other player can peg, we will pass the turn to him
        else if (cond.otherCanPeg) {
            log.debug(`PeggingMachine [${this._currentState}]: Score: other can peg, switching turns`); 
            this._peggingData.turn = 1-this._peggingData.turn;
            this._RequestCard();  
            nextState = 'REQUESTCARD'; 
        }  
        // other person can't peg 
        else {
            // if current player can peg, then it's a GO situation
            if (cond.currentCanPeg) {
                log.debug(`PeggingMachine [${this._currentState}]: Score: other no peg, current can: go`);
                // go just means we don't switch turns
                // But we should send out a "GO" event to the other player
                this._emit('peg-go', otherData.index); 
                this._RequestCard();  
                nextState = 'REQUESTCARD'; 
            }
            // nobody can peg 
            else {
                // If other player has cards, we switch turns and reset
                if (cond.otherHasCards) {
                    log.debug(`PeggingMachine [${this._currentState}]: Score: nobody can peg, other has cards: switch-reset`);
                    this._peggingData.turn = 1-this._peggingData.turn;
                    this._peggingData.stackIndex = this._peggingData.pile.length; 
                    this._peggingData.sum = 0; 
                    this._RequestCard();  
                    nextState = 'REQUESTCARD'; 
                }
                // We're the only one with cards: reset and don't switch 
                else {
                    assert(cond.currentHasCards);
                    log.debug(`PeggingMachine [${this._currentState}]: Score: nobody can peg, only current has cards: reset`);
                    this._peggingData.stackIndex = this._peggingData.pile.length; 
                    this._peggingData.sum = 0; 
                    this._RequestCard();  
                    nextState = 'REQUESTCARD'; 
                }
            } 
        }
        return nextState;
    }



    _AutoSelectCard(playerIndex, reqID) {
        log.debug(`PeggingMachine [${this._currentState}]: player ${playerIndex} timed out, auto-playing (req=${reqID})`);
        const playerData = this._peggingData.playerData[playerIndex];
        const card = playerData.hand.GetCards(1,false); 
        log.debug(`PeggingMachine [${this._currentState}]: playing auto card ${CardsToString(card)}`);
        this._dispatch('GOTCARD', playerIndex, reqID, card, true);
    }



    _End() {
    }
   
    //__________________________________________________________________________
    // dispatch 
    // trigger state machine action/transition for the current state
    _dispatch(action, ...payload) {
        log.debug(`PeggingMachine [${this._currentState}]: dispatch action ${action}`);
        const curState = this._currentState;
        const transitions = this._transitions[this._currentState];      // get valid actions for the state
        const actionFunc = transitions[action];
        if (actionFunc) {
            const nextState = actionFunc.apply(this, payload); 
            assert(this._currentState === curState);    // actions can't change state, they only compute next state
            log.debug(`PeggingMachine [${this._currentState}]: dispatch action ${action}: complete (next state: ${nextState})`);
            this._changeState(nextState);
        }
        else {
           log.warning(`PeggingMachine [${this._currentState}]: action ${action} not valid for state, ignoring`);
        }
    }
    
    _changeState(newState) {
        log.debug(`PeggingMachine [${this._currentState}]: transition ${this._currentState} --> ${newState}`);
        const changed = (this._currentState !== newState);
        // run exit action for current state 
        if (changed) {
            this._runTransitionAction('exit');
        }
        // change state 
        this._previousState = this._currentState;
        this._currentState = newState;
        // enter action for new state
        if (changed) {
            log.debug(`PeggingMachine: _____________________________________________________`);
            this._runTransitionAction('enter');
        }
    }
    
    // run a state transition action (enter/exit)
    _runTransitionAction(transType) { 
        const curState = this._currentState;
        const action = (transType === 'exit') ?
            this._transitions[this._currentState] ? this._transitions[this._currentState]['EXIT']:null:
            this._transitions[this._currentState] ? this._transitions[this._currentState]['ENTER']:null;
        if (action) {
            log.debug(`PeggingMachine [${this._currentState}]: running ${transType} ACTION for state ${this._currentState}`);
            action.apply(this);
            assert(this._currentState === curState);    // transition actions better not change state
            log.debug(`PeggingMachine [${this._currentState}]: ${transType} ACTION for state ${this._currentState} complete`);
            if (transType === 'enter') {
                log.debug(`PeggingMachine [${this._currentState}]: -----`); 
            }
        }
    }
    
    _Compute(card) {
        //log.debug(`PeggingMachine [${this._currentState}]: computing ${activePlayer.name} playing card ${card}`);
    } 

    _emit(event, ...payload) {
        log.debug(`PeggingMachine [${this._currentState}]: emit event ${event} (payload=${payload})`);
        const hadListeners = this._eventEmitter.emit(event, ...payload);
        log.debug(`PeggingMachine [${this._currentState}]: emit ${event} done (heard=${hadListeners})`);
    }



    // UTILITIES

    _setPlayerTimeout(playerIndex, reqID) {
        assert(this._peggingData.timerID === null); // no timeout can be pending
        const ms = this._peggingData.timeoutMillis; 
        log.debug(`PeggingMachine [${this._currentState}]: setting timeout (${ms} ms) for player ${playerIndex}`);
        this._peggingData.timerID =  setTimeout(() => this._AutoSelectCard(playerIndex, reqID), ms); 
        log.debug(`PeggingMachine [${this._currentState}]: timeout timer ID = ${this._peggingData.timerID}`); 
    }
    
    _clearPlayerTimeout(auto) {
        if (this._peggingData.timerID !== null) {
            log.debug(`PeggingMachine [${this._currentState}]: canceling autoplay timer ${this._peggingData.timerID}`);
            if (!auto) {
                // if this came from person, need to cancel the active timer
                clearTimeout(this._peggingData.timerID);
            } 
            this._peggingData.timerID = null;
        }
    }

    _validateCard(playerIndex, currentPlayerData, reqID, card, cardStr) {
        // confirm it's this player's turn 
        if (playerIndex !== currentPlayerData.index) {
            log.error(`PeggingMachine [${this._currentState}]: card submitted by wrong player ${playerIndex}, ignoring`);
            return false;
        } 
        // reject the card if it's unexpected (e.g. a timeout race condition) 
        if (reqID !== this._peggingData.cardRequestID) {
            log.warn(`PeggingMachine [${this._currentState}]: unexpected card (replay?), discarding`); 
            this._emit('peg-card-rejected', playerIndex, reqID, 'replay');
            return false; 
        }
        // validate the card is actually in the player's hand
        if (currentPlayerData.hand.Contains(card) < 0) {
            log.error(`PeggingMachine [${this._currentState}]: card ${cardStr} is not in ${playerIndex}'s hand!, ignoring`);
            return false;
        }
        // validate that the card can be legally pegged
        if (!CardCanPeg(card, this._peggingData.sum)) {
            log.warn(`PeggingMachine [${this._currentState}]: card ${cardStr} can not peg against sum ${this._peggingData.sum}`); 
            this._emit('peg-card-rejected', playerIndex, reqID, 'replay');
            return false; 
        }
        return true;
    }

}

