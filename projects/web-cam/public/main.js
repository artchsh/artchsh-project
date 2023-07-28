'use strict';

const constraints = window.constraints = {
    audio: false,
    video: true
};

function handleSuccess(stream) {
    const video = document.querySelector('video')
    window.stream = stream
    video.srcObject = stream
}

function handleError(error) {
    if (error.name === 'OverconstrainedError') {
        const v = constraints.video
        console.error(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`)
    } else if (error.name === 'NotAllowedError') {
        console.error('Grant permissions!')
    }
    console.error(`getUserMedia error: ${error.name}`, error)
}

async function init(e) {
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            handleSuccess(stream)
            e.target.remove()
            document.getElementById("gum-local").style.display = 'block'
        } catch (e) {
            handleError(e)
        }
    } else { errorMsg('This feature is not supported in your browser!')}

}

document.querySelector('#showVideo').addEventListener('click', e => init(e))