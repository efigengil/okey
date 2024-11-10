import React from 'react';
import Tile from "./Tile.jsx";

const shuffleArray = (array) => {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
};

class PlayerTiles extends React.Component {
    constructor(props) {
        super(props);

        const rows = 2;
        const cols = 15;
        const totalElements = rows * cols;

        const extendedTiles = [...props.tiles, ...Array(totalElements - props.tiles.length).fill(null)];

        let initialTiles = [];
        let shuffledTiles = [];

        if (props.shuffle) {
            shuffledTiles = shuffleArray(extendedTiles);
            initialTiles = extendedTiles;
        } else {
            shuffledTiles = extendedTiles;
        }

        this.state = {
            initialTiles: initialTiles,
            shuffledTiles: shuffledTiles,
            rows: rows,
            cols: cols,
        };
    }

    componentDidUpdate(prevProps) {

        if (prevProps.tiles !== this.props.tiles || prevProps.shuffle !== this.props.shuffle) {

            const { tiles, shuffle } = this.props;
            const { rows, cols } = this.state;
            const totalElements = rows * cols;
            const extendedTiles = [...tiles, ...Array(totalElements - tiles.length).fill(null)];

            if (shuffle) {
                const shuffled = shuffleArray(extendedTiles);
                this.setState({
                    initialTiles: extendedTiles,
                    shuffledTiles: shuffled,
                });
            } else {
                this.setState({
                    shuffledTiles: extendedTiles,
                });
            }
        }
    }

    moveTile = (dragIndex, hoverIndex) => {

        const { shuffledTiles } = this.state;
        const { session_id, updatePlayerTiles, table_tile, thrown_tile } = this.props;

        const updatedTiles = [...shuffledTiles];

        const playerTile = updatedTiles.filter(tile => tile !== null);
        const playerTileCount = playerTile.length;

        const draggedTile = updatedTiles[dragIndex];

        if (dragIndex === 99 ){
            //yerden taş çekildi.
            if ( updatedTiles[hoverIndex]===null  && playerTileCount == 14 ){
                updatedTiles[hoverIndex] =  table_tile.splice(0,1)[0];
                updatePlayerTiles(session_id, updatedTiles);
              //  updateTableTiles(table_tile);

                console.log("yerdeki taş ıstakaya alındı")
            }else{
                console.log("yerdeki taş ıstakaya alınamadı ")
            }

        }else if (dragIndex === 97 ){
            //oyuncunun attığı taş çekildi.
            if ( updatedTiles[hoverIndex]===null  && playerTileCount == 14 ){
                updatedTiles[hoverIndex] =  thrown_tile.splice(0,1)[0];
                updatePlayerTiles(session_id, updatedTiles);
                //  updateTableTiles(table_tile);
                console.log("yerdeki oyuncu taşı ıstakaya alındı")
            }else{
                console.log("yerdeki oyuncu taşı ıstakaya alınamadı ")
            }

        }else{

            if (hoverIndex < updatedTiles.length && updatedTiles[hoverIndex] === null) {
                updatedTiles[dragIndex] = null;
                updatedTiles[hoverIndex] = draggedTile;
                updatePlayerTiles(session_id, updatedTiles);

            }  else {
                console.log("Geçerli bir yer değil.");
                return;
            }

        }



    };


    render() {
        const { shuffledTiles, rows, cols } = this.state;

        const twoDimensionalArray = Array.from({ length: rows }, (_, i) =>
            shuffledTiles.slice(i * cols, i * cols + cols)
        );

        return (

            <div className="flex flex-col gap-0.5 p-4">
                {twoDimensionalArray.map((row, rowIndex) => (

                    <div attr-index={rowIndex} key={rowIndex} className={`flex border-t-2 ${rowIndex == 1 ? 'border-table-row-500':''} ` }>
                        {row.map((tile, colIndex) => (
                            <Tile
                                key={(tile ? tile.tile : 'empty') + '_' + (tile ? tile.color : 'empty') + '_' + (rowIndex * cols + colIndex)}
                                index={rowIndex * cols + colIndex}
                                rock={tile}
                                moveTile={this.moveTile}
                                enableDrag={true}
                                enableDrop={true}
                                showDetails={true}
                                okey={this.props.okey}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }
}

export default PlayerTiles;
