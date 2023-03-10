import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
    console.log("hello");
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:9000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
        console.log(res.data.data);

    } catch (e) {
        showAlert('error', e.response.data.message);

    }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:9000/api/v1/users/logout'
        });
        if (res.data.status === 'success') location.reload(true) // ! Passing true is really important as reloads the cache as well if not passed then webapage can remain in same state even after reload

    } catch (error) {
        showAlert('error', 'Error logging out! Try again')

    }
}
