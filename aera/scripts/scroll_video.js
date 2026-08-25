$(() => {
  let shouldPlay = true;
  const video = $('#exploded_vid');
  const overlay = $('#exploded_overlay');
  const height = video.height();
  let windowHeight = $(window).height();
  // Stop the video when it gets halfway, if we're playing from the beginning
  video.on("ended", () => overlay.removeClass('hidden'));
  const scrollVideo = async (e) => {
    const vidTop = video[0].getBoundingClientRect().top;

    // If we're out of sight on top, restart the video.
    const outOfSightOnBottom = vidTop > height;
    const topInFrame = vidTop < windowHeight && vidTop > 0;

    // If we're above the window
    if (outOfSightOnBottom && !topInFrame && !shouldPlay) {
      video[0].currentTime = 0;
      shouldPlay = true;
      overlay.addClass('hidden')
    }
    if (topInFrame && shouldPlay) {
      overlay.addClass('hidden')
      await sleep(500);
      video[0].play();
      shouldPlay = false;
    }
  }
  window.addEventListener('touchmove', () => debounce(() => scrollVideo(), 250)());
  window.addEventListener('scroll', () => debounce(() => scrollVideo(), 250)());
  window.addEventListener('resize', () => windowHeight = $(window).height());
});
