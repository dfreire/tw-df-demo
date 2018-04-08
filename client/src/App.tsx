import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router';
import { Icon, Menu, Alert } from 'antd';
import { Props } from './models';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Confirm from './pages/Confirm';
import ChangePassword from './pages/ChangePassword';

class App extends React.Component<Props, {}> {
    componentWillMount() {
        this.props.onLoad();
    }

    render() {
        const signedin = this.props.sessionToken && this.props.sessionToken.length > 0;

        return (
            <div className={`h100 p50 ${signedin ? 'bgGreen' : 'bgRed'}`}>
                <div className="ma w400 bgWhite">
                    {this._renderMenu()}
                    {this._renderRoutes()}
                    {this._renderMessage()}
                </div>
            </div >
        );
    }

    _renderMenu() {
        const signedout = this.props.sessionToken == null || this.props.sessionToken.length === 0;
        const mode = 'horizontal';
        const selectedKeys = [window.location.pathname];

        if (signedout) {
            return (
                <Menu mode={mode} selectedKeys={selectedKeys} onSelect={this.props.onClear}>
                    <Menu.Item key="/signin">
                        <Link to="/signin"><Icon type="login" />Sign in</Link>
                    </Menu.Item>
                    <Menu.Item key="/signup">
                        <Link to="/signup"><Icon type="form" />Sign up</Link>
                    </Menu.Item>
                    <Menu.Item key="/confirm">
                        <Link to="/confirm"><Icon type="check" />Confirm</Link>
                    </Menu.Item>
                </Menu>
            );
        } else {
            return (
                <Menu mode={mode} selectedKeys={selectedKeys} onSelect={this.props.onClear}>
                    <Menu.Item key="/change">
                        <Link to="/change"><Icon type="lock" />Change Password</Link>
                    </Menu.Item>
                    <Menu.Item key="/signout">
                        <a onClick={this.props.onClickedSignout}><Icon type="logout" />Sign out</a>
                    </Menu.Item>
                </Menu>
            );
        }
    }

    _renderRoutes() {
        const signedout = this.props.sessionToken == null || this.props.sessionToken.length === 0;

        if (signedout) {
            return (
                <Switch>
                    <Route path="/signin" component={Signin} />
                    <Route path="/signup" component={Signup} />
                    <Route path="/confirm" component={Confirm} />
                    <Redirect to="/signin" />
                </Switch>
            );
        } else {
            return (
                <Switch>
                    <Route path="/change" component={ChangePassword} />
                    <Redirect to="/change" />
                </Switch>
            );
        }
    }

    _renderMessage() {
        return this.props.messageType && this.props.message && (
            <div className="p20">
                <Alert
                    type={this.props.messageType}
                    message={this.props.message}
                    closable={true}
                    onClose={this.props.onClear}
                />
            </div>
        );
    }
}

const mapState = models => ({ ...models.model });
const mapDispatch = models => ({ ...models.model });
export default withRouter(connect(mapState, mapDispatch)(App) as any);