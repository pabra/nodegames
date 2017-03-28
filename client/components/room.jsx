import React from 'react';

export default class Room extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(ev) {
        ev.preventDefault();
        this.props.onRoomChange(this.props.name, this.props.channel);
    }

    render() {
        return (
            <li>
                {this.props.label}
                <a href="#" onClick={this.handleClick}>
                    {this.props.name}
                </a>
            </li>
        );
    }
}

Room.propTypes = {
    channel: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    onRoomChange: React.PropTypes.func.isRequired,
};

Room.defaultProps = {
    label: '',
};
