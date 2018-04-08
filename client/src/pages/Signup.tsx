import * as React from 'react';
import { Form, Input, Icon, Button } from 'antd';
import { Props } from '../models';
import { connect } from 'react-redux';

const Signup = (props: Props) => (
    <div className="p20 w400">
        <h1>Sign up</h1>
        <Form layout="vertical">
            <Form.Item>
                <Input
                    autoFocus={props.user.email === ''}
                    value={props.user.email}
                    onChange={evt => props.onChangeUserField({ key: 'email', value: evt.target.value })}
                    prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Email"
                />
            </Form.Item>
            <Form.Item>
                <Input
                    type="password"
                    value={props.user.password}
                    onChange={evt => props.onChangeUserField({ key: 'password', value: evt.target.value })}
                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Password"
                />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" className="w100" onClick={props.onClickedSignup}>Sign up</Button>
            </Form.Item>
        </Form>
    </div >
);

const mapState = models => ({ ...models.model });
const mapDispatch = models => ({ ...models.model });

export default connect(mapState, mapDispatch)(Signup);