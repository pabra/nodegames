import React from 'react';


export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.noGame = <span>{'no Game'}</span>;
        this.state = {
            content: this.noGame,
            isLoading: false,
            loadedContent: null,
        };
        window.console.log('constructor');
    }

    componentWillReceiveProps(nextProps) {
        window.console.log('componentWillReceiveProps');
        window.console.log('nextProps', nextProps);
        if (nextProps.room !== this.state.loadedContent) {
            this.setState({
                content: <span>{'loading...'}</span>,
                loadedContent: nextProps.room,
                isLoading: true,
            });
            this.loadContent(nextProps.room);
        }
    }

    loadContent(name) {
        if (name === 'TicTacToe') {
            // get a Promise of that import
            const _p = import('../games/tic_tac_toe');
            _p.then(ttt => {
                window.console.log('ttt', ttt);
                this.setState({
                    isLoading: false,
                    content: <ttt.TicTacToe />,
                });
            });
        } else {
            this.setState({
                isLoading: false,
                content: this.noGame,
            });
        }
    }

    render() {
        return this.state.content;
    }
}

Game.propTypes = {
    room: React.PropTypes.string,
};

Game.defaultProps = {
    room: '',
};
