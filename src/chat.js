

import '././scss/main.scss';
import $ from "jquery";
require('./views/audio/meow.mp3');
import firebase from 'firebase/app';
import 'firebase/database';
import { firebaseConfig } from "./modules/firebase.js"
require('./views/audio/ringtone.mp3');



navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.getMedia({video: true, audio: false}, function(stream){


    firebase.initializeApp(firebaseConfig);



    let database = firebase.database();
    let users = database.ref('users');
    let username = localStorage.getItem('username');
    let contacts = database.ref(username + '/contacts');
    let callRequest = database.ref(username + '/call--request');
    let callAccept = database.ref(username +'/call--accept');
    let callRefused = database.ref(username +'/call--refused');
    let callCanceled = database.ref(username +'/call--canceled');
    let callTimeout = database.ref(username +'/call--timeout');
    let vendorUrl = window.URL || window.webkitURL;
    let ringtone = new Audio('./res/ringtone.mp3');

    initializeUI();

    // users.push(user);

    function initializeUI(){
        // $('.sidebar__username').text(username);
        users.on('value', function(data){
            let vals = data.val();

            if(vals != null){

                let keys = Object.keys(vals);
                console.log(keys);

                keys.forEach(function(key){
                    let username = vals[key].username;
                    $('.contacts__list').append('<div class="contacts__contact"><div class="contacts__userpic"></div><div class="contacts__username" data-username="'+ username +'">' + username + '</div></div>');
                });

                $('.contacts__contact').on('click', function(){
                    let contact = $(this).find('.contacts__username').attr('data-username');
                    $('.chat__username').text(contact);
                    $('.chat__username').attr('data-username', contact);

                    let messages = database.ref('messages/' + username + '--' + contact);
                    let messagesSwitch = database.ref('messages/' + contact + '--' + username);

                    messages.on('value', function(data) {
                        let type = true;
                        console.log('in der message on');
                        console.log(data.val());
                        if (data.val() !== null && data.val() !== undefined)
                        {
                            localStorage.setItem('message-direction', 'first');
                            loadMessages(data, type);
                            console.log('load funktion wird aufgerufen');
                        }else
                            {
                            messagesSwitch.on('value', function(data){
                                console.log('in der messageSwwitch on');
                                console.log(data.val());
                                let type = false;


                                if(data.val() !== null && data.val() !== undefined)
                                {
                                    localStorage.setItem('message-direction', 'second');
                                    loadMessages(data, type);
                                    console.log('load funktion wird aufgerufen');
                                }else{
                                    localStorage.setItem('message-direction', 'first');
                                }

                            }, errData);

                        }
                    }, errData);
                });
            }
        }, errData());
    }

    function loadMessages(data, type){

        $('.message').remove();



        let messages = data.val();
        let keys = Object.keys(messages);

        keys.forEach(function(key){
            let text = messages[key].text;
            let from = messages[key].from;
            let date = messages[key].date;
            let time = messages[key].time;
            let type= 'message';
            if(from == username){
                type = 'message message--ownMessage';
            }

            $('.chat__main').append('<div class="'+ type +'">\n' +
                '<div class="message__body">\n' +
                '    <div class="message__userpic"></div>\n' +
                '    <div class="message__text">' + text + '</div>\n' +
                '</div>\n' +
                '</div>');
        });


    }

    $('.chat__sendButton').on('click', function(){
        let text = $('.chat__input').val();
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let milliseconds = date.getMilliseconds();
        let contact = $('.chat__username').attr('data-username');
        let type = localStorage.getItem('message-direction');
        let message = {
            from: username,
            to: contact,
            text: text,
            date: day + ':' + month + ':' + year,
            time: hours + ':' + minutes + ':' + minutes + ':' + milliseconds
        }
        if(type){
            let messages = database.ref('messages/' + username + '--' + contact);
            messages.push(message);
            // messages.on('value', pushMessage, errData);

        }else{
            let messagesSwitch = database.ref('messages/' + contact + '--' + username);
            messagesSwitch.push(message);
            // messagesSwitch.on('value', pushMessage, errData);
        }


    });

    function pushMessage(data){
        let values = data.val();
        let keys = Object.keys(values);
        console.log('here comes the values');
        console.log(keys);
        let key = keys.length - 1;
        let text = values[key].text;
        let from = values[key].from;
        let date = values[key].date;
        let time = values[key].time;
        let type= 'message';

        if(from != username){
            type = 'message message--ownMessage';
        }

        $('.chat__main').append('<div class="'+ type +'">\n' +
            '<div class="message__body">\n' +
            '    <div class="message__userpic"></div>\n' +
            '    <div class="message__text">' + text + '</div>\n' +
            '</div>\n' +
            '</div>');
    }


    $('.chat__header').on('click', function(){

        $('.videochat').addClass('videochat--open');

        let contact = $('.chat__username').text();
        let callAccepted = false;


        localStorage.setItem('init', 'true');

        var Peer = require('simple-peer');
        var peer = new Peer({
            initiator: localStorage.getItem('init') === 'true',
            trickle: false,
            stream: stream
        });


        peer.on('signal', function(data){
            console.log('first hit');

            let callRequestData = {
                code: JSON.stringify(data),
                from: username,
                to: contact
            }



            let string = contact + '/call--request';
            callRequest = database.ref(string);

            callRequest.push(callRequestData);

            // in case the user closes the call window, cancel the call, gets a refusal ...
            // ... or after 60 seconds doest get an answer the callWindow is shut down

            callRefused.on('value', function(data){
                if(data.val() != null){
                    closeCallWindow();
                    callRefused.remove();
                    callRequest.remove();
                }
            }, errData);

            callTimeout.on('value', function(data){
                if(data.val() != null){
                    closeCallWindow();
                    callTimeout.remove();
                    callRequest.remove();
                }
            }, errData);

            $('.videochat__close').on('click', function(){
                closeCallWindow();
                let contactName = $('.chat__username').text();
                callCanceled = database.ref(contactName +'/call--canceled');
                let canceled = {
                    time: '13:55'
                }
                callCanceled.push(canceled);
                callRequest.remove();
            });

            setTimeout(function(){
                if(!callAccepted){
                    closeCallWindow();
                    callRequest.remove();
                }
            }, 60000);
        });


        callAccept.on('value', gotCallAccept, errData);

        function gotCallAccept(data){

            callAccepted = true;

            let vals = data.val();

            if(vals != null){

                let keys = Object.keys(vals);
                console.log(keys);
                console.log(vals[keys[0]].code);
                let requestCode = vals[keys[0]].code;

                let code = JSON.parse(requestCode);
                peer.signal(code);
            }


        }

        peer.on('stream', function(stream){
            let video = document.createElement('video');
            $('.videochat__body').append(video);

            console.log(stream);

            video.srcObject = stream;
            video.play();
        });

    });

    // Wenn callRequest einen zusätzlichen Eintrag bekommt,
    // und der Eintrag an den anderen User adressiert ist
    // wandle Code um und generiere den Accept Code.
    // Finally push Code as callAccepted to database

    callRequest.on('value', gotCallRequest, errData);

    function errData(){
        console.log('error');
    }

    function closeCallWindow(){
        $('.videochat').removeClass('videochat--open');
        $('.videochat').addClass('videochat--close');
        if($('.videochat__requestWindow').length){
            $('.videochat__requestWindow').remove();
        }
        ringtone.pause();
        ringtone.currentTime = 0
    }


    function gotCallRequest(data){

        console.log('hier kommt der Code');
        console.log(data.val());

        let vals = data.val();

        if(vals != null){
            let keys = Object.keys(vals);
            console.log(keys);
            console.log(vals[keys[0]].code);
            let caller = vals[keys[0]].from;
            let requestCode = vals[keys[0]].code;

            var Peer = require('simple-peer');
            var peer = new Peer({
                initiator: localStorage.getItem('init') === 'true',
                trickle: false,
                stream: stream
            });

            $('.videochat__body').append(' <div class="videochat__requestWindow">\n' +
                '                        <div class="videochat__caller"><div class="videochat__callerPic"></div><div class="videochat__callerName">twinPete93</div></div>\n' +
                '                        <div class="videochat__requestButtons"><div class="videochat__accept">Accept</div><div class="videochat__refuse">Refuse</div></div></div>\n' +
                '                    </div>');
            $('.videochat').addClass('videochat--open');

            ringtone.play();

            // if the call got canceled, the called user doesnt accept, closes the window or after 60 seconds without accept the requestWindow gots closed

            callCanceled.on('value', function(data){
                if(data.val() != null){
                    closeCallWindow();
                    callCanceled.remove();
                }
            }, errData);

            $('.videochat__close').on('click', function(){
                closeCallWindow();
                callRefused = database.ref(caller + '/call--refused');
                let refused = {
                    time: '13:55'
                }
                callRefused.push(refused);
            });

            $('.videochat__refuse').on('click', function(){
                closeCallWindow();
                callRefused = database.ref(caller + '/call--refused');
                let refused = {
                    time: '13:55'
                }
                callRefused.push(refused);
            });

            setTimeout(function(){
                if($('.videochat__requestWindow').length){
                    closeCallWindow();
                    console.log('caller: ' + caller);
                    callTimeout = database.ref(caller + '/call--timeout');
                    let timeout = {
                        time: '13:55'
                    }
                    callTimeout.push(timeout);
                }
            }, 60000);



            // if the user accepts the call

            $('.videochat__accept').on('click', function(){

                ringtone.pause();
                ringtone.currentTime = 0

                let code = JSON.parse(requestCode);
                peer.signal(code);

                peer.on('signal', function(data){
                    console.log('scnd hit');

                    let accept = {
                        from: username,
                        to: caller,
                        code: JSON.stringify(data)
                    }
                    callAccept = database.ref(caller + '/call--accept');
                    callAccept.push(accept);
                });

                peer.on('stream', function(stream){
                    let video = document.createElement('video');
                    $('.videochat__requestWindow').remove();
                    $('.videochat__body').append(video);

                    console.log(stream);

                    video.srcObject = stream;
                    video.play();
                });
            });

        }

    }



    // Wenn callAccept einen zusätzlichen Eintrag bekommt,
    // und der Eintrag an mich selbst referenziert ist
    // wandle Code um und verbinde.

    

        // localStorage.setItem('init', 'true');
        
       var Peer = require('simple-peer');
       var peer = new Peer({
       initiator: localStorage.getItem('init') === 'true',
       trickle: false,
       stream: stream
       });

       $('.chat__header').on('click', function(){
          localStorage.setItem('init', 'true');


       });





}, function(err){
    console.log(err);
});