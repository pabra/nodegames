import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import './index.css';



class Chat extends React.Component {
    render() {
        const users = this.props && this.props.users && this.props.users.map(user => {
            return <li key={user.id}>{user.name}</li>;
        });

        return (
            <div id='chat'>
                <div>you: {this.props.user && this.props.user.name || ''}</div>
                <div className="users"><ul>{users}</ul></div>
                <div className="messages"></div>
                <div className="submit">
                    <form>
                        <input />
                        <button>submit</button>
                    </form>
                </div>
            </div>
        );
    }
}

class RoomList extends React.Component {
    onRoomChange(ev, room) {
        ev.preventDefault();
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

        this.socket = io.connect('//localhost:3001');
        this.socket.on('init', data => {
            console.log('initalized', data);
            this.setState(data);
        });
        this.socket.on('message', this.handleMessage);
        this.socket.on('user:join', user => {
            const users = this.state.users;
            users.push(user);
            this.setState({users: users});
            console.log('state', this.state);
        });
        this.socket.on('user:leave', user => {
            const users = this.state.users;
            const newUsers = users.filter(_user => _user.id !== user.id);
            this.setState({users: newUsers});
            console.log('state', this.state);
        });

        this.socket.emit('send:message', {room: 'lobby', message:'huhu'}, data => {
            if (data.ok) {
                console.log('message accepted');
            }
        });

        window.oooDebug = {};
        window.oooDebug.socket = this.socket;
        window.oooDebug.state = this.state;
    }

    handleMessage(msg) {
        console.log('msg:', msg);
    }

    handleRoomChange(room) {
        this.socket.emit('join', room, data => {
            if (data.ok) {
                console.log('changed to room:', room, data);
                this.setState({user: data.user, users: data.users});
            }
        });
    }

    render() {
        return (
            <div>
                <h1>Hello, world!</h1>
                <RoomList rooms={this.state.rooms} onRoomChange={room => this.handleRoomChange(room)} />
                <Chat user={this.state.user} users={this.state.users} />
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
