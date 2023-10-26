import { login, logout } from "./login.js";
export const stripe = Stripe('pk_test_51Mv0XESH4yaZ8NIUHUCx1iAvO1yC5ovmx6oE3bgJHuwkPvOkQFv8VJRdmT1BvBD3bPtnZTWwAS58nZQWGPgCIN6M000GlDsKVn')
import '@babel/polyfill';
import { displayMap } from "./mapbox.js";
import { updateData, updateSettings } from "./updateSettings";
import { bookTour } from "./stripe.js";
//DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateSettingsForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
//Values

console.log("Hello")
//Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);

}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log("BYE ")
        console.log(email, password);
        login(email, password);

    });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (updateSettingsForm) {
    updateSettingsForm.addEventListener('submit', async e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(form);
        await updateSettings(form, 'data');
        window.location.reload();
    })
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').value = 'Updating...';
        const password = document.getElementById('password-current').value;
        const confirmPassword = document.getElementById('password').value;
        const newPassword = document.getElementById('password-confirm').value;
        await updateSettings({ password, confirmPassword, newPassword }, 'password');
        document.querySelector('btn--save-password').value = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

    })
}

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    })
}