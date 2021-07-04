




/*_________________________________________________________________________________________________
    GameLogic
    State machine logic for overall cribbage game flow. 
    
    Game Stages (players present):
        0. Draw for deal
            signal (card choice) from each user
            lower card wins, repeat if necessary
            transition: someone wins, dealer determined
        Round Stages
        1. Shuffle + Deal
            Shuffle deck and deal cards
            transition: hands are distributed
        2. Make Crib 
            players each pick two cards
            transition: signal received from both players
        3. Flip 
            added to each hand
            Dealer 2 point on turned nobs 
        5. Pegging (diff control?) 
            Non-dealer starts pegging
            ... pegging ...
            transition: all cards are gone
        6. Counting 
            non-dealer
            dealer hand
            dealer crib
  _________________________________________________________________________________________________
*/

 /*________________________________________________________________________________________________
    Game State
    Data representation of a cribbage game
       
      Global
        Players
        Current Score
        Final Score
        Winner 
        Round

      Per-Round 
        Dealer
        Deck
        Hands
        Starter
        Stage: Shuffle, Deal, MakeCrib, Turn, Peg, Count
        PeggingState
        Crib
        Hand Points
        Crib Points
       
     Pegging State
        Pile[N]
        Hands
        Computed
            Points By Card[2xN]
            Point reason [1xN]
            ActivePlayer 
            CurrentTotal

  _________________________________________________________________________________________________
*/