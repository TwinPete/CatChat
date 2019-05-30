import '././scss/main.scss';
import * as name from "./modules/base.js";
require('./views/audio/meow.mp3');
import $ from "jquery";

console.log('CatChat');

$('.button__title').on('click', function(){
    let login = $(this).parent('.button').hasClass('button--login');
    let register = $(this).parent('.button').hasClass('button--register');

    if(login){
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