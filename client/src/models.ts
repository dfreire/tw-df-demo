import axios from 'axios';

interface State {
    sessionToken: string;
    user: {
        email: string;
        password: string;
        confirmationKey: string;
    };
    message?: string;
    messageType?: 'success' | 'error';
}

const INITIAL_STATE: State = {
    sessionToken: '',
    user: {
        email: '',
        password: '',
        confirmationKey: '',
    },
};

export const model = {
    state: INITIAL_STATE,

    reducers: {
        onLoad(state: State): State {
            const sessionToken = localStorage.getItem('sessionToken') || '';
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + sessionToken;
            return { ...state, sessionToken };
        },

        onChangeUserField(state: State, payload: { key: string, value: string }): State {
            const { key, value } = payload;
            const user = { ...state.user };
            user[key] = value;
            return { ...state, user };
        },

        onSignedup(state: State, payload: { confirmationKey: string }): State {
            const { confirmationKey } = payload;
            return { ...state, message: confirmationKey, messageType: 'success' };
        },

        onConfirmed(state: State): State {
            return { ...state, message: 'Confirmed', messageType: 'success' };
        },

        onChangedPassword(state: State): State {
            return { ...state, message: 'Changed the password!', messageType: 'success' };
        },

        onMessage(state: State, payload: { message: string, messageType: 'success' | 'error' }): State {
            const { message, messageType } = payload;
            return { ...state, message, messageType };
        },

        onClear(state: State) {
            return { ...state, message: undefined, messageType: undefined };
        },
    },

    effects: {
        async onClickedSignup(payload: {}, models: { model: State }) {
            const { email, password } = models.model.user;

            if (email === '') {
                (this as Props).onMessage({ messageType: 'error', message: 'The email is missing' });

            } else if (password === '') {
                (this as Props).onMessage({ messageType: 'error', message: 'The password is missing' });

            } else {
                try {
                    const res = await axios.post('/api/signup', { email, password });
                    const confirmationKey = res.data.ck;
                    (this as Props).onSignedup({ confirmationKey });
                } catch (err) {
                    (this as Props).onMessage({ messageType: 'error', message: 'Couldn\'t sign up' });
                }
            }
        },

        async onClickedConfirm(payload: {}, models: { model: State }) {
            const { confirmationKey } = models.model.user;

            if (confirmationKey === '') {
                (this as Props).onMessage({ messageType: 'error', message: 'The confirmation key is missing' });

            } else {
                try {
                    await axios.post('/api/confirm', { ck: confirmationKey });
                    (this as Props).onConfirmed();
                } catch (err) {
                    (this as Props).onMessage({ messageType: 'error', message: 'Couldn\'t confirm' });
                }
            }
        },

        async onClickedSignin(payload: {}, models: { model: State }) {
            const { email, password } = models.model.user;

            if (email === '') {
                (this as Props).onMessage({ messageType: 'error', message: 'The email is missing' });

            } else if (password === '') {
                (this as Props).onMessage({ messageType: 'error', message: 'The password is missing' });

            } else {
                try {
                    const res = await axios.post('/api/signin', { email, password });
                    const sessionToken = res.data.st;
                    localStorage.setItem('sessionToken', sessionToken);
                    window.location.href = '/';
                } catch (err) {
                    (this as Props).onMessage({ messageType: 'error', message: 'Couldn\'t sign in' });
                }
            }
        },

        async onClickedChangePassword(payload: {}, models: { model: State }) {
            const { password } = models.model.user;

            if (password === '') {
                (this as Props).onMessage({ messageType: 'error', message: 'The password is missing' });

            } else {
                try {
                    await axios.post('/api/session/changepass', { password });
                    (this as Props).onChangedPassword();
                } catch (err) {
                    (this as Props).onMessage({ messageType: 'error', message: 'Couldn\'t change the password' });
                }
            }
        },

        async onClickedSignout(payload: {}, models: { model: State }) {
            try {
                await axios.post('/api/session/signout');
                localStorage.removeItem('sessionToken');
                window.location.href = '/';
            } catch (err) {
                (this as Props).onMessage({ messageType: 'error', message: 'Couldn\'t sign out' });
            }
        }
    }
};

export interface Props extends State {
    onLoad: { () };

    onChangeUserField: { (payload: { key: string, value: string }) };

    onClickedSignup: { () };
    onSignedup: { (payload: { confirmationKey: string }) };

    onClickedConfirm: { () };
    onConfirmed: { () };

    onClickedSignin: { () };

    onClickedChangePassword: { () };
    onChangedPassword: { () };

    onClickedSignout: { () };

    onMessage: { (payload: { message: string, messageType: 'success' | 'error' }) };
    onClear: { () };
}
