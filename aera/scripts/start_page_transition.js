
$(async () => {
  const title = $('#title_click');

  // Open start page
  let startPageOpened = false;
  async function hideStartPage() {

    // Only open the window once.
    if (startPageOpened) return;
    startPageOpened = true;

    // .disappearing_holder are the topbar elements that are hidden ('design company...')
    const disappearing = $('.disappearing_holder');
    for (let i = 0; i < disappearing.length; i++) {
      disappearing[i].classList.add('hidden');
    }

    // Title moves up and changes to exclusion.
    title.addClass('hidden');
    title.addClass('exclusion');

    // Product page comes into view (was positioned at -100vh, now 0vh)
    $('#product_page').removeClass('hidden');

    // Move the title up and position the background spacing element.
    const eltHeight = title.height();
    const paddingTop = 60 /* topbar height */ + 60 /* element padding height */;
    const paddingBottom = 30;
    // Instead do bottom + height

    // First, position the title based on the "top" property
    // This offset takes scroll into account.
    const offset = Math.abs(title.offset().top - title.position().top);
    let top = title.offset().top + offset;

    // (reset forst, since transitions only apply to the same style.)
    title.css('bottom', 'auto');
    title.css('top', top + 'px');
    await sleep(10);

    // Then, figure out where we *should* be positioned. 
    title.css('top', paddingTop + offset + 'px');

    // Finally, make the background color the correct height.
    const height = eltHeight + paddingTop + paddingBottom;
    $('#appearning_title_bg').css('height', height + 'px');
    $('#sticky_holder').addClass('exclusion');

    // For some reason, -webkit-overflow-scrolling makes some divs not render correctly. So, remove it.
    $('#start_holder').addClass('no_touch_scrolling');


    function makeBodyScrollable() {

      // Once we've finished scrolling up, deal with some scrolling/overflow/heigth stuff.
      $(document.body).removeClass('startPage');
      $(document.body).removeClass('no_scroll');
      $('#background_vid').addClass('hidden');
      $('#start_holder').addClass('no_scroll');

      // Finally, make these not links anymore.
      $('.click_to_start').removeClass('link');
      $('.click_to_start').removeClass('click_to_start');
    }
    await sleep(500);
    makeBodyScrollable();
  }


  // If we have the url param "skipstart", then skip the start page.
  const urlParams = new URLSearchParams(window.location.search.slice(1));
  if (urlParams.has('skipstart')) {
    window.history.replaceState(null, null, window.location.pathname);
    $('body').addClass('notransition');
    hideStartPage();

    await sleep(500);
    $('body').removeClass('notransition');
  }

  // Make sure that the background layer and the title are always the same size.
  $(window).on('resize', () => debounce(() => {
    const paddingTop = 60 /* topbar height */ + 60 /* element padding height */;
    const paddingBottom = 30;;
    const eltHeight = $('#title_click').height();
    const height = paddingTop + eltHeight + paddingBottom;
    $('#appearning_title_bg').css('height', height + 'px');
  }, 250)());

  const startElts = $('.click_to_start');
  for (let i = 0; i < startElts.length; i++) {
    startElts[i].onclick = hideStartPage;
  }
});