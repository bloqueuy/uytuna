// ! DEBOUNCE

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
} // debounce



// ! VIDEO

let $video;
let $videoContainer;
let $videoHolder;
let $videoSrcDesktop;
let $videoSrcMobile;
let $videoSrc;

function checkMedia() {
    if (!$video || !$videoContainer || !$videoHolder) return;

    if (window.matchMedia("(min-width: 980px)").matches) {

        if ($video.innerHTML !== '' && $videoSrc) {
            if ($videoSrc.classList.contains('c-video__src--mobile')) {
                $video.innerHTML = "<source class='c-video__src c-video__src--desktop js-videoSrc' src='" + $videoSrcDesktop +  "' type='video/mp4'>";
                $videoSrc = document.querySelector('.js-videoSrc');
                $video.load();
            }

        } else {
            $video.innerHTML = "<source class='c-video__src c-video__src--desktop js-videoSrc' src='" + $videoSrcDesktop +  "' type='video/mp4'>";
            $videoSrc = document.querySelector('.js-videoSrc');
            if ($videoSrc) {
                $video.load();
            }
        }

    } else {

        if ($video.innerHTML !== '' && $videoSrc) {
            if ($videoSrc.classList.contains('c-video__src--desktop')) {
                $video.innerHTML = "<source class='c-video__src c-video__src--mobile js-videoSrc' src='" + $videoSrcMobile +  "' type='video/mp4'>";
                $videoSrc = document.querySelector('.js-videoSrc');
                $video.load();
            }

        } else {
            $video.innerHTML = "<source class='c-video__src c-video__src--mobile js-videoSrc' src='" + $videoSrcMobile +  "' type='video/mp4'>";
            $videoSrc = document.querySelector('.js-videoSrc');
            if ($videoSrc) {
                $video.load();
            }
        }

    }
}

function initVideoElements() {
    $video = document.querySelector('.js-video__video');
    const videoContainerId = 'js-videoContainer';
    $videoContainer = document.getElementById(videoContainerId);
    
    if (!$video || !$videoContainer) {
        console.error('Video elements not found');
        return false;
    }
    
    $videoHolder = $videoContainer.querySelector('.js-video');
    
    if (!$videoHolder) {
        console.error('Video holder not found');
        return false;
    }
    
    $videoSrcDesktop = $videoHolder.getAttribute('data-src-desktop');
    $videoSrcMobile = $videoHolder.getAttribute('data-src-mobile');
    
    return true;
}

var videoDebounce = debounce(function () {
    checkMedia();
}, 300);

window.addEventListener('resize', videoDebounce);



// VIDEO

function videoInit() {
    // Initialize video elements
    if (!initVideoElements()) {
        return;
    }

    // Set up video source first
    checkMedia();

    // Ensure video is always muted
    $video.muted = true;

    // VIDEO Events

    $video.onloadstart = () => {
        $videoContainer.classList.add('is-loading')
        // console.log('Loading...')
    }
    
    $video.onloadedmetadata = () => {
        // console.log('Metadata loaded')
    }
    
    $video.oncanplay = () => {
        // console.log('Can play')
    }
    
    $video.oncanplaythrough = () => {
        // console.log('Can play through')
        $videoContainer.classList.remove('is-loading')
        // Ensure video is muted before playing
        $video.muted = true;
        $video.play().catch(err => {
            console.error('Error playing video:', err);
        })
    }
    
    $video.onplaying = () => {
        $videoContainer.classList.remove('is-loading')
        $videoContainer.classList.remove('has-error')
        $videoContainer.classList.add('is-playing')
        // console.log('Playing...')
    }
    
    $video.onwaiting = () => {
        // Only show loading if video is not already playing
        // This prevents spinner from appearing during normal buffering
        if (!$videoContainer.classList.contains('is-playing')) {
            $videoContainer.classList.add('is-loading')
        }
        // console.log('Waiting...')
    }
    
    $video.onprogress = () => {
        // Don't add loading on progress, it's normal
        // console.log('Progress...')
    }
    
    $video.onerror = (e) => {
        $videoContainer.classList.add('has-error')
        $videoContainer.classList.remove('is-playing')
        $videoContainer.classList.remove('is-loading')
        console.error('Video error:', e, $video.error)
    }
    
    $video.onabort = () => {
        $videoContainer.classList.add('has-error')
        $videoContainer.classList.remove('is-playing')
        $videoContainer.classList.remove('is-loading')
        console.warn('Video aborted')
    }

    // Functions

    function playVideo() {
        if (!$video || !$videoContainer) return;
        // console.log('Func: Play')
        // Only show loading if video is not already playing
        if (!$videoContainer.classList.contains('is-playing')) {
            $videoContainer.classList.add('is-loading')
        }
        $videoContainer.classList.remove('is-paused')
        // Ensure video is muted before playing
        $video.muted = true;
        $video.play().catch(err => {
            console.error('Error playing video:', err);
        })
    } // playVideo

    // function pauseVideo() {
    //     // console.log('Func: Pause')
    //     $video.pause()
    //     $videoContainer.classList.remove('is-playing')
    //     $videoContainer.classList.add('is-paused')

    // } // pauseVideo


    // Ensure video stays muted (prevent unmuting)
    $video.addEventListener('volumechange', () => {
        if (!$video.muted) {
            $video.muted = true;
        }
    });

    // Try to play video after a short delay to ensure source is loaded
    setTimeout(() => {
        if ($video.readyState >= 2) { // HAVE_CURRENT_DATA
            playVideo();
        }
    }, 100);

} // videoInit






/* ***** TRIGGERS ***** */

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', videoInit);
} else {
    // DOM is already ready
    videoInit();
}