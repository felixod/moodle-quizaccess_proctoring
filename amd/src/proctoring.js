define(['jquery', 'core/ajax', 'core/notification', 'core/pubsub'], function ($, Ajax, Notification, PubSub) {
    
    var pictureCounter = 0;
    var first_call_delay = 3000;
    var takepicture_delay = 30000;
    return {

        
        setup: function (props) {

            // skip for summary page
            if(document.getElementById("page-mod-quiz-summary") != null && document.getElementById("page-mod-quiz-summary").innerHTML.length){
                return false;
            }
            if(document.getElementById("page-mod-quiz-review") != null && document.getElementById("page-mod-quiz-review").innerHTML.length){
                return false;
            }

            var width = 230;    // We will scale the photo width to this
            var height = 0;     // This will be computed based on the input stream
            var streaming = false;
            var data = null;

            // $('.info').prepend('<div class="text-right"><video id="video">Video stream not available.</video><canvas id="canvas" style="display:none;"></canvas> <div class="output" style="display:none;"><img id="photo" alt="The screen capture will appear in this box."/></div> </div>');
            $('.info').append('<div class="text-center" style="margin-top:50px"><h3 class="no text-left">Picture</h3> <br/><video id="video">Video stream not available.</video><canvas id="canvas" style="display:none;"></canvas> <div class="output" style="display:none;"><img id="photo" alt="The screen capture will appear in this box."/></div> </div>');

            var video = document.getElementById('video');
            var canvas = document.getElementById('canvas');
            var photo = document.getElementById('photo');

            var clearphoto = function () {
                var context = canvas.getContext('2d');
                context.fillStyle = "#AAA";
                context.fillRect(0, 0, canvas.width, canvas.height);
                data = canvas.toDataURL('image/png');
                photo.setAttribute('src', data);
            }

            var takepicture = function () {
                var context = canvas.getContext('2d');
                if (width && height) {
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(video, 0, 0, width, height);
                    data = canvas.toDataURL('image/png');
                    photo.setAttribute('src', data);
                    props.webcampicture = data;
                    
                    var wsfunction = 'quizaccess_proctoring_send_camshot';
                    var params = {
                        'courseid': props.courseid,
                        'screenshotid': props.id,
                        'quizid': props.quizid,
                        'webcampicture': data,
                    };

                    var request = {
                        methodname: wsfunction,
                        args: params
                    };

                    Ajax.call([request])[0].done(function (data) {
                        if (data.warnings.length < 1) {
                            // console.log("screenshot:", pictureCounter,data);
                            pictureCounter++;
                        } else {
                            Notification.addNotification({
                                message: 'Something went wrong during taking screenshot.',
                                type: 'error'
                            });
                        }
                    }).fail(Notification.exception);
                } else {
                    clearphoto();
                }
            }

            navigator.mediaDevices.getUserMedia({video: true, audio: false})
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function (err) {
                    console.log("An error occurred: " + err);
                });

            video.addEventListener('canplay', function (ev) {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);
                    // Firefox currently has a bug where the height can't be read from
                    // the video, so we will make assumptions if this happens.
                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }
                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);
            // allow to click picture
            // video.addEventListener('click', function (ev) {
            //     takepicture();
            //     ev.preventDefault();
            // }, false);

            // takepicture();
            setTimeout(takepicture, first_call_delay);
            setInterval(takepicture, takepicture_delay);

        },
        init: function (props) {
            var width = 320;    // We will scale the photo width to this
            var height = 0;     // This will be computed based on the input stream
            var streaming = false;
            var video = null;
            var canvas = null;
            var photo = null;
            var data = null;

            function startup() {
                video = document.getElementById('video');
                canvas = document.getElementById('canvas');
                photo = document.getElementById('photo');

                navigator.mediaDevices.getUserMedia({video: true, audio: false})
                    .then(function (stream) {
                        video.srcObject = stream;
                        video.play();
                    })
                    .catch(function (err) {
                        console.log("An error occurred: " + err);
                    });

                video.addEventListener('canplay', function (ev) {
                    if (!streaming) {
                        height = video.videoHeight / (video.videoWidth / width);
                        // Firefox currently has a bug where the height can't be read from
                        // the video, so we will make assumptions if this happens.
                        if (isNaN(height)) {
                            height = width / (4 / 3);
                        }
                        video.setAttribute('width', width);
                        video.setAttribute('height', height);
                        canvas.setAttribute('width', width);
                        canvas.setAttribute('height', height);
                        streaming = true;
                    }
                }, false);

                // allow to click picture
                // video.addEventListener('click', function (ev) {
                //     takepicture();
                //     ev.preventDefault();
                // }, false);

                clearphoto();
            }

            function clearphoto() {
                var context = canvas.getContext('2d');
                context.fillStyle = "#AAA";
                context.fillRect(0, 0, canvas.width, canvas.height);

                data = canvas.toDataURL('image/png');
                photo.setAttribute('src', data);
            }

            function takepicture() {
                var context = canvas.getContext('2d');
                if (width && height) {
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(video, 0, 0, width, height);
                    data = canvas.toDataURL('image/png');
                    photo.setAttribute('src', data);
                    // console.log(props);

                    var wsfunction = 'quizaccess_proctoring_send_camshot';
                    var params = {
                        'courseid': props.courseid,
                        'screenshotid': props.id,
                        'quizid': props.quizid,
                        'webcampicture': data,
                    };

                    var request = {
                        methodname: wsfunction,
                        args: params
                    };

                    Ajax.call([request])[0].done(function (data) {
                        if (data.warnings.length < 1) {
                            // console.log(data);
                        } else {
                            Notification.addNotification({
                                message: 'Something went wrong during taking screenshot.',
                                type: 'error'
                            });
                        }
                    }).fail(Notification.exception);

                } else {
                    clearphoto();
                }
            }

            startup();
            return data;
        }
    };
});

$(function(){
    $('#id_submitbutton').prop( "disabled", true );

    $('#id_proctoring').on('change', function(){
        if(this.checked) { 
            $('#id_submitbutton').prop( "disabled", false );
        }else{
            $('#id_submitbutton').prop( "disabled", true );
        }
    })
});