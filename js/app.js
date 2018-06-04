(function () {

    var output = PUBNUB.$('output'),
        output2 = PUBNUB.$('output2'),
        input = PUBNUB.$('input'),
        button = PUBNUB.$('button'),
        avatar = PUBNUB.$('avatar'),
        presence = PUBNUB.$('presence');

    var channel = 'mchat';

    //     Assign a random avatar in random color
    //    avatar.className = 'face-' + ((Math.random() * 13 + 1) >>> 0) + ' color-' + ((Math.random() * 10 + 1) >>> 0);

    var p = PUBNUB.init({
        subscribe_key: 'sub-c-f762fb78-2724-11e4-a4df-02ee2ddab7fe',
        publish_key: 'pub-c-156a6d5f-22bd-4a13-848d-b5b4d4b36695',
        ssl: true
    });




    p.subscribe({
        channel: channel,
        callback: function (m) {
            output.innerHTML = m.text.replace(/[<>]/ig, '') + '</span></p>' + '<br>' + output.innerHTML,
            
            output2.innerHTML = m.text.replace(/[<>]/ig, '') + '</span></p>' + '<br>' + output2.innerHTML;
            //            output.innerHTML = '<p><i class="' + m.avatar + '"></i><span>' +  m.text.replace( /[<>]/ig, '' ) + '</span></p>' + output.innerHTML; 
            //        },
            //        presence: function(m){
            //            if(m.occupancy > 1) {
            //                presence.textContent = m.occupancy + ' people online';
            //            } 
        }
    });

    p.bind('keyup', input, function (e) {
        (e.keyCode || e.charCode) === 13 && publish()
    });

    p.bind('click', button, publish);

    output.style.fontWeight = "900";

    function publish() {
        p.publish({
            channel: channel,
            sendByPost: true,
            message: {
                text: input.value
            },
            //            message : {avatar: avatar.className, text: input.value}, 
            x: (input.value = '')
        });
    }


})();



(function () {

    var PUBNUB_demo = PUBNUB.init({
        subscribe_key: 'sub-c-f762fb78-2724-11e4-a4df-02ee2ddab7fe',
        publish_key: 'pub-c-156a6d5f-22bd-4a13-848d-b5b4d4b36695',
    });

    window.pubnub.subscribe({
        channel: "image-demo",
        message: function (m) { //On receipt of a message, interpret it as a base-64 encoded image and display it on page.
            var image = document.getElementById("outputi");
            image.src = m;
        },
        error: function (error) {
            console.log(error)
        }
    });


    function hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }







    if (hasGetUserMedia()) {
        console.log("We're good to go!")
    } else {
        alert('getUserMedia() is not supported in your browser. Using default image.');
        var def = document.getElementById("defaultImg");
        def.src = './cloud-red.jpg';
        def.width = 240;
        def.height = 180;
        var video = document.getElementById("video");
        video.height = 0;
    }



    // Put event listeners into place
    window.addEventListener("DOMContentLoaded", function () {
        // Grab elements, create settings, etc.
        var canvas = document.getElementById("canvas"),
            context = canvas.getContext("2d"),
            video = document.getElementById("video"),
            videoObj = {
                "video": true
            },
            errBack = function (error) {
                console.log("Video capture error: ", error.code);
            };

        // Put video listeners into place
        if (navigator.getUserMedia) { // Standard
            navigator.getUserMedia(videoObj, function (stream) {
                video.src = stream;
                video.play();
            }, errBack);
        } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
            navigator.webkitGetUserMedia(videoObj, function (stream) {
                video.src = window.webkitURL.createObjectURL(stream);
                video.play();
            }, errBack);
        } else if (navigator.mozGetUserMedia) { // Firefox-prefixed
            navigator.mozGetUserMedia(videoObj, function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, errBack);
        }
    }, false);



    //Send snapshot of video on click.
    document.getElementById("snap").addEventListener("click", function () {
        var canvas = document.getElementById("canvas"),
            context = canvas.getContext("2d");
        if (hasGetUserMedia()) {
            var video = document.getElementById("video");
            context.drawImage(video, 0, 0, 240, 180);
        } else {
            var def = document.getElementById("defaultImg");
            context.drawImage(def, 0, 0, 240, 180);
        }
    });




    //Compress beneath max message size in kb. Returns null if compression can't get image small enough.
    function compressImage(canvas, size) {
        var compression = 1.0;
        while (compression > 0.01) {
            var dataURL = canvas.toDataURL('image/jpeg', compression);
            if (dataURL.length / 1012 < size) return dataURL;
            if (compression <= 0.1) {
                compression -= 0.01;
            } else {
                compression -= 0.1;
            }
        }
        return null;
    }



    document.getElementById("snap").addEventListener("click", function () {
        //load image as specified above.

        //Base064 Encode & compress below 20 kb
        var dataURL = compressImage(canvas, 20);

        if (dataURL == null) {
            alert("We couldn't compress the image small enough");
            return;
        }
    });



    document.getElementById("snap").addEventListener("click", function () {
        //Get the image as described above

        //Base064 Encode & compress below 20 kb as described above

        //Send the image with PubNub!
        window.pubnub.publish({
            channel: "image-demo",
            message: dataURL,
            error: function (error) {
                console.log(error)
            }
        });

    });



    //globals so that a new message will reset the destruction cycle
    var countdown
    var timer

    //message destruction after 10 seconds
    function destroyImage(image) {
        var dstrMsg = document.getElementById("dstrMsg");
        dstrMsg.innerHTML = ("Destroying image in..." + countdown);
        countdown = 10;
        clearTimeout(timer);

        function destroy() {
            if (countdown > 1) {
                countdown--;
                dstrMsg.innerHTML = ("Destroying image in..." + countdown);
                timer = setTimeout(destroy, 1000);
            } else {
                image.src = "";
                dstrMsg.innerHTML = ("The image here will self destruct after 10 seconds");
            }
        }
        timer = setTimeout(destroy, 1000);
    }



    //Subscribe to image-demo channel
    window.pubnub.subscribe({
        channel: "image-demo",
        message: function (m) { //On receipt of a message, interpret it as a Base-64 encoded image and display it on page.
            var image = document.getElementById("output");
            image.src = m;
            destroyImage(image); // <-- INSERT THIS LINE HERE
        },
        error: function (error) {
            console.log(error)
        }
    });


})();
