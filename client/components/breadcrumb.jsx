import React from 'react';

import Room from './room';
import {userType, channelsType} from './types';
import './breadcrumb.css';

export default class Breadcrumb extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    getCrumbs() {
        const user = this.props.user;
        const channels = this.props.channels;
        const onRoomChange = this.props.onRoomChange;
        const crumbs = [];

        crumbs.push(
            <Room
                channel='lobby'
                key='lobby'
                label='Room: '
                name='lobby'
                onRoomChange={onRoomChange}
            />
        );

        if (!channels[user.inChannel])
            return crumbs;

        if (channels[user.inChannel].isLobby && user.inChannel === user.inRoom)
            return crumbs;

        if (channels[user.inChannel].isLobby) {
            crumbs.push(
                <Room
                    channel={user.inChannel}
                    key={`${user.inChannel}:${user.inRoom}`}
                    label='Room: '
                    name={user.inRoom}
                    onRoomChange={onRoomChange}
                />
            );
        } else {
            crumbs.push(
                <Room
                    channel='lobby'
                    key={`lobby:${user.inChannel}`}
                    label='Room: '
                    name={user.inChannel}
                    onRoomChange={onRoomChange}
                />,
                <Room
                    channel={user.inChannel}
                    key={`${user.inChannel}:${user.inRoom}`}
                    label='Game: '
                    name={user.inRoom}
                    onRoomChange={onRoomChange}
                />
            );
        }

        return crumbs;
    }

    render() {
        const crumbs = this.getCrumbs();

        return (
            <div className='component breadcrumb'>
                {'Breadcrumb:'}
                <ul>
                    {crumbs}
                </ul>
            </div>
        );
    }
}

Breadcrumb.propTypes = {
    channels: channelsType.isRequired,
    onRoomChange: React.PropTypes.func.isRequired,
    user: userType.isRequired,
};
