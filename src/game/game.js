import React from 'react';
import Board from './board.js';
import { postFetch } from '../util/utils.js'
import { Button, Statistic, Row, Col } from 'antd';
import './game.css';

export default class Game extends React.Component {

	constructor(props) {
		super(props);
		const initSquares = Array(64).fill(null);
		if (this.props.offensive === 'cat') {
			[initSquares[8 * 3 + 3], initSquares[8 * 3 + 4], initSquares[8 * 4 + 4], initSquares[8 * 4 + 3]] = ['cat', 'ai', 'cat', 'ai'];
		} else {
			[initSquares[8 * 2 + 3], initSquares[8 * 3 + 3], initSquares[8 * 3 + 4], initSquares[8 * 4 + 4], initSquares[8 * 4 + 3]] = 
				['ai', 'ai', 'ai', 'cat', 'ai'];
		}
			
		this.state = {
			history: [{
				squares: initSquares,
				catNumbers: this.props.offensive === 'cat' ? 2 : 1,
				aiNumbers: this.props.offensive === 'cat' ? 2 : 4,
				catWasNext: true
			}],
			stepNumber: 0,
			catIsNext: true,
			winner: null
		}
	}

	calculateWinner(catNumbers, aiNumbers, catAvailables, aiAvailables) {
		if (catNumbers + aiNumbers === 64 || (catAvailables.length === 0 && aiAvailables.length === 0)) {
			return (catNumbers === aiNumbers) ? 'cat-ai' : (catNumbers > aiNumbers ? 'cat' : 'ai');
		} else{
			return null;
		}
	}

	flipSquares(squares, position, catIsNext) {
		let modifiedBoard = null;
		let [startX, startY] = [position % 8, (position - position % 8) / 8];

		if (squares[position] !== null) {
			return null;
		}

		[1, 7, 8, 9, -1, -7, -8, -9].forEach((offset) => {
			let flippedSquares = modifiedBoard ? modifiedBoard.slice() : squares.slice();
			let atLeastOneMarkIsFlipped = false;
			let [lastXpos, lastYPos] = [startX, startY];

			for (let y = position + offset; y < 64; y = y + offset) {
				let [xPos, yPos] = [y % 8, (y - y % 8) / 8];
				if (Math.abs(lastXpos - xPos) > 1 || Math.abs(lastYPos - yPos) > 1) {
					break;
				}

				if (flippedSquares[y] === (!catIsNext ? 'cat' : 'ai')) {
					flippedSquares[y] = catIsNext ? 'cat' : 'ai';
					atLeastOneMarkIsFlipped = true;
					[lastXpos, lastYPos] = [xPos, yPos];
					continue;
				}
				else if ((flippedSquares[y] === (catIsNext ? 'cat' : 'ai')) && atLeastOneMarkIsFlipped) {
					flippedSquares[position] = catIsNext ? 'cat' : 'ai';
					modifiedBoard = flippedSquares.slice();
				}
				break;
			}
		});

		return modifiedBoard;
	}

	checkAvailableMoves(catIsNext, squares) {
		return squares
			.map((value, index) => { return this.flipSquares(squares, index, catIsNext) ? index : null; })
			.filter((item) => { return item !== null; });
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[this.state.stepNumber];

		if (this.state.winner || current.squares[i]) {
			return;
		}

		const changedSquares = this.flipSquares(current.squares, i, this.state.catIsNext);
		if (changedSquares === null) {
			return;
		}

		const catNumbers = changedSquares.reduce((acc, current) => { return current === 'cat' ? acc + 1 : acc }, 0);
		const aiNumbers = changedSquares.reduce((acc, current) => { return current === 'ai' ? acc + 1 : acc }, 0);
		const catAvailables = this.checkAvailableMoves(true, changedSquares);
		const aiAvailables = this.checkAvailableMoves(false, changedSquares);
	    const winner = this.calculateWinner(catNumbers, aiNumbers, catAvailables, aiAvailables);
		console.log(catNumbers, aiNumbers, catAvailables, aiAvailables,winner);

		let nextNextIsCat = ((this.state.catIsNext && aiAvailables.length === 0)
			 || (!this.state.catIsNext && catAvailables.length > 0)) ?  true : false; 

		this.setState({
			history: history.concat([{
				squares: changedSquares,
				catNumbers: catNumbers,
				aiNumbers: aiNumbers,
				catWasNext: nextNextIsCat
			}]),
			stepNumber: history.length,
			catIsNext: nextNextIsCat,
			winner: winner
		},
		this.doRobotMove);
	}

	doRobotMove() {
		if (!this.state.catIsNext) {
			const history = this.state.history.slice();
			const current = history[this.state.stepNumber];
	
			const requestBody = { 
				'board': current.squares,
				'engine': this.props.engine 
			};
			const requestRoute = '/ai/nextmove';
			
			postFetch(requestBody, requestRoute).then((data) => {
				let bestMove = data.nextmove;
				if (bestMove !== null) {
					this.handleClick(bestMove);
				}
			});
		}
	}

	exitGame() {
		const history = this.state.history.slice();
		const current = history[this.state.stepNumber];
		this.props.endGame(this.state.winner, current.squares);
	}

	render() {
		const history = this.state.history.slice();
		const current = history[this.state.stepNumber];
		let availableMoves = this.checkAvailableMoves(current.catWasNext, current.squares);

		let status =
			this.state.winner ?
				(this.state.winner === 'cat-ai') ? 'It iss a Draw' : 'The Winner is ' + (this.state.winner === 'cat' ? 'Cat' : 'AI') :
				this.state.catIsNext ? 'It is Cat\'s turn' : 'Waiting for AI...';

		return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares={current.squares} 
						availableMoves={this.state.catIsNext ? availableMoves : []} 
						onClick={(i) => this.handleClick(i)} 
					/>
				</div>
				<div className="game-info">
					<Row>
						<Col span={6}>
							<div className="game-text">
								{status}
							</div>
						</Col>
						<Col span={6}>
							<Button 
								type="primary" 
								className="exit-button"
								onClick={() => this.exitGame()}
							> 
								Exit
							</Button>
						</Col>
					</Row>
					<Row>
						<Col span={6}>
							<Statistic
								title="Cats Number"
								value={current.catNumbers}
							/>
						</Col>
						<Col span={6}>
							<Statistic
								title="AI Number"
								value={current.aiNumbers}
							/>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}