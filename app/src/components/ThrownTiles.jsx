import React from 'react';
import Tile from "./Tile.jsx";


class ThrownTiles extends React.Component {
    constructor(props) {
        super(props);
        this.throwTiles = [];
    }



     deleteArrayItemPosition = (array = [], dragIndex) => {

        if (!Array.isArray(array)) {
            console.error('deleteArrayItemPosition: array param is not an array');
            return array;
        }

        const newArray = [...array];

        if (typeof newArray[dragIndex] !== "undefined") {
            newArray.splice(dragIndex, 1);
        }

        return newArray;
    };


    moveTile = (dragIndex, hoverIndex) => {

        const { session_id, updatePlayerTiles, playerTile ,updateThrownTiles} = this.props;

        const playerTiles = playerTile.filter(tile => tile !== null);
        const playerTileCount = playerTiles.length;


        if (hoverIndex === 97 && playerTileCount >= 15){

            const ThrownTile = playerTile[dragIndex];

            console.log("Atılan taş",ThrownTile);
            const updatedTiles = this.deleteArrayItemPosition(playerTile, dragIndex);
            updateThrownTiles(ThrownTile);
            updatePlayerTiles(session_id, updatedTiles);

        }else{
            alert("Hooop naptın ya")
        }

    };


    render() {

        const { enableDrag,index,enableDrop,showDetails,tiles } = this.props;

        const lastTile = tiles[tiles.length - 1];

        return (

            <div className="flex flex-col gap-0.5 p-4">
                <Tile
                    key={(lastTile ? lastTile.tile : 'empty') + '_' + (lastTile ? lastTile.color : 'empty') + '_' + 97}
                    index={index}
                    rock={lastTile}
                    moveTile={this.moveTile}
                    enableDrag={enableDrag}
                    enableDrop={enableDrop}
                    showDetails={showDetails}
                />
            </div>
        );
    }
}

export default ThrownTiles;
