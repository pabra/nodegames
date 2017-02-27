import React from 'react';

class Room extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(ev) {
        ev.preventDefault();
        this.props.onRoomChange(this.props.name);
    }

    render() {
        return (
            <li>
                <a href="#" onClick={this.handleClick}>
                    {this.props.name}
                </a>
            </li>
        );
    }
}

Room.propTypes = {
    name: React.PropTypes.string.isRequired,
    onRoomChange: React.PropTypes.func.isRequired,
};

export default class RoomList extends React.Component {
    render() {
        const rooms = this.props.rooms.map(room => {
            return (
                <Room
                    key={room}
                    name={room}
                    onRoomChange={this.props.onRoomChange}
                />
            );
        });

        return <ul>{rooms}</ul>;
    }
}

RoomList.propTypes = {
    onRoomChange: React.PropTypes.func.isRequired,
    rooms: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};
