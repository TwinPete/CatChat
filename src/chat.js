

import '././scss/main.scss';
import $ from "jquery";
require('./views/audio/meow.mp3');
import firebase from 'firebase/app';
import 'firebase/database';
import { firebaseConfig } from "./modules/firebase.js"
require('./views/audio/ringtone.mp3');




navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.getMedia({video: true, audio: true}, function(stream){


    firebase.initializeApp(firebaseConfig);



    let database = firebase.database(),
        users = database.ref('users'),
        username = localStorage.getItem('username'),
        contacts = database.ref(username + '/contacts'),
        callRequest = database.ref(username + '/call--request'),
        callAccept = database.ref(username +'/call--accept'),
        callRefused = database.ref(username +'/call--refused'),
        callCanceled = database.ref(username +'/call--canceled'),
        callTimeout = database.ref(username +'/call--timeout'),
        callFinished = database.ref(username +'/call--finished'),
        vendorUrl = window.URL || window.webkitURL,
        ringtone = new Audio('./audio/ringtone.mp3');

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
                    let contactname = vals[key].username;
                    if(contactname === username)
                    {
                        return;
                    }
                        $('.contacts__list').append('<div class="contacts__contact"><div class="contacts__userpic"></div><div class="contacts__username" data-username="'+ contactname +'">' + contactname + '</div></div>');
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

            $('.chat__messageWrapper').append('<div class="'+ type +'">\n' +
                '<div class="message__body">\n' +
                '    <div class="message__userpic"></div>\n' +
                '    <div class="message__text">' + text + '</div>\n' +
                '</div>\n' +
                '</div>');
        });


    }

    $('.chat__sendButton').on('click', function(){
        let text = $('.chat__input').val();
        $('.chat__input').val('');
        let date = new Date(),
        day = date.getDate(),
        month = date.getMonth(),
        year = date.getFullYear(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        milliseconds = date.getMilliseconds(),
        contact = $('.chat__username').attr('data-username'),
        type = localStorage.getItem('message-direction'),
        message = {
            from: username,
            to: contact,
            text: text,
            date: day + ':' + month + ':' + year,
            time: hours + ':' + minutes + ':' + minutes + ':' + seconds
        }
        if(type == 'first'){
            let messages = database.ref('messages/' + username + '--' + contact);
            messages.push(message);

        }else{
            let messagesSwitch = database.ref('messages/' + contact + '--' + username);
            messagesSwitch.push(message);
        }


    });




    $('.chat__makeCall').on('click', function(){

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

            // $('.videochat__close').on('click', function(){
            //     closeCallWindow();
            //     let contactName = $('.chat__username').text();
            //     callCanceled = database.ref(contactName +'/call--canceled');
            //     let canceled = {
            //         time: '13:55'
            //     }
            //     callCanceled.push(canceled);
            //     callRequest.remove();
            // });

            $('.videochat__close').on('click', function(){
                closeCallWindow();
                if($('.videochat__requestWindow').length){
                    callRefused = database.ref(contact + '/call--refused');
                    let refused = {
                        time: '13:55'
                    }
                    callRefused.push(refused);
                }else{
                    peer.removeStream(stream);
                    peer.destroy();
                    console.log('anruf beendet!!!');
                    callFinished = database.ref(contact +'/call--finished');
                    let finished = {
                        time: '13:55'
                    }
                    callFinished.push(finished);
                }


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



            callAccept.remove();
            callRequest.remove();


        }

        callFinished.on('value', gotCallFinished, errData);

        peer.on('stream', function(stream){
            let video = document.createElement('video');
            $('.videochat__body').append(video);

            console.log(stream);

            video.srcObject = stream;
            video.play();



            //
            // callFinished.on('value', function(data){
            //     closeCallWindow();
            //     callFinished.remove();
            // }, errData);

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
        localStorage.setItem('init', 'false');
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

            // $('.videochat__close').on('click', function(){
            //     closeCallWindow();
            //     callRefused = database.ref(caller + '/call--refused');
            //     let refused = {
            //         time: '13:55'
            //     }
            //     callRefused.push(refused);
            // });

            $('.videochat__close').on('click', function(){
                closeCallWindow();
                if($('.videochat__requestWindow').length){
                    callRefused = database.ref(caller + '/call--refused');
                    let refused = {
                        time: '13:55'
                    }
                    callRefused.push(refused);
                }else{
                    peer.removeStream(stream);
                    peer.destroy();
                    console.log('anruf beendet!!!');
                    callFinished = database.ref(caller +'/call--finished');
                    let finished = {
                        time: '13:55'
                    }
                    callFinished.push(finished);
                }


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

                let Peer = require('simple-peer');
                let peer = new Peer({
                    initiator: localStorage.getItem('init') === 'true',
                    trickle: false,
                    stream: stream
                });

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

                callFinished.on('value', gotCallFinished, errData);
            });

        }

    }

    function gotCallFinished(data){
        let vals = data.val();

        if(vals != null){
            console.log('call FInished');
            closeCallWindow();
            callFinished.remove();
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