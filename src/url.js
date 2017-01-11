/** global window, document */

const $URL = window.URL;
const hasNativeURL = 'URL' in window &&
  typeof $URL === 'function';

export default function URL(initialHref = '') {
  let url;
  if (hasNativeURL) {
    url = new $URL(initialHref);
  } else {
    url = document.createElement('a');
    url.href = initialHref;
  }
  return url;
}
