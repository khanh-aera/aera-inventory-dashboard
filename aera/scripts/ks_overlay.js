$(() => {
  let closed = false;
  $(window).scroll(() => {
    const top = $('#blurb')[0].getBoundingClientRect().top;
    if (top < $(window).height() && !closed) {
      $("#ks_c2a").removeClass('hidden');
    }
  });
  $('#ks_c2a').click(() => {
    window.open('https://www.kickstarter.com/projects/superlative/sb01-analog-synthesizer-of-the-future?utm_source=website&utm_medium=popout&utm_campaign=KS_campaign');
  })
  $("#ks_icon").click((event) => {
    closed = true;
    event.stopPropagation();
    $("#ks_c2a").addClass('hidden');
  });
});