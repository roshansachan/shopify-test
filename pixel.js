(function () {

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  ``
  const extractOrderIdFromUrl = (url) => {
    const match = url.match(/track\/(\d+)/);
    return match ? match[1] : null;
  };

  function setCookie(name, value, days, domain) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; domain=${domain}; Secure; SameSite=Lax`;
  }
  
  function onLoadCallback() {
    const glImpId = getQueryParam('gl_imp_id'); // Reading 'gl_imp_id' from query string
    if (glImpId) {
      setCookie('gl_imp_id', glImpId, 7, 'ondigitalocean.app'); // Setting cookie with a 7-day expiration
      console.log(`Cookie 'gl_imp_id' set with value: ${glImpId}`);
    }
    const orderId = extractOrderIdFromUrl(window.location.href); // Using window.location.href for dynamic URL
    if (orderId) {
      setCookie('order_id', orderId, 7, 'ondigitalocean.app'); // Setting cookie with a 7-day expiration
    }
  }
  window.addEventListener('load', onLoadCallback);
})();
