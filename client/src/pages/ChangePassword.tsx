import * as React from 'react';
import { Form, Input, Icon, Button } from 'antd';
import { Props } from '../models';
import { connect } from 'react-redux';

const ChangePassword = (props: Props) => (
    <div className="p20 w400">
        <h1>Change Password</h1>
        <Form layout="vertical">
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
                <Button type="primary" className="w100" onClick={props.onClickedChangePassword}>Change Password</Button>
            </Form.Item>
        </Form>
    </div >
);

const mapState = models => ({ ...models.model });
const mapDispatch = models => ({ ...models.model });

export default connect(mapState, mapDispatch)(ChangePassword);