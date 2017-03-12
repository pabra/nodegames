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
            channels: {},
            rooms: [],
            users: [],
        };

        this.socket = io.connect('//localhost:3001');
        setLoggerSocket(this.socket);

        this.socket.on('set', data => {
            this.setKnownState(data);
        });

        this.socket.on('message', msg => this.handleReceiveMessage(msg));

        this.handleReceiveMessage = this.handleReceiveMessage.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleSubmitMessage = this.handleSubmitMessage.bind(this);

        window.oooDebug = {};
        window.oooDebug.socket = this.socket;
        window.oooDebug.state = this.state;
        window.oooDebug.logger = this.logger;
        window.oooDebug.Logger = Logger;
    }

    setKnownState(data) {
        this.logger.debug('setKnownState', data);
        const o = {};
        if (data.user) o.user = data.user;
        if (data.rooms) o.rooms = data.rooms;
        if (data.channels) o.channels = data.channels;
        if (data.users) o.users = data.users;

        this.setState(o);
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
        if (this.state.user.inRoom === room) return;

        this.socket.emit('join', room, 'lobby', data => {
            if (data.ok) {
                this.setKnownState(data);
                this.handleReceiveMessage({userName: 'system', text: `you joined ${room}`});
            } else {
                const err = new Error('room change failed');
                const d = {
                    text: data.text,
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
