$(document).ready(function() {
    var socket = io.connect('http://localhost:3000/wall');

    socket.on('connect', function() {
        console.log('connected...' + socket.id);
    })

    socket.on('chat', function(data){
        $('.view').append('<p>'+ data +'</p>');
        $('.loading').hide();
    });

    $('.inputMessage').on('keydown', function(event) {
        if(event.keyCode == 13) {
            var message = $(this).val();

            // send to socket
            socket.emit('chat', message);
            $(this).val('');
        }
    })

    $('.loading').hide();

    function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
        navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
    }

    var mediaConstraints = {
        audio: true
    };

    $('.start-recording').on('click', function() {
        this.disabled = true;
        captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
    })

    $('.stop-recording').on('click', function() {
        this.disabled = true;
        mediaRecorder.stop();
        mediaRecorder.stream.stop();

        $('.start-recording').attr('disabled', false);
    })

    var mediaRecorder;

    function onMediaSuccess(stream) {
        var audio = document.createElement('audio');
        audio = mergeProps(audio, {
            controls: true,
            muted: true,
            src: URL.createObjectURL(stream)
        });
        audio.play();
        mediaRecorder = new MediaStreamRecorder(stream);
        mediaRecorder.stream = stream;
        mediaRecorder.recorderType = StereoAudioRecorder;
        mediaRecorder.mimeType = 'audio/wav';
        mediaRecorder.audioChannels = 1;
        // Record success
        mediaRecorder.ondataavailable = function(blob) {
            // console.log(blob);
            var blobURL = URL.createObjectURL(blob);

            // upload to server
            var fileType = 'audio';
            var fileName = 'audio.wav';
            var formData = new FormData();
            formData.append(fileType + '-filename', fileName);
            formData.append(fileType + '-blob', blob);

            var request = new XMLHttpRequest(),
                progressBar = document.getElementById("progress"),
                display = document.getElementById("display");

            request.onreadystatechange = function () {
                if (request.readyState == 1) {
                    $('.loading').show();
                }

                if (request.readyState == 4 && request.status == 200) {
                    var resp = JSON.parse(request.responseText);

                    // append to text input
                    $('.inputMessage').val(resp.text);

                    $('.loading').hide();
                }
            };
            request.open('POST', 'process.php', true);
            request.send(formData);
        };
        mediaRecorder.start(5000);

        $('.stop-recording').attr('disabled', false);
    }

    function onMediaError(e) {
        console.error('media error', e);
    }
});
