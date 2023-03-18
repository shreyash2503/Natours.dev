import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async (data, type) => {
    // type is either 'password' or 'data'
    try {
        const url = type === 'password' ? 'updatePassword' : 'updateMe'
        const res = await axios({
            method: 'PATCH',
            url: `http://localhost:9000/api/v1/users/${url}`,
            data: data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }
        console.log(res);

    } catch (e) {
        showAlert('error', e.response.data.message);
    }
}