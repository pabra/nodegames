import React from 'react';
import {userType} from './types';
import './chat.css';


class Messages extends React.Component {
    constructor() {
        super();
        this._setEl = this._setEl.bind(this);
    }

    componentDidUpdate() {
        this.el.scrollTop = this.el.scrollHeight;
    }

    _setEl(el) {
        this.el = el;
    }

    render() {
        const messages = this.props.messages.map(message => {
            return <div key={message.id}><span>{message.userName}</span>{': '}<span>{message.text}</span></div>;
        });

        return (
            <div
                className="messages"
                ref={this._setEl}
            >
                {messages}
            </div>
        );
    }
}

Messages.propTypes = {
    messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this._setChatInputEl = this._setChatInputEl.bind(this);
    }

    handleChange(ev) {
        this.setState({message: ev.target.value});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmitMessage(this.state.message, () => {
            window.console.log('callback', this.chatMessagesEl);
            this.chatMessagesEl.scrollTop = this.chatMessagesEl.scrollHeight;
        });
        this.setState({message: ''});
        this.chatInputEl.focus();
    }

    _setChatInputEl(el) {
        this.chatInputEl = el;
    }

    render() {
        const users = this.props.users.map(user => {
            return <li key={user.id}>{user.name}</li>;
        });

        return (
            <div className='component chat'>
                <div>{'you: '}{this.props.user && this.props.user.name || ''}</div>
                <div className="users">{'users:'}<ul>{users}</ul></div>
                <Messages messages={this.props.messages} />
                <div className="submit">
                    <form onSubmit={this.handleSubmit}>
                        <input
                            onChange={this.handleChange}
                            ref={this._setChatInputEl}
                            type='text'
                            value={this.state.message}
                        />
                        <button type='submit'>{'submit'}</button>
                    </form>
                </div>
            </div>
        );
    }
}

Chat.propTypes = {
    messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onSubmitMessage: React.PropTypes.func.isRequired,
    user: userType.isRequired,
    users: React.PropTypes.arrayOf(userType).isRequired,
};

Chat.defaultProps = {

};
