import { SET_PLAYER, START_GAME } from '../actions';

const initialState = {

    game: {
        isReady: false,
        table: {}
    },
    players: {}
};
const gameReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_PLAYER:
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.payload.id]: action.payload
                }
            };
        case START_GAME:
            return {
                ...state,
                game: {
                    ...state.game,
                    isReady: true
                }
            };
        default:
            return state;
    }
};

export default gameReducer;
