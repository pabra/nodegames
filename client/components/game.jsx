import React from 'react';
import {userType, channelsType} from './types';
import {Logger} from '../lib/logger';

const logger = Logger.get('Game');

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.noGame = <span>{'no Game'}</span>;
        this.state = {
            content: this.noGame,
            isLoading: false,
            loadedContent: null,
        };
        this.handleNewGame = this.handleNewGame.bind(this);
        window.console.log('constructor');
    }

    componentWillReceiveProps(nextProps) {
        logger.debug('nextProps', nextProps);
        const channels = nextProps.channels;
        const user = nextProps.user;

        if (channels[user.inChannel].isLobby) {
            // we are in channel "lobby"
            const content = (
                <div>
                    <h2>{channels[user.inRoom].name}</h2>
                    <p>{channels[user.inRoom].description}</p>
                    {(user.inChannel !== user.inRoom) &&
                        // we are not in room "lobby"
                        <button onClick={this.handleNewGame}>
                            {'new game'}
                        </button>
                    }
                </div>
            );

            this.setState({
                content: content,
                loadedContent: user.inRoom,
                isLoading: false,
            });
        } else {
            // we are in a game channel
            logger.debug('new game of', channels[user.inChannel]);
            // this.loadContent();
            this.setState({
                content: <span>{'loading...'}</span>,
                loadedContent: nextProps.user.inRoom,
                isLoading: true,
            });
            if (user.inChannel === 'tictactoe') {
                // get a Promise of that import
                const _p = import('../games/tic_tac_toe');
                _p.then(component => {
                    window.console.log('component', component);
                    this.setState({
                        content: <component.default />,
                        isLoading: false,
                    });
                });
            } else {
                this.setState({
                    content: this.noGame,
                    isLoading: false,
                });
            }
        }
    }

    handleNewGame() {
        logger.debug('this.props.user', this.props.user);
        logger.debug('channels[user.inRoom]', this.props.channels[this.props.user.inRoom]);
        this.props.onRoomChange(null, this.props.user.inRoom);
    }

    render() {
        return this.state.content;
    }
}


Game.propTypes = {
    channels: channelsType.isRequired,
    onRoomChange: React.PropTypes.func.isRequired,
    user: userType.isRequired,
};
