const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let games = {}
io.on('connection', (socket) => {

    console.log('New client connected');

    socket.on('updateActivePlayerId',(gameId,playerId)=>{
        if (games[gameId]) {
            games[gameId].activePlayerId = playerId;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_ACTIVE_PLAYER_ID');
        }
    });




    socket.on('playerTileUpdate',(gameId,playerId,tiles)=>{
        if (games[gameId] && games[gameId].players[playerId]) {
            games[gameId].players[playerId].tiles = tiles;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_PLAYER_TILES');
        }

    });



    socket.on('joinGame', (gameId) => {

        if (!games[gameId]){
            games[gameId] =
                {
                    session_id:null,
                    socket: null,
                    gameId: null,
                    start : 0,
                    players: [],
                    activePlayerId:null,
                    gameState: {
                        table: { tiles: [] },
                        okey: {},
                        isReady: false,
                    }
                };

        }

        games[gameId].gameId=  gameId;
        socket.join(gameId);
        console.log("join",gameId);
        io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_JOIN');
    });

    socket.on('setOkey', (gameId, okey) => {
        if (games[gameId]) {

            games[gameId].gameState.okey=okey;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_OKEY');
            console.log("Okey tetiklendi...",games)
        }


    });

    socket.on('setReady', (gameId, status) => {
        if (games[gameId]) {

            games[gameId].gameState.isReady=status;
            io.to(gameId).emit('gameUpdate', games[gameId],'SET_READY');

        }


    });

    socket.on('setTableTiles', (gameId, tiles) => {
        if (games[gameId]) {

            games[gameId].gameState.table.tiles = tiles;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_TABLE_TILES');
        }
    });


    socket.on('updateGameStateTable', (gameId, table) => {
        if (games[gameId]) {
            games[gameId].gameState.table = table;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_TABLE');
        }
    });


    socket.on('updateGameState', (gameId, table) => {
        if (games[gameId]) {
            games[gameId] = table;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_GAME');
        }
    });

    socket.on('setPlayer', (gameId, player) => {


        if (games[gameId]){



           // if (games[gameId].players.some(p => p.id === player.id)) {
                games[gameId].players.push(player);
                console.log("girdi")
          //  }

            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_PLAYERS');
        }
    });


    socket.on('updatedPlayers', (gameId, players) => {


        if (games[gameId]){



            // if (games[gameId].players.some(p => p.id === player.id)) {
            games[gameId].players = players;

            //  }

            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_PLAYERS');
        }
    });


    socket.on('setPlayerTiles', (gameId, players,tiles) => {


        if (games[gameId]){



             if (games[gameId].players.some(p => p.id === player.id)) {
            games[gameId].players.push=(tiles);
            console.log("girdi")
            console.log("player id :",player.id)
             }

            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_PLAYER_TILES');
        }
    });




    socket.on('startGame', (gameId) => {

        console.log('Client startGame');
        if (games[gameId]) {

            games[gameId].gameState.isReady = true;
            io.to(gameId).emit('gameUpdate', games[gameId],'UPDATE_STARTS');

        }
    });


    socket.on('startData', (gameId) => {

        if (games[gameId]) {
                games[gameId].start = 1;
                io.to(gameId).emit('gameUpdate', games[gameId]);
        }
    });


    socket.on('disconnect', () => {
        games = {}
        console.log('Client disconnected');
    });

});

server.listen(4000, () => console.log('Listening on port 4000'));
