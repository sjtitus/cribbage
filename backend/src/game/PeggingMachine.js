/*_________________________________________________________________________________________________
    PeggingMachine
    Pegging state machine logic   
  _________________________________________________________________________________________________
*/

import { strict as assert } from 'assert';
import { Hand, CardsToString, CardCanPeg } from  './deck.js';
import {GetModuleLogger} from '../util/Logger.js';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

//const log = Logger.child({module:'Pegging'});
const log = GetModuleLogger('Pegging');

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
        this.timeoutMillis = 2000,
        this.playerData = [
            { index: 0, player: players[0], hand: new Hand(players[0].hand), points: 0, timeouts: 0 },
            { index: 1, player: players[1], hand: new Hand(players[1].hand), points: 0, timeouts: 0 }
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
        this._transitions = this._stateTransitions(); 
        // events 
        this._eventEmitter = new EventEmitter(); 
    }

    // state machine states/transitions
    _stateTransitions() {
        return {
            START: {
                ENTER: this._Start.bind(this),
                BEGIN: function() { return 'REQUESTCARD'; } 
            },
            REQUESTCARD: {
                ENTER: this._RequestCard.bind(this),
                GOTCARD: this._GotCard.bind(this),
            },
            SCORE: {
                ENTER: this._Score.bind(this),
                POSTSCORETRANSITION: this._computePostScoreState.bind(this),   
            },
            END: {
                ENTER: this._End.bind(this)
            },
        }
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
    _Start() {
        const playerData = this._CurrentPlayerData;
        log.info(`PeggingMachine [${this._currentState}]: signaling ready to start`);
        this._emit('peg-ready', playerData.index);
    }

    //_________________________________________________________________________
    // State: RequestCard
    // Request a card from the current player. Set a timeout so that if the
    // player takes too long, a card is automatically played.
    // Note: this state will never be entered unless the requested player can play 
    _RequestCard() {
        assert(this._peggingData.cardRequestID === null);   // no outstanding requests
        const playerData = this._CurrentPlayerData;
        assert(playerData.player.hand.CanPeg(this._peggingData.sum));
        const reqID = uuidv4().substring(0,8);  // unique ID for card request
        this._peggingData.cardRequestID = reqID; 
        log.info(`PeggingMachine [${this._currentState}]: REQUEST CARD from ${playerData.index} (req ${reqID})`);
        this._setPlayerTimeout(playerData.index, reqID);
        this._emit('peg-card-requested', playerData.index, this._peggingData.sum, reqID);
    }

    //_________________________________________________________________________
    // Transition: GotCard
    // When we get a card: validate it, move it from hand to pile, then
    // transition to scoring.  
    _GotCard(playerIndex, reqID, card, auto) {
        
        assert(Array.isArray(card) && card.length===1);
        assert(this._currentState === 'REQUESTCARD');

        const cardStr = CardsToString(card);
        log.info(`PeggingMachine [${this._currentState}]: GOT CARD ${cardStr} (player ${playerIndex}, req=${reqID}, auto=${auto})`); 
        
        // NOTE: current player may NOT be who submitted the card
        const currentPlayerData = this._CurrentPlayerData;
        log.debug(`PeggingMachine [${this._currentState}]: current request (player ${currentPlayerData.index}, req=${this._peggingData.cardRequestID})`);
        
        // if card is not valid, keep waiting 
        if (!this._validateCard(playerIndex, currentPlayerData, reqID, card, cardStr)) { 
            return 'REQUESTCARD';
        }

        // valid card
        // clear any timeout and the pending request 
        this._clearPlayerTimeout(auto);
        log.debug(`PeggingMachine [${this._currentState}]: card ${cardStr} valid, clearing request`); 
        this._peggingData.cardRequestID = null;
        
        // move the card from the player's hand to the pile 
        log.debug(`PeggingMachine [${this._currentState}]: moving card ${cardStr} from player to pile`); 
        const pulledCard = currentPlayerData.hand.Remove(card);
        assert(pulledCard !== null);
        this._peggingData.pile.push(card[0]);
        
        // signal the card was successfully played
        // next state is scoring 
        this._emit('peg-card-played', currentPlayerData.index, card, reqID, auto); 
        return 'SCORE';
    }


    //_________________________________________________________________________
    // State: Score 
    // Score the card just played on the top of the pile.
    _Score() {

        const card = this._peggingData.pile.slice(-1);
        const cardStr = CardsToString(card);
        const currentData = this._CurrentPlayerData;
        const otherData = this._OtherPlayerData;

        log.info(`PeggingMachine [${this._currentState}]: Score: player ${currentData.index} scoring with card ${cardStr}`);
        log.debug(`PeggingMachine [${this._currentState}]: Score: pile depth = ${this._peggingData.pile.length}`);
       
        // add to sum and determin the "stack" within the pile we're using to score
        this._peggingData.sum += card[0].value;
        assert(this._peggingData.sum <= 31);
        const stack = this._peggingData.pile.slice(this._peggingData.stackIndex);
        log.debug(`PeggingMachine [${this._currentState}]: Score: stack = ${CardsToString(stack)} (sum=${this._peggingData.sum})`);
       
        const currentCanPeg = (currentData.hand.CanPeg(this._peggingData.sum));
        const otherCanPeg = (otherData.hand.CanPeg(this._peggingData.sum));
       
        // Scoring
        // score 15
        if (this._peggingData.sum === 15) {
            log.info(`PeggingMachine [${this._currentState}]: Score: == SCORE 15 ==`); 
            currentData.points += 2;
        }
        // score 31
        if (this._peggingData.sum === 31) {
            log.info(`PeggingMachine [${this._currentState}]: Score: == SCORE 31 ==`); 
            currentData.points += 2;
        }
        // score go/lastCard
        if (this._peggingData.sum < 31 && !otherCanPeg && !currentCanPeg) {
            log.info(`PeggingMachine [${this._currentState}]: Score: == SCORE GO/LASTCARD ==`); 
            currentData.points += 1;
        }
        log.info(`PeggingMachine [${this._currentState}]: Score: sum=${this._peggingData.sum}, P0=${this._peggingData.playerData[0].points}, P1=${this._peggingData.playerData[1].points}`);

        // Score is a transient state: once the scoring is done,
        // execute an action to make the post-scoring transition 
        return { action: 'POSTSCORETRANSITION', payload: [] }; 
    }


    //_________________________________________________________________________
    // Transition: ComputePostScoreState 
    // Determine 
    _computePostScoreState() {
        // conditions determining next state
        // based on the current sum
        const currentData = this._CurrentPlayerData;
        const otherData = this._OtherPlayerData;
        
        const cond = {
            peggingDone:        (this._peggingData.pile.length == 8),
            currentHasCards:    (currentData.hand.Length > 0),
            otherHasCards:      (otherData.hand.Length > 0),
            currentCanPeg:      (currentData.hand.CanPeg(this._peggingData.sum)),
            otherCanPeg:        (otherData.hand.CanPeg(this._peggingData.sum))
        } 

        log.debug(`PeggingMachine [${this._currentState}]: Score: pegging state: done=${cond.peggingDone}`);
        log.debug(`PeggingMachine [${this._currentState}]:    current: (cards=${cond.currentHasCards} , peg=${cond.currentCanPeg})`);
        log.debug(`PeggingMachine [${this._currentState}]:      other: (cards=${cond.otherHasCards} , peg=${cond.otherCanPeg})`);
        let nextState = null;

        // no more cards, pegging done 
        if (cond.peggingDone) {
            log.info(`PeggingMachine [${this._currentState}]: Score: pegging done (out of cards!)`); 
            assert(!cond.currentHasCards);
            assert(!cond.otherHasCards);
            assert(!cond.currentCanPeg);
            assert(!cond.otherCanPeg);
            this._emit('peg-end');
            nextState = 'END'; 
        }
        // if the other player can peg, we will pass the turn to him
        else if (cond.otherCanPeg) {
            log.info(`PeggingMachine [${this._currentState}]: Score: other can peg, switching turns`); 
            this._peggingData.turn = 1-this._peggingData.turn;
            nextState = 'REQUESTCARD'; 
        }  
        // other person can't peg 
        else {
            // if current player can peg, then it's a GO situation
            if (cond.currentCanPeg) {
                log.info(`PeggingMachine [${this._currentState}]: Score: other no peg, current can: go`);
                // go just means we don't switch turns
                // But we should send out a "GO" event to the other player
                this._emit('peg-go', otherData.index); 
                nextState = 'REQUESTCARD'; 
            }
            // nobody can peg 
            else {
                // If other player has cards, we switch turns and reset
                if (cond.otherHasCards) {
                    log.info(`PeggingMachine [${this._currentState}]: Score: nobody can peg, other has cards: switch-reset`);
                    this._peggingData.turn = 1-this._peggingData.turn;
                    this._peggingData.stackIndex = this._peggingData.pile.length; 
                    this._peggingData.sum = 0; 
                    nextState = 'REQUESTCARD'; 
                }
                // We're the only one with cards: reset and don't switch 
                else {
                    assert(cond.currentHasCards);
                    log.info(`PeggingMachine [${this._currentState}]: Score: nobody can peg, only current has cards: reset`);
                    this._peggingData.stackIndex = this._peggingData.pile.length; 
                    this._peggingData.sum = 0; 
                    nextState = 'REQUESTCARD'; 
                }
            } 
        }
        assert(nextState !== null);
        return nextState;
    }


    // Autoselect a card from a player's hand to fulfill request for a card  
    _AutoSelectCard(playerIndex, sum, reqID) {
        log.info(`PeggingMachine [${this._currentState}]: AUTO: player ${playerIndex} timed out, auto-playing (req=${reqID})`);
        const playerData = this._peggingData.playerData[playerIndex];
        log.info(`PeggingMachine [${this._currentState}]: AUTO: player ${playerIndex} hand: ${playerData.hand.String()}`);
        const card = playerData.hand.GetValidCard(sum);
        log.info(`PeggingMachine [${this._currentState}]: AUTO: playing auto card ${CardsToString(card)}`);
        this._dispatch('GOTCARD', playerIndex, reqID, card, true);
    }

    _End() {
        log.info(`PeggingMachine [${this._currentState}]: END of pegging`); 
    }
   
    //__________________________________________________________________________
    // dispatch 
    // trigger state machine action/transition for the current state
    _dispatch(action, ...payload) {
        while (action) {
            log.info(`PeggingMachine [${this._currentState}]: dispatch action ${action}`);
            const curState = this._currentState;
            const transitions = this._transitions[this._currentState];      // get valid actions for the state
            const actionFunc = transitions[action];
            let postTransitionAction = null;
            // run the specified action
            if (actionFunc) {
                const nextState = actionFunc.apply(this, payload); 
                assert(this._currentState === curState);    // actions can't change state, they only compute next state
                log.debug(`PeggingMachine [${this._currentState}]: dispatch action ${action}: complete (next state: ${nextState})`);
                postTransitionAction = this._changeState(nextState);
            }
            else {
                log.warn(`PeggingMachine [${this._currentState}]: action ${action} not valid for state, ignoring`);
            }
            if (postTransitionAction) {
                action = postTransitionAction.action;
                payload = postTransitionAction.payload;
                log.info(`PeggingMachine [${this._currentState}]: post-transition action present: ${action}`); 
            }
            else {
                action = null;
            }
        }
    }
   
    // Change state
    // Executes 'exit' and 'enter' actions for old/new states, and an optional action to automatically
    // execute post-transition (enables 'transient' states with auto-transition based on state-entry logic ).
    _changeState(newState) {
        log.info(`PeggingMachine [${this._currentState}]: transition ${this._currentState} --> ${newState}`);
        let postTransitionAction = null; 
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
            log.info(`PeggingMachine: _____________________________________________________`);
            postTransitionAction = this._runTransitionAction('enter');
        }
        return postTransitionAction;
    }
    
    // run a state transition action (enter/exit)
    _runTransitionAction(transType) { 
        let postTransitionAction = null; 
        const curState = this._currentState;
        const action = (transType === 'exit') ?
            this._transitions[this._currentState] ? this._transitions[this._currentState]['EXIT']:null:
            this._transitions[this._currentState] ? this._transitions[this._currentState]['ENTER']:null;
        if (action) {
            log.debug(`PeggingMachine [${this._currentState}]: running ${transType} ACTION for state ${this._currentState}`);
            postTransitionAction = action.apply(this);
            assert(this._currentState === curState);    // transition actions better not change state
            log.debug(`PeggingMachine [${this._currentState}]: ${transType} ACTION for state ${this._currentState} complete`);
            if (transType === 'enter') {
                log.debug(`PeggingMachine [${this._currentState}]: -----`); 
            }
        }
        return postTransitionAction;
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
        this._peggingData.timerID =  setTimeout(() => this._AutoSelectCard(playerIndex, this._peggingData.sum, reqID), ms); 
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
        
        if (reqID !== this._peggingData.cardRequestID) {
            log.warn(`PeggingMachine [${this._currentState}]: stale card, rejecting`); 
            this._emit('peg-card-rejected', playerIndex, reqID, 'stale card');
            return false; 
        }

        // confirm it's this player's turn 
        if (playerIndex !== currentPlayerData.index) {
            log.error(`PeggingMachine [${this._currentState}]: not player ${playerIndex} turn, rejecting`);
            this._emit('peg-card-rejected', playerIndex, reqID, `not your turn`);
            return false;
        }

        // validate the card is actually in the player's hand
        if (currentPlayerData.hand.Contains(card) < 0) {
            log.error(`PeggingMachine [${this._currentState}]: card ${cardStr} not in player hand, rejecting`);
            this._emit('peg-card-rejected', playerIndex, reqID, `card ${cardStr} not in player hand`);
            return false;
        }
        // validate that the card can be legally pegged
        if (!CardCanPeg(card, this._peggingData.sum)) {
            log.error(`PeggingMachine [${this._currentState}]: card ${cardStr} can not peg against sum ${this._peggingData.sum}, rejecting`); 
            this._emit('peg-card-rejected', playerIndex, reqID, `card ${cardStr} cannot be pegged against ${this._peggingData.sum}`);
            return false; 
        }
        return true;
    }

}

