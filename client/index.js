import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import './index.css';



class Chat extends React.Component {
    render() {
        const users = this.pops && this.pops.users && this.props.users.map(user => {
            return <li>{user}</li>;
        });

        return (
            <div id='chat'>
                <div className="users"><ul>{users}</ul></div>
                <div className="messages"></div>
                <div className="submit"></div>
            </div>
        );
    }
}

class RoomList extends React.Component {
    onRoomChange(ev, room) {
        ev.preventDefault();
        console.log(ev);
        this.props.onRoomChange(room);
    }

    render() {
        return (
            <ul>{
                this.props.rooms && this.props.rooms.map(room => {
                    return <li key={room}>
                           <a href="#" onClick={(ev) => this.onRoomChange(ev, room)}>{room}</a>
                           </li>;
                })}
            </ul>
        );
    }
}

class App extends React.Component {
    constructor() {
        super();
        this.state = {};

        const socket = io.connect('//localhost:3001');
        socket.on('init', data => {
            const state = Object.assign({}, this.state, data);
            console.log('initalized', state);
            this.setState(state);
        });
        socket.on('message', this.handleMessage);
        socket.emit('send:message', {room: 'lobby', message:'huhu'}, data => {
            if (data.ok) {
                console.log('message acceopted');
            }
        });

        window.oooDebug = {};
        window.oooDebug.socket = socket;
    }

    handleMessage(msg) {
        console.log('msg:', msg);
    }

    handleRoomChange(room) {
        console.log('change to room:', room);
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <RoomList rooms={this.state.rooms} onRoomChange={this.handleRoomChange} />
                <Chat />
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
