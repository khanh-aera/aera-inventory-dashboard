// Emulate the linking to a specific hashed url (id on the page), but without the '#', which does weird things when we put the link on instagram :)
const urlParams = new URLSearchParams(window.location.search.slice(1));
if (urlParams.has('careers')) {
  window.location.hash = "careers";
}