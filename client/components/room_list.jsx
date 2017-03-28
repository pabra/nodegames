import React from 'react';

import Room from './room';

export default class RoomList extends React.Component {
    render() {
        const rooms = this.props.rooms.map(room => {
            return (
                <Room
                    channel={this.props.channel}
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
    channel: React.PropTypes.string,
    onRoomChange: React.PropTypes.func.isRequired,
    rooms: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
};

RoomList.defaultProps = {
    channel: null,
};
