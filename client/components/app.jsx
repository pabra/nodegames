import React from 'react';
import io from 'socket.io-client';

import {Logger, setSocket as setLoggerSocket} from '../lib/logger';
import Game from './game';
import Chat from './chat';
import RoomList from './room_list';


export default class App extends React.Component {
    constructor() {
        super();
        this.logger = Logger.get('app');
        this.state = {
            messages: [],
            user: {},
            // rooms: [],
            games: {},
            users: [],
        };

        this.socket = io.connect('//localhost:3001');
        setLoggerSocket(this.socket);
        this.socket.on('set', data => {
            const o = {};
            if (data.user) o.user = data.user;
            // if (data.rooms) o.rooms = data.rooms;
            if (data.games) o.games = data.games;
            if (data.users) o.users = data.users;

            this.setState(o);
            // this.handleSubmitMessage('huhu func');
        });
        this.socket.on('message', msg => this.handleReceiveMessage(msg));
        this.socket.on('user:join', user => {
            const users = this.state.users;
            users.push(user);
            this.setState({users});
        });
        this.socket.on('user:leave', user => {
            const users = this.state.users;
            const newUsers = users.filter(_user => _user.id !== user.id);
            this.setState({users: newUsers});
        });

        // this.socket.emit('send:message', {room: 'lobby', message:'huhu'}, data => {
        //     if (data.ok) {
        //         console.log('message accepted');
        //     }
        // });

        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleSubmitMessage = this.handleSubmitMessage.bind(this);

        window.oooDebug = {};
        window.oooDebug.socket = this.socket;
        window.oooDebug.state = this.state;
        window.oooDebug.logger = this.logger;
        window.oooDebug.Logger = Logger;
    }

    handleReceiveMessage(msg) {
        msg.id = '_' + Math.random().toString(36).substr(2, 7);
        const messages = this.state.messages.slice(-9);
        messages.push(msg);
        this.setState({messages});
    }

    handleSubmitMessage(msg) {
        this.socket.emit('send:message', msg, data => {
            if (data.ok) {
                this.handleReceiveMessage({userName: this.state.user.name, text: msg});
            }
        });
    }

    handleRoomChange(room) {
        this.socket.emit('join', room, 'lobby', data => {
            if (data.ok) {
                this.setState({user: data.user, users: data.users});
                this.handleReceiveMessage({userName: 'system', text: `you joined ${room}`});
            } else {
                const err = new Error('room change failed');
                const d = {
                    message: err.message,
                    name: err.name,
                    stack: err.stack,
                };
                this.socket.emit('ioLogger', d);
            }
        });
    }

    render() {
        return (
            <div>
                <h1>{'Hello, world!'}</h1>
                <RoomList
                    onRoomChange={this.handleRoomChange}
                    rooms={this.state.rooms}
                />
                <Chat
                    messages={this.state.messages}
                    onSubmitMessage={this.handleSubmitMessage}
                    user={this.state.user}
                    users={this.state.users}
                />
                <Game room={this.state.user && this.state.user.inRoom} />
            </div>
        );
    }
}
