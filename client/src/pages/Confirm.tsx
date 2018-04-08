import * as React from 'react';
import { Form, Input, Icon, Button } from 'antd';
import { Props } from '../models';
import { connect } from 'react-redux';

const Confirm = (props: Props) => (
    <div className="p20 w400">
        <h1>Confirm</h1>
        <Form layout="vertical">
            <Form.Item>
                <Input
                    autoFocus={props.user.confirmationKey === ''}
                    value={props.user.confirmationKey}
                    onChange={evt => props.onChangeUserField({ key: 'confirmationKey', value: evt.target.value })}
                    prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Confirmation Key"
                />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" className="w100" onClick={() => props.onClickedConfirm()}>Confirm</Button>
            </Form.Item>
        </Form>
    </div >
);

const mapState = models => ({ ...models.model });
const mapDispatch = models => ({ ...models.model });

export default connect(mapState, mapDispatch)(Confirm);