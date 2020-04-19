import React from 'react';
import { postFetch } from '../util/utils.js'
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import md5 from 'md5';
import catImg from '../img/cat.png';
import aiImg from '../img/ai.png';
import './logmenu.css';

export default class LogMenu extends React.Component {
    onFinish(values) {
        const hashPass = md5(values.password);
        const requestBody = { 'name': values.username, 'password': hashPass };
        const requestRoute = '/api/login';

        postFetch(requestBody, requestRoute).then((data) => {
            let logResult = data.result;
            if (logResult) {
                this.props.logIn(values.username);
            }
            else {
                alert(data.desc);
            }
        });
    }

    onFinishFailed(errorInfo) {
        console.log('Failed:', errorInfo);
    }

    render() {
        return (
            <div className="log-menu">
                <div className="cover-area">
                    <img 
                        src={catImg} 
                        className="cover-img" 
                        alt="cat"
                    />
                    <img 
                        src={aiImg}
                        className="cover-img"
                        alt="ai"     
                    />
				</div> 
                <div className="text-area">
                    Cat v.s. AI - A Man-Machine Reversi Game
                </div>
                <Form 
                    className="form" 
                    onFinish={(values) => this.onFinish(values)} 
                    onFinishFailed={(errorInfo) => this.onFinishFailed(errorInfo)}
                >
                    <Form.Item 
                        name="username" 
                        rules={[{ required: true, message: 'Please input your Username!' }]} 
                    >
                        <Input 
                            prefix={<UserOutlined className="site-form-item-icon" />} 
                            placeholder="Username" 
                        />
                    </Form.Item>
                    <Form.Item 
                        name="password" 
                        rules={[{ required: true, message: 'Please input your Password!' }]} 
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Password" 
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="form-button"
                        > 
                            Register or Log In 
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}