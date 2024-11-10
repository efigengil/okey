import React from 'react';
import { connect } from 'react-redux';
import {PLAYER_COUNT, PLAYER_TILE_COUNT} from "../utils/index.js";
import Rocks from "../utils/tile.json";
import PlayerTiles from './PlayerTiles';
import Tile from "./Tile.jsx";
import ThrownTiles from "./ThrownTiles.jsx";
import ReceivedTiles from "./ReceivedTiles.jsx";

// Mock veriler (Elle oluşturulmuş)
const mockPlayers = [
    { id: 'player1', name: "Emre", tiles: Rocks.tiles.slice(0, 14), thrownTiles: [], receivedTiles: [] },
    { id: 'player2', name: "Ali", tiles: Rocks.tiles.slice(14, 28), thrownTiles: [], receivedTiles: [] },
    { id: 'player3', name: "Ayşe", tiles: Rocks.tiles.slice(28, 42), thrownTiles: [], receivedTiles: [] },
    { id: 'player4', name: "Veli", tiles: Rocks.tiles.slice(42, 56), thrownTiles: [], receivedTiles: [] },
];

// Elle yönetilebilecek oyun durumu
const initialGameState = {
    table: { tiles: Rocks.tiles.slice(56) }, // Tahtadaki taşlar (geri kalan)
    okey: Rocks.tiles[55], // Rastgele bir taş Okey olarak ayarlandı
    isReady: true, // Oyun başlatıldı olarak ayarlandı
};

class OkeyGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            session_id: 'player1', // Varsayılan olarak 'player1' girildi
            players: mockPlayers, // Mock oyuncu verileri
            activePlayerId: 'player4', // İlk oyuncu aktif
            gameState: initialGameState, // Mock oyun durumu
        };

        this.TileSuffleRocks = this.TileSuffleRocks.bind(this);
    }

    // Tile Suffle ve Socket işlemleri şimdilik devre dışı
    TileSuffleRocks() {
        console.log("Taşlar karıştırıldı (simule edildi)");
    }

    // Oyuncu taşlarını güncellemek için bir mock fonksiyon
    updatePlayerTiles = (session_id, updatedTiles) => {
        const updatedPlayers = this.state.players.map(player => {
            if (player.id === session_id) {
                return { ...player, tiles: updatedTiles };
            }
            return player;
        });

        this.setState({ players: updatedPlayers });
    }

    updateActivePlayer = () => {
        const { players, activePlayerId } = this.state;
        const getNextPlayer = this.getNextPlayer();
        this.setState({ activePlayerId: getNextPlayer.id });
    }

    getNextPlayer = () => {
        const { players, activePlayerId } = this.state;
        const currentPlayerIndex = players.findIndex(player => player.id === activePlayerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        return players[nextPlayerIndex];
    }

    render() {
        const { table, isReady, okey } = this.state.gameState;
        const { players, session_id, activePlayerId } = this.state;
        const player = players.find(p => p.id === session_id);

        const activePlayerIndex = players.findIndex(p => p.id === session_id);



        const activePlayer = players.find(p => p.id === activePlayerId);
        const PlayerEnableDrag = activePlayer ? true : false;


        const playerTable = {
            0: [0, 1, 2, 3],
            1: [1, 2, 3, 0],
            2: [2, 3, 0, 1],
            3: [3, 0, 1, 2]
        };


        const orderedPlayers = activePlayerIndex !== -1 ? playerTable[activePlayerIndex].map(i => players[i]) : players;


        // const reorderedPlayers = reorderPlayers(players,session_id);


        return (
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


                        {activePlayer && (
                            <>
                                <div className="w-2/3 justify-center  bg-green-500 ">
                                    Oyuncu Sırası: {activePlayer.name}
                                </div>
                                <div className="w-2/3 justify-center  bg-blue-500 ">
                                    Sıradaki Oyuncu: {this.getNextPlayer().name}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {isReady && (
                    <div className="flex items-center  justify-center w-48 h-48 top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-lg font-bold">
                        <>
                            <div className="flex absolute border-2 right-36 -top-40 border-gray-300 rounded-lg">
                                <Tile
                                    key={(okey ? okey.tile : 'empty') + '_' + (okey.tile ? okey.color : 'empty') + '_' + (100)}
                                    index={100}
                                    rock={okey}
                                    enableDrag={false}
                                    enableDrop={false}
                                    showDetails={true}
                                />
                            </div>

                            <div attr-data={table.tiles[0]?.tile + '_' + table.tiles[0]?.color + '_' + 99} className="flex absolute border-2 -top-40 border-gray-300 rounded-lg">
                                <Tile
                                    key={table.tiles[0]?.tile + '_' + table.tiles[0]?.color + '_' + 99}
                                    index={99}
                                    rock={table.tiles[0]}
                                    enableDrag={PlayerEnableDrag}
                                    enableDrop={PlayerEnableDrag}
                                    tileCount={table.tiles.length}
                                    showDetails={false}
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
                                        {p.name}<br/>
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
                                        />
                                    </div>

                                </div>
                            );
                        })}

                        <div className="rack bg-white w-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 absolute border-2 border-gray-300 rounded-lg bottom-10">
                            <PlayerTiles
                                tiles={player.tiles}
                                updatePlayerTiles={this.updatePlayerTiles}
                                session_id={session_id}
                                gameState={this.state.gameState}
                                table_tile={table.tiles}
                            />
                        </div>
                    </>
                )}


            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    players: state.game.players,
});

export default connect(mapStateToProps)(OkeyGame);
