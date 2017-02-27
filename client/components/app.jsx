import React from 'react';
import io from 'socket.io-client';

import Game from './game';
import Chat from './chat';
import RoomList from './room_list';


export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            messages: [],
            user: {},
            rooms: [],
            users: [],
        };

        this.socket = io.connect('//localhost:3001');
        this.socket.on('init', data => {
            this.setState({
                user: data.user,
                rooms: data.rooms,
                users: data.users,
            });
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
    }

    handleReceiveMessage(msg) {
        msg.id = '_' + Math.random().toString(36).substr(2, 7);
        const messages = this.state.messages.slice(-9);
        messages.push(msg);
        this.setState({messages});
    }

    handleSubmitMessage(msg) {
        this.socket.emit('send:message', {room: this.state.user.room, text: msg}, data => {
            if (data.ok) {
                this.handleReceiveMessage({userName: this.state.user.name, text: msg});
            }
        });
    }

    handleRoomChange(room) {
        this.socket.emit('join', room, data => {
            if (data.ok) {
                this.setState({user: data.user, users: data.users});
                this.handleReceiveMessage({userName: 'system', text: `you joined ${room}`});
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
                <Game room={this.state.user && this.state.user.room} />
            </div>
        );
    }
}
