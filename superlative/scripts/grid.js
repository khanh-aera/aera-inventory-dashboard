$(() => {
  const urlParams = new URLSearchParams(window.location.search.slice(1));

  if (urlParams.has('grid')) {
    const cols = window.innerWidth > 1024 ? 16 : 4;

    const gutterWidth = cols == 4 ? 15 : 0;
    // const gutterWidth = urlParams.get('gutter')
    const holder = document.createElement('div');
    holder.style.cssText = `
    width: 100vw;
    height: 100vh;
    position: fixed;
    pointer-events: none;
    z-index: 5;
    display: grid;
    column-gap:${gutterWidth}px;
    padding: 0px ${gutterWidth}px;
    box-sizing: border-box;
    grid-template-columns: repeat(${cols}, 1fr);
  `;
    document.body.insertBefore(holder, document.body.firstChild);
    for (let i = 0; i < parseInt(cols); i++) {
      const div = document.createElement('div');
      div.style.cssText = `
      border: 1px solid rgba(255, 152, 0, 0.3); 
      border-bottom: 0; 
      border-top: 0;`;
      holder.append(div);
    }
  }
});