

import '././scss/main.scss';
import $ from "jquery";
require('./views/audio/meow.mp3');
import firebase from 'firebase/app';
import 'firebase/database';
import { firebaseConfig } from "./modules/firebase.js"



navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.getMedia({video: true, audio: false}, function(stream){


    firebase.initializeApp(firebaseConfig);



    let database = firebase.database();
    let users = database.ref('users');
    let username = localStorage.getItem('username');
    let contacts = database.ref(username + '/contacts');
    let callRequest = database.ref(username + '/call--request');
    let callAccept = database.ref(username +'/call--accept');
    let vendorUrl = window.URL || window.webkitURL;

    initializeUI();

    // users.push(user);

    function initializeUI(){
        // $('.sidebar__username').text(username);
        contacts.on('value', function(data){
            let vals = data.val();

            if(vals != null){

                let keys = Object.keys(vals);
                console.log(keys);

                keys.forEach(function(key){
                    let username = vals[key].username;
                    $('.contacts__list').append('<div class="contacts__contact"><div class="contacts__userpic"></div><div class="contacts__username" data-username="'+ username +'">' + username + '</div></div>');
                });
            }
        }, errData());
    }
    $('.contacts__contact').on('click', function(){
        console.log('fgh');
       let username = $(this).find('contacts__username').attr('data-username');
        alert(username);
       $('.chat__username').text(username);
    });

    $('.chat__header').on('click', function(){

        // create new Peer Object

        // Create Code

        // push code to database
        alert('geht los');

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
                from: 'twinPete93',
                to: 'cuteCat93'
            }

            callRequest = database.ref('cuteCat93/call--request');

            callRequest.push(callRequestData);
        });


        callAccept.on('value', gotCallAccept, errData);

        function gotCallAccept(data){

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


    function gotCallRequest(data){
        console.log('hier kommt der Code');
        console.log(data.val());

        let vals = data.val();

        if(vals != null){
            let keys = Object.keys(vals);
            console.log(keys);
            console.log(vals[keys[0]].code);
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

            $('.videochat__accept').on('click', function(){
                let code = JSON.parse(requestCode);
                peer.signal(code);

                peer.on('signal', function(data){
                    console.log('scnd hit');

                    let accept = {
                        from: 'cat',
                        to: 'twinPete93',
                        code: JSON.stringify(data)
                    }
                    callAccept = database.ref('twinPete93/call--accept');
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






    $('.connect').on('click', function(){
        let data = $('.otherId').val();
        let otherId = JSON.parse(data);
        peer.signal(otherId);
    });

    $('.sendMessage').on('click', function(){
        let youreMessage = $('.messageText').val();
        console.log(youreMessage);
        peer.send(youreMessage);
    });

    peer.on('data', function(data){
        console.log('message recieved');
        let audio = new Audio('./res/meow.mp3');
        audio.play();
        $('.message').append(data + '\n');
    });



}, function(err){
    console.log(err);
});