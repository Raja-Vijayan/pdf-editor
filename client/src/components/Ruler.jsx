import React from 'react';

const Ruler = ({ orientation }) => {
    const isHorizontal = orientation === 'horizontal';

    const rulerStyle = {
        position: 'absolute',
        top: isHorizontal ? 0 : '15px',
        left: isHorizontal ? '15px' : 0,
        width: isHorizontal ? 'calc(100% - 15px)' : '15px',
        height: isHorizontal ? '15px' : 'calc(100% - 15px)',
        background: '#f0f0f0',
        borderTop: isHorizontal ? '1px solid #ccc' : 'none',
        borderRight: !isHorizontal ? '1px solid #ccc' : 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        boxSizing: 'border-box'
    };

    const handleDrag = (event) => {
        const newPosition = isHorizontal ? event.clientX : event.clientY;
    };

    const getMarks = () => {
        const marks = [];
        const mainGap = 60;
        const minorGap = mainGap / 5;
        const numMarks = isHorizontal ? 8 : 7.8;
        for (let i = 0; i <= numMarks; i++) {
            const mainPos = `${i * mainGap}px`;
            marks.push(
                <div
                    key={`main-${i}`}
                    style={{
                        position: 'absolute',
                        left: isHorizontal ? mainPos : 0,
                        top: isHorizontal ? 0 : mainPos,
                        width: isHorizontal ? '1px' : '100%',
                        height: isHorizontal ? '100%' : '1px',
                        backgroundColor: '#000',
                    }}
                >
                    <div style={{
                        display: !isHorizontal ? 'flex' : '',
                        flexDirection: !isHorizontal ? 'row' : '',
                        marginTop: isHorizontal ? '-11px' : ''
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: isHorizontal ? '50%' : '-3px',
                            top: isHorizontal ? '-10px' : '50%',
                            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
                            fontSize: '8px',
                            color: '#000',
                        }}></div>
                        <span style={{ fontSize: '11px', marginLeft: isHorizontal ? '2px' : '0px' }}>{i}</span>
                    </div>
                </div>
            );

            if (i < numMarks) {
                for (let j = 1; j < 4; j++) {
                    const minorPos = `${(i * mainGap + j * minorGap) + 8}px`;
                    marks.push(
                        <div
                            key={`minor-${i}-${j}`}
                            style={{
                                position: 'absolute',
                                left: isHorizontal ? minorPos : j == 2 ? '3px' : '7px',
                                top: isHorizontal ? j == 2 ? '4px' : '7px' : minorPos,
                                width: isHorizontal ? '1px' : j == 2 ? '78%' : '50%',
                                height: isHorizontal ? j == 2 ? '72%' : '50%' : '1px',
                                backgroundColor: '#000',
                            }}
                        />
                    );
                }
            }
        }
        return marks;
    };

    const arrowStyle = {
        position: 'absolute',
        top: !isHorizontal ? '10%' : '10%',
        left: isHorizontal ? '40%' : '0%',
        transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
        width: '0',
        height: '0',
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: isHorizontal ? 'none' : '10px solid red',
        borderTop: isHorizontal ? '10px solid red' : 'none',
        cursor: 'pointer',
    };

    return (
        <div style={rulerStyle}>
            {getMarks()}
            <div
                style={arrowStyle}
                draggable
                onDrag={handleDrag}
            />
        </div>
    );
};

export default Ruler;
