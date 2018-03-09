import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

const syncState = async () => {
  const manager = await lottery.methods.manager().call();
  const players = await lottery.methods.getPlayers().call();
  const balance = await web3.eth.getBalance(lottery.options.address);
  const accounts = await web3.eth.getAccounts();
  return {manager, players, balance, accounts, value: ''};
}

class App extends Component {

  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    accounts: ''
  };

  constructor(props){
    super(props);
  }

  async componentDidMount(){
    let newState = await syncState();
    this.setState(newState);
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({message: 'waiting on transaction success...'});

    const accounts = await web3.eth.getAccounts();
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    let newState = await syncState();
    this.setState(newState);

    this.setState({message: 'You have been entered!'});
  }

  onClick = async (event) => {
    this.setState({message: 'waiting on transaction success...'});
    const accounts = await web3.eth.getAccounts();
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    let newState = await syncState();
    this.setState(newState);
    this.setState({message: 'A winner has been picked! '});
  }

  render() {
    let pickWinnerElement = (this.state.manager !== this.state.accounts[0])
      ? ''
      : <div>
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        <hr />
      </div>;
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance)} ether!
        </p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value = {this.state.value}
              onChange={event => this.setState({value: event.target.value})}
            />
          </div>
          <button>enter</button>
        </form>
        <hr />
        {pickWinnerElement}
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
