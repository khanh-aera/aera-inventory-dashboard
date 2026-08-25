$(() => {

  // Elements that are labeled to "stick" when scrolled up.
  const stickyElts = $('.sticky');
  // Holder for the labels once they're "stuck"
  const holder = $('#sticky_holder');
  // Newsletter div, where things stop scrolling.
  const newsletter = $('#newsletter');
  let eltsInHolder;
  const rem = 15;
  let mob = isMob();
  createStickyClones();

  // document.body.onscroll = () => showStickyElts();
  $(window).on('scroll', () => showStickyElts());
  $(window).on('resize', () => debounce(() => createStickyClones(), 250)());
  // document.body.onscroll = () => debounce(() => showStickyElts(), 1)();
  // window.addEventListener('resize', () => createStickyClones());


  function createStickyClones() {
    mob = isMob();
    holder.html('');
    // Duplicate all elements that we want to stick into the holder.
    stickyElts.each(function (i) {
      const node = $(this);
      const clone = node.clone();

      const leftOffset = node.offset().left;
      const width = node.width();

      clone.css('margin', `0px 0px 0px ${leftOffset}px`);
      clone.css('width', `${width}px`);

      const padLeft = window.getComputedStyle(this, null).getPropertyValue('padding-left');
      clone.css('padding-left', padLeft);

      //Make sure there's 0 padding between rows on stack.
      $(clone).find('>*').css('padding-bottom', 0);

      // Remove the sticky label, otherwise this will loop infinitely...
      clone.removeClass('sticky');

      // And hide them
      clone.addClass('sticky_hidden');
      holder.append(clone);
    });
    eltsInHolder = holder.children();
    showStickyElts();
    addMenuButtonHandlers();
  }

  function hideShow(hiddenElt, shownElt) {
    hiddenElt.addClass('sticky_hidden');
    shownElt.removeClass('sticky_hidden');
  }

  /**
   * When the page is scrolled, figure out which elements to hide/show
   **/
  function showStickyElts() {
    // Iterate over all the sticky elements. Compare the original element to the one in the holder.
    stickyElts.each(function (i) {
      const origElt = $(this);
      const origEltTop = origElt.offset().top;

      const eltInHolder = $(eltsInHolder[i]);
      const eltInHolderTop = eltInHolder.offset().top;

      // Horrible hack to make top bar always be in the sticky holder.
      const isTopBar = origElt.hasClass('topbar') || origElt.hasClass('topbar_mobile');

      // If we've scrolled down far enough:
      // 1) Show them in the overlay box.
      // 2) Hide them in the normal scroll.
      const mobShouldShow = (mob && origElt.hasClass('sticky_mobile')) || !mob;
      if (mobShouldShow && (origEltTop < eltInHolderTop) || isTopBar) {
        hideShow(origElt, eltInHolder);
      } else {
        hideShow(eltInHolder, origElt);
      }
    });
    const newsletterTop = newsletter[0].getBoundingClientRect().top;
    const stickyHeight = Math.max(holder.height(), 3 * rem);
    holder.css('top', Math.min(newsletterTop - stickyHeight - 3 * rem, 0) + 'px');
  }
  function addMenuButtonHandlers() {
    // Stuff for the mobile menus 
    // (has to happen after we've added *all* the menu buttons)
    $('.menu_button').on('click', () => {
      $('#nav').removeClass('hidden');
      $(document.body).addClass('no_scroll');
    });
    $('#x_button').on('click', () => {
      $('#nav').addClass('hidden');
      if (!$(document.body).hasClass('startPage')) {
        $(document.body).removeClass('no_scroll');
      }
    });
  }
});