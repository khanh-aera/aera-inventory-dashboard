
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * 
 * Taken from https://davidwalsh.name/javascript-debounce-function
 * 
 */
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Helper function to "detect mobile" (ie, small page width)
function isMob() {
  return window.innerWidth <= 1024;
}

// Sleep for some number of seconds.
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


$(() => {
  // Make sure that we start on the top of the page every time.
  const scrollTop = () => {
    $('html, body').animate({
      scrollTop: 0
    }, 1000, 'easeInOutExpo');
  }
  window.addEventListener("beforeunload", scrollTop, false);

  // Handler for 'back to top" button.
  document.getElementById('back_to_top').onclick = scrollTop;


  // Click handlers on mobile for things that just needed hover on desktop
  $('.subscribe .link').on('click', function () {
    const email = $(this).parent().find('.email')[0];
    const emailShown = email.classList.contains('shown');
    if (emailShown) {
      email.classList.remove('shown');
    } else {
      email.classList.add('shown');
    }
  });
});
