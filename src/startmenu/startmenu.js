import React from 'react';
import { Form, Radio, Button, Table } from 'antd';
import './startmenu.css';
import { postFetch } from '../util/utils.js'

class UserTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        const requestBody = {
            'username': this.props.username,
        };
        const requestRoute = '/api/userdata';
        postFetch(requestBody, requestRoute).then((userdata) => {
            this.setState({
                data: userdata.result,
            });
        });
    }

    render() {
        const columns = [ 
            {
                title: 'Time',
                dataIndex: 'time',
                key: 'time',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
            },
            {
                title: 'Chessboard Info',
                dataIndex: 'boardinfo',
                key: 'boardinfo',
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={this.state.data}
                className="user-table"
            />
        );
    }

}


export default class StartMenu extends React.Component {

    onFinish(values) {
        this.props.startGame(values.offensive, values.engine);
    }

    onFinishFailed(errorInfo) {
        console.log('Failed:', errorInfo);
    }

    render() {

        return (
            <div className="start-menu">
                <div className="new-game-area">
                    <div className="text-area">
                        Start a new game
                    </div>
                    <Form 
                        className="form" 
                        onFinish={(values) => this.onFinish(values)} 
                        onFinishFailed={(errorInfo) => this.onFinishFailed(errorInfo)}
                        initialValues={{ offensive: "cat", engine: "minimax" }}
                    >
                        <Form.Item 
                            name="offensive" 
                            label="Offensive"
                        >
                            <Radio.Group>
                                <Radio value={'cat'}>cat</Radio>
                                <Radio value={'ai'}>AI</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item 
                            name="engine" 
                            label="AI Engine"
                        >
                            <Radio.Group>
                                <Radio value={'minimax'}>Minimax</Radio>
                                <Radio value={'mcts'}>Monte Carlo tree search</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item>
                        <Button 
                                type="primary" 
                                htmlType="submit" 
                                className="form-button"
                            > 
                                Start
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className="old-game-area">
                    <div className="text-area">
                        Your game history
                    </div>
                    <UserTable
                        username={this.props.username} 
                    />
                </div>
            </div>
        );
    }
}