import React from 'react';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this._setChatInput = this._setChatInput.bind(this);
    }

    handleChange(ev) {
        this.setState({message: ev.target.value});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmitMessage(this.state.message);
        this.setState({message: ''});
        this.chatInput.focus();
    }

    _setChatInput(el) {
        window.console.log('el', el);
        this.chatInput = el;
    }

    render() {
        const users = this.props.users.map(user => {
            return <li key={user.id}>{user.name}</li>;
        });

        const messages = this.props.messages.map(message => {
            return <div key={message.id}><span>{message.userName}</span>{': '}<span>{message.text}</span></div>;
        });

        return (
            <div id='chat'>
                <div>{'you: '}{this.props.user && this.props.user.name || ''}</div>
                <div className="users">{'users:'}<ul>{users}</ul></div>
                <div className="messages">{messages}</div>
                <div className="submit">
                    <form onSubmit={this.handleSubmit}>
                        <input
                            onChange={this.handleChange}
                            ref={this._setChatInput}
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

const userType = React.PropTypes.shape({
    name: React.PropTypes.string,
    id: React.PropTypes.string,
});

Chat.propTypes = {
    messages: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onSubmitMessage: React.PropTypes.func.isRequired,
    user: userType.isRequired,
    users: React.PropTypes.arrayOf(userType).isRequired,
};

Chat.defaultProps = {

};
