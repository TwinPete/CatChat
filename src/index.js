import '././scss/main.scss';
import * as name from "./modules/firebase.js";
require('./views/audio/meow.mp3');
import $ from "jquery";
import firebase from 'firebase/app';
import 'firebase/database';
import { firebaseConfig } from "./modules/firebase.js"

console.log('CatChat');

firebase.initializeApp(firebaseConfig);

let database = firebase.database();




$('.button__title').on('click', function(){
    let login = $(this).parent('.button').hasClass('button--login');
    let register = $(this).parent('.button').hasClass('button--register');

    let audio = new Audio('./audio/meow.mp3');
    audio.play();

    if(login){
        $('.button--register').find('.form').removeClass('register--open');
        let loginForm = $(this).parent('.button').find('.form');
        if(loginForm.hasClass('login--open')){
            loginForm.removeClass('login--open');
            loginForm.addClass('login--close');
        }else{
            loginForm.removeClass('login--close');
            loginForm.addClass('login--open');
        }
    }

    if(register){
        $('login--register').find('.form').removeClass('login--open');
        let registerForm = $(this).parent('.button').find('.form');
        if(registerForm.hasClass('register--open')){
            registerForm.removeClass('register--open');
            registerForm.addClass('register--close');
        }else{
            registerForm.removeClass('register--close');
            registerForm.addClass('register--open');
        }
    }
    
});

$('.form--login .submit').on('click', function(e){

    e.preventDefault();

    let username = $('.login__username').val();

    // let user = database.ref(username);
    localStorage.setItem('username', username);

    // window.location.href = "http://localhost:8080/dist/chat.html";
    window.location.href = "https://catchat-1af46.firebaseapp.com/chat.html";
});