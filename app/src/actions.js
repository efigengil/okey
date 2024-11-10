// actions.js
export const SET_PLAYER = 'SET_PLAYER';
export const START_GAME = 'START_GAME';

export const setPlayer = (player) => ({
    type: SET_PLAYER,
    payload: player
});

export const startGame = () => ({
    type: START_GAME
});
