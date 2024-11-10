import React from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import {PLAYER_COUNT, PLAYER_TILE_COUNT, TILE_COUNT} from "../utils/index.js";

import { v4 as uuidv4 } from 'uuid';
import Rocks from "../utils/tile.json";
import PlayerTiles from './PlayerTiles';
import Tile from "./Tile.jsx";
import ThrownTiles from "./ThrownTiles.jsx";
import ReceivedTiles from "./ReceivedTiles.jsx";

const setCookie = (name, value, days) => {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

class OkeyGame extends React.Component {
    constructor(props) {

        super(props);
        let session_id = getCookie('session_id');
        if (!session_id) {
            session_id = uuidv4();
            setCookie('session_id', session_id, 365);
        }




        this.state = {
            session_id:session_id,
            socket: null,
            gameId: 'game1',
            start : 0,
            players: [],
            activePlayerId:null,
            gameState: {
                    table: { tiles: [] },
                    okey: {},
                    isReady: false,
            }
        }


        this.TileSuffleRocks = this.TileSuffleRocks.bind(this);

    }



    TileSuffleRocks(){



       // console.log("herkese gönderildi",this.state.gameState?.table?.tiles?.length);

        if (this.state.gameState?.table?.tiles?.length<1){

            this.state.socket.emit('joinGame', 'game1');

            const shuffledRocks = [...Rocks.tiles];
            for (let i = shuffledRocks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledRocks[i], shuffledRocks[j]] = [shuffledRocks[j], shuffledRocks[i]];
            }

            const okeyIndex = Math.floor(Math.random() * shuffledRocks.length);

            let sokey = {};
            while (true) {
                sokey = shuffledRocks[okeyIndex];
                if (sokey.tile !== 's') {
                    break;
                }
            }

            const okeyTile = sokey;

            this.state.socket.emit('setOkey', this.state.gameId, okeyTile);

            const TableTiles = shuffledRocks.filter((_, index) => index !== okeyIndex);

            console.log("Game ID ",this.state.gameId);
            this.state.socket.emit('setTableTiles', this.state.gameId,TableTiles);
            console.log("Taşlar gönderildi :  ",TableTiles);
            //this.state.socket.emit('setTableTiles', this.state.gameId,TableTiles);
        }else{
            console.log("daha önceden iletildi.")
        }


    }


    componentDidMount() {

        const socket = io('http://localhost:4000');


        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            // State'i sıfırla
            this.setState({
                players: [],
                activePlayerId: null,
                gameState: {
                    table: { tiles: [] },
                    okey: {},
                    isReady: false,
                },
            }, () => {
                // Diğer client'lere boşaltılmış durumu ilet
               this.state.socket.emit('updateGameState', this.state.gameId, {
                    players: this.state.players,
                    gameState: this.state.gameState
                });
            });
        });


        this.setState({ socket }, () => {});
    }

    componentWillUnmount() {
        if (this.state.socket) {
            this.state.socket.disconnect();
        }
    }


    assignTilesToPlayers = () => {

        const tiles = this.state.gameState.table.tiles;
        const isReady = this.state.gameState.isReady;
        const players = this.state.players;


        if (isReady) {

            const updatedPlayers = this.state.players.map((player,k)  => {
                const playerTiles = tiles.splice(0, PLAYER_TILE_COUNT);
                //this.state.socket.emit('playerTileUpdate',this.state.gameId,k,playerTiles);
                return { ...player, tiles: playerTiles };
            });

            return updatedPlayers;

        }

    }


    startGame = () => {

        if (this.state.gameState.table.tiles.length === 0){

            this.TileSuffleRocks();
        }


        const playerExist = this.state.players.some(p => p.id === this.state.session_id);

        if (!playerExist) {

            let name = prompt('Name?');
            if (name && name.length >3 ){
                //const playerTiles = this.state.gameState.table.tiles.splice(0, PLAYER_TILE_COUNT);
                if (this.state.players.length <= 4){
                    const player = {id: this.state.session_id, name: name, thrownTiles: [], receivedTiles: []}
                    this.state.socket.emit('setPlayer', this.state.gameId, player);
                }

            }else{
                alert("Geçerli bir isim giriniz...");
            }


        }



        this.state.socket.on('gameUpdate', (data, action) => {

            this.setState((prevState) => {
                let newState = { ...prevState };

                switch (action) {

                    case 'UPDATE_JOIN':
                        newState.gameId =  data.gameId;
                        break;

                    case 'UPDATE_GAME':
                        newState.gameId =  data;
                        break;

                    case 'UPDATE_STARTS':
                        newState.gameState.isReady =  data.gameState.isReady;
                        break;

                    case 'UPDATE_TABLE_TILES':
                        newState.gameState.table.tiles = data.gameState.table.tiles;
                        break;
                    case 'UPDATE_TABLE':
                        newState.gameState.table = data.gameState.table;
                        break;

                    case 'UPDATE_OKEY':

                        newState.gameState.okey = data.gameState.okey;
                        break;

                    case 'SET_READY':
                        newState.gameState.isReady = data.gameState.isReady;
                        break;

                    case 'UPDATE_PLAYERS':
                        console.log("players action: ",data.players)
                        newState.players = data.players;
                        break;

                    case 'UPDATE_PLAYER_TILES':

                        newState.players = data.players;
                        break;

                    case 'UPDATE_ACTIVE_PLAYER_ID':
                        newState.activePlayerId = data.activePlayerId;

                        break;

                    default:

                        console.log("bulunamayan case ",action,data)
                        break;
                }

                console.log("Product",newState)
                return newState;
            }, () => {

                if (this.state.players.length===4 && !this.state.gameState.isReady){

                    this.state.socket.emit('setReady', this.state.gameId,true);
                   // this.assignTilesToPlayers()
                   // this.state.socket.emit('setPlayerTiles', this.state.gameId,);

                    const updatedPlayers = this.state.players.map((player,k)  => {
                        const playerTiles = this.state.gameState.table.tiles.splice(0, PLAYER_TILE_COUNT);
                        this.state.socket.emit('playerTileUpdate',this.state.gameId,k,playerTiles);
                    });

                    this.state.socket.emit('setTableTiles',this.state.gameId,this.state.gameState.table.tiles);
                    this.updateActivePlayer();

                }
            });
        });

    }

    updatePlayerTiles = (session_id, updatedTiles) => {

        const updatedPlayers = this.state.players.map(player => {
            if (player.id === session_id) {
                return { ...player, tiles: updatedTiles };
            }
            return player;
        });

        this.setState({ players: updatedPlayers }, () => {
            this.state.socket.emit('updateGameStateTable', this.state.gameId, this.state.gameState.table);
            this.state.socket.emit('updatedPlayers', this.state.gameId, this.state.players);
        });
    }

    updateActivePlayer = () => {

        const { players, activePlayerId } = this.state;
        const getNextPlayer = this.getNextPlayer();
        this.state.socket.emit('updateActivePlayerId', this.state.gameId, getNextPlayer.id);

    }

    updateThrownTiles = (thrownTile) =>{

        const {session_id } = this.state;

        const updatedPlayer = this.state.players.map(player => {
                if (player.id === session_id) {
                    return  player.thrownTiles.push(thrownTile)
                }

        });

        this.setState({ players: this.state.players }, () => {
            this.state.socket.emit('updateGameStateTable', this.state.gameId, this.state.gameState.table);
            this.state.socket.emit('updatedPlayers', this.state.gameId, this.state.players);
            console.log("emitler gönderildi");
        });

        this.updateActivePlayer();
    }
    updateTableTiles=(tiles) => {
        this.setState(prevState => ({
            ...prevState,
            gameState: {
                ...prevState.gameState,
                table: {
                    tiles: tiles
                }
            }
        }));
       this.state.socket.emit('updateGameStateTable', this.state.gameId, this.state.gameState.table);
    }

    getNextPlayer = () => {
        const { players, activePlayerId } = this.state;
        const currentPlayerIndex = players.findIndex(player => player.id === activePlayerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        const nextPlayer = players[nextPlayerIndex];
        return nextPlayer;
    }

    getPreviousPlayer = (id) => {
        const { players, activePlayerId } = this.state;
        const currentPlayerIndex = players.findIndex(player => player.id === activePlayerId);
        const previousPlayerIndex = (currentPlayerIndex - 1 + players.length) % players.length;
        const previousPlayer = players[previousPlayerIndex];
        return previousPlayer;
    }


    render() {

        let table_tile =  []
        const { table, isReady,okey } = this.state.gameState;
        const { players, session_id,activePlayerId } = this.state;
        const player = players.find(p => p.id === session_id);


        if (table?.tiles?.length) {
         table_tile = table.tiles[0];
        }


        // Oyun sırasına göre oyuncuları sıralama
        const activePlayer = players.find(p => p.id === activePlayerId && p.id === session_id);
        const activePlayerIndex = players.findIndex(p => p.id === session_id);


        const activePlayer_info = players.some(p => p.id === activePlayerId );

        const PlayerEnableDrag = activePlayer? true:false;
        const PlayerEnableDrop = activePlayer? true:false;


        const reorderPlayers = (players, session_id) => {
            // Active player'ı en başa alacak şekilde oyuncu sırasını yeniden düzenliyoruz
            const activePlayerIndex = players.findIndex(p => p.id === session_id);
            console.log("players : ",players)
            console.log("session_id : ",session_id)
            console.log("activePlayerIndex : ",activePlayerIndex)
            if (activePlayerIndex !== -1) {
                const reorderedPlayers = [
                    players[activePlayerIndex],
                    ...players.slice(0, activePlayerIndex),
                    ...players.slice(activePlayerIndex - 1)
                ];
                return reorderedPlayers;
            }
            return players;
        };

       // const reorderedPlayers = reorderPlayers(players, session_id);


        const playerTableOrder = {
            0: [0, 1, 2, 3],
            1: [1, 2, 3, 0],
            2: [2, 3, 0, 1],
            3: [3, 0, 1, 2]
        };


        const orderedPlayers = activePlayerIndex !== -1 ? playerTableOrder[activePlayerIndex].map(i => players[i]) : players;


        const playerThrownOrder = {
            0: 3,
            1: 0,
            2: 1,
            3: 2
        };


        const playerThrown =  players[playerThrownOrder[activePlayerIndex]]?.thrownTiles;

        const playerName = activePlayer !=null  ? activePlayer : this.getPreviousPlayer()


        return (

            <>
                <div className="container mx-auto px-4 relative border-2 border-amber-50 h-screen">
                    {PLAYER_COUNT !== players.length && player && !isReady && (
                        <div className="p-2 absolute top-0 left-0 h-8 text-sm bg-orange-500 text-white rounded-br flex items-center">
                            Oyuna başlamak için {PLAYER_COUNT - players.length} oyuncu beklenmektedir.
                        </div>
                    )}
                    {isReady && (
                        <div className="flex items-center justify-center text-center">

                            <div className="w-1/3 bg-orange-500 ">
                                {player.name}
                            </div>


                            {isReady && (
                                <>
                                    <div className="w-2/3 justify-center  bg-green-500 ">
                                        Oyuncu Sırası: {playerName.name}
                                    </div>
                                    <div className="w-2/3 justify-center  bg-blue-500 ">
                                        Sıradaki Oyuncu: {this.getNextPlayer().name}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {!isReady && !player && (
                        <div>
                            <button
                                type="button"
                                onClick={this.startGame}
                                className="flex items-center justify-center w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white rounded-full bg-red-500 text-white absolute text-lg font-bold"
                            >
                                Oyunu Başlat
                            </button>
                        </div>
                    )}


                    {isReady   && (
                        <div className="flex items-center justify-center w-48 h-48 top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-lg font-bold">
                            <>

                                <div className="flex  absolute border-2   right-36  -top-40 border-gray-300 rounded-lg">
                                    <Tile
                                        key={(okey ? okey.tile : 'empty') + '_' + (okey.tile ? okey.color : 'empty') + '_' + (100)}
                                        index={100}
                                        rock={okey}
                                        enableDrag={false}
                                        enableDrop={false}
                                        showDetails={true}
                                        okey={this.state.gameState.okey}
                                    />
                                </div>

                                <div attr-data={table_tile?.tile + '_' + table_tile?.color + '_' + 99} className="flex  absolute border-2 -top-40 border-gray-300 rounded-lg">
                                    <Tile
                                        key={table_tile?.tile + '_' + table_tile?.color + '_' + 99}
                                        index={99}
                                        rock={table_tile}
                                        enableDrag={PlayerEnableDrag}
                                        enableDrop={PlayerEnableDrag}
                                        tileCount={table?.tiles?.length}
                                        showDetails={false}
                                        okey={this.state.gameState.okey}
                                    />
                                </div>


                            </>
                        </div>


                    )}

                    {player && player.tiles && (
                        <>
                            {orderedPlayers.map((p, index) => {
                                let classes = "";
                                switch (index) {
                                    case 0: // Player 0
                                        classes = "absolute flex top-1/2 right-40";
                                        break;
                                    case 1: // Player 1
                                        classes = "absolute flex top-10 right-40";
                                        break;
                                    case 2: // Player 2
                                        classes = "absolute flex top-10 left-40";
                                        break;
                                    case 3: // Player 3
                                        classes = "absolute flex top-1/2 left-40";
                                        break;
                                    default:
                                        classes = "";
                                }

                                return (
                                    <div attr-id={index+'>'+p.id} key={p.id + '_' + index} className={classes}>
                                        <div>
                                            <ThrownTiles
                                                index={97}
                                                enableDrag = {p.tiles?.length > 14}
                                                enableDrop = {p.tiles?.length > 14}
                                                showDetails = {true}
                                                updatePlayerTiles= {this.updatePlayerTiles}
                                                updateThrownTiles = {this.updateThrownTiles}
                                                playerTile = {p.tiles}
                                                session_id = {session_id}
                                                tiles = {p.thrownTiles}
                                                okey={this.state.gameState.okey}
                                            />
                                        </div>

                                    </div>
                                );
                            })}

                            <div className="rack bg-white w-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 absolute border-2 border-gray-300 rounded-lg bottom-10">
                                <PlayerTiles
                                    tiles = {player.tiles}
                                    updatePlayerTiles = {this.updatePlayerTiles}
                                    session_id = {session_id}
                                    gameState = {this.state.gameState}
                                    table_tile = {table.tiles}
                                    thrown_tile = {playerThrown}
                                    okey={this.state.gameState.okey}
                                />
                            </div>
                        </>
                    )}

                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    players: state.game.players,

});


export default connect(mapStateToProps)(OkeyGame);
