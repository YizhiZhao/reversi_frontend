import React from 'react';
import Game from '../game/game.js';
import StartMenu from '../startmenu/startmenu.js'
import LogMenu from '../logmenu/logmenu.js'
import { postFetch } from '../util/utils.js'
import { Route, Redirect, HashRouter as Router } from 'react-router-dom'
import { createHashHistory } from 'history'

const history = createHashHistory();

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            start: false,
            offensive: 'null',
            engine: 'null',
        };
    }

    startGame(offensive, engine) {
        this.setState({
            start: true,
            offensive: offensive,
            engine: engine,
        });
        history.push('/game');
    }

    endGame(status, board) {
        const requestBody = { 
			'name': this.state.username,
			'status': status,
			'board': board,
		};
		const requestRoute = '/api/exit';
		postFetch(requestBody, requestRoute)
        this.setState({
            offensive: null
        });
        history.push('/start');
    }

    logIn(name) {
        this.setState({
            username: name
        });
        history.push('/start');
    }

    render() {
        return (
            <Router>
                <Redirect from="/" to="/login" />
                <Route 
                    path="/login" 
                    component={ () => {
                            let obj = { logIn: (name) => this.logIn(name) };
                            return (<LogMenu {...obj} />);
                        }
                    }
                />
                <Route 
                    path="/start" 
                    component={ () => {
                            let obj = { 
                                username: this.state.username,
                                startGame: (offensive, engine) => this.startGame(offensive, engine) 
                            };
                            return (<StartMenu {...obj} />);
                        }
                    }
                />
                <Route 
                    path="/game" 
                    component={ props => {
                            let obj = { 
                                offensive: this.state.offensive,
                                engine: this.state.engine,
                                endGame: (status, board) => this.endGame(status, board),
                            };
                            return (<Game {...obj} />);
                        }
                    }
                />
            </Router>
        );
    }

    /*
    render() {
        return (
            <div className="app"> 
                {this.state.username ?
                    this.state.start ? 
                        <Game 
                            offensive={this.state.offensive}
                            engine={this.state.engine}
                            endGame={(status, board) => this.endGame(status, board)} 
                        /> :
                        <StartMenu 
                            startGame={(offensive, engine) => this.startGame(offensive, engine)} 
                        /> :
                    <LogMenu 
                        logIn={(name) => this.logIn(name)}
                    />}
            </div>
        );
    }
    */
}