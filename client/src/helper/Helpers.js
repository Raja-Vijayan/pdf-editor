export const fontList = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Times",
  "Courier New",
  "Courier",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact"
];

export const generateRandom4DigitNumber = () => {
  return Math.floor(Math.random() * 9000) + 1000;
}

export const CONNECTION_REFUSED = "connection refused";

export const formatTimestamp = (timestamp) => {
  let date = timestamp.split('T')[0];
  let time = timestamp.split('T')[1].split('.')[0];
  return `${date} ${time}`;
};

export const getPdfPage = (index, JSX) => {
  if (!JSX) return '';


  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = JSX;

  const fontLink = tempContainer.querySelector('link[href*="fonts.googleapis.com"]');
  if (fontLink) {
    const existingLink = document.querySelector('link[href*="fonts.googleapis.com"]');
    if (existingLink) {
      existingLink.remove();
    }
    document.head.appendChild(fontLink);
  }

  const selectedPage = tempContainer.querySelector(`#pf-${index}`);

  if (!selectedPage) {
    return '';
  }

  Object.assign(selectedPage.style, {
    webkitUserSelect: 'none',
    mozUserSelect: 'none',
    msUserSelect: 'none',
  });

  return selectedPage.outerHTML;
};
