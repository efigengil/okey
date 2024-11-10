import React  from 'react';
import { useDrag, useDrop } from 'react-dnd';

function withDragDrop(WrappedComponent, itemType) {
    return function (props) {

        const [{ isDragging }, drag] = useDrag({
            type: itemType,
            item: { index: props.index },
            collect: monitor => ({
                isDragging: monitor.isDragging(),
            }),
            canDrag:props.enableDrag
        });

        const [, drop ] = useDrop({
            accept: itemType,
            drop: (item) => {
                const dragIndex = item.index;
                const hoverIndex = props.index;

                if (dragIndex !== hoverIndex) {

                    if (dragIndex === hoverIndex) {
                        return;
                    }

                    props.moveTile(dragIndex, hoverIndex);
                }else{
                    //item.index = hoverIndex;
                }
            },

            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
            canDrop: () => props.enableDrop,
        });

        return (
            <WrappedComponent
                {...props}
                dragRef={drag}
                dropRef={drop}
                isDragging={isDragging}
            />
        );
    };
}

class Tile extends React.Component {

    selectIsOkey = (tileContent) => {
        const { okey,rock } = this.props;
        const s = okey?.tile === 13 ? okey.tile =1 : okey?.tile+1;

        console.log("okey : ",s);
        console.log("tileContent : ",rock);

        return okey && okey.color === rock?.color && s === rock?.tile;
    };

    render() {

        const { rock, dragRef, dropRef, enableDrag ,showDetails ,tileCount,index} = this.props;

        const tileContent = rock ? `${rock.tile}` : '';

        const isOkey = this.selectIsOkey(rock);

       let textColorClass = '';
       let tileClass = 'bg-white emptyTile';

       if (rock){
           switch (rock.color) {
               case 'red':
                   textColorClass = 'text-red-500';
                   break;
               case 'blue':
                   textColorClass = 'text-blue-500';
                   break;
               case 'black':
                   textColorClass = 'text-black-500';
                   break;
               case 'yellow':
                   textColorClass = 'text-yellow-500';
                   break;
               default:
                   textColorClass = 'text-black-500';
           }
           tileClass='bg-white tile'

       }


        return (
            <div ref={node => dragRef(dropRef(node))} className={tileClass} style={{ opacity: !enableDrag ? 0.5 : 1 }}>
                {tileContent && (
                    <div className="text-center">
                        {showDetails && (
                            <>
                                <div className={`text-3xl font-bold ${textColorClass}`}>{tileContent}</div>
                                {!isOkey && (
                                <div className={`text-3xl text-center ${textColorClass}`}>{'♥'}</div>
                                )}
                                {isOkey && (
                                    <div className={`text-3xl text-center ${textColorClass}`}>{'♛'}</div>
                                )}
                            </>
                        )}
                        {tileCount>0 && (
                            <div className={`text-3xl font-bold`}>{tileCount}</div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default withDragDrop(Tile, 'tile');
