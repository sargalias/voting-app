const flashMessagesDiv = document.getElementById('flash-messages');
const errorMessagesDiv = document.getElementById('error-messages');

const initialDelay = 3000;
const numSteps = 20;
const animationTime = 1000;
const step = 1 / numSteps;

if (flashMessagesDiv) {
    setTimeout(() => {
        fadeOut(flashMessagesDiv);
    }, 4000);
}

if (errorMessagesDiv) {
    setTimeout(() => {
        fadeOut(errorMessagesDiv);
    }, 4000);
}

function fadeOut(el) {
    let fading = setInterval(function() {
        if (!el.style.opacity) {
            el.style.opacity = 1;
        } else if (el.style.opacity < step) {
            clearInterval(fading);
            el.style.display = 'none';
        } else {
            el.style.opacity = parseFloat(el.style.opacity) - step;
        }
    }, animationTime / numSteps);
}
