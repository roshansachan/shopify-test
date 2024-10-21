(function () {
  const glance_GetCookie = (cookieName) => {
    const cookies = document.cookie.split(';');
    const res = cookies.filter((item) => {
      const length = item.split('=').length > 0;
      return length ? item.split('=')[0].trim() === cookieName.trim() : ''
    });
    return res.length > 0 ? res[0].split('=')[1] : null;
  };

  const glance_SetCookie = (name, value) => {
    const date = new Date();
    date.setTime(date.getTime() + 2592000000); // 30 days in milliseconds
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; Secure; SameSite=None;";
  };

  const glance_PostDetails = async (url, headers) => {
    await fetch(url, {
      method: "GET",
      headers,
    });
  };

  const glance_GetValue = (key, params) => {
    const value = params.has(key) ? params.get(key) : glance_GetCookie(key);
    if (key === 'gl_imp_id' && !value) return 'organic'; // Default to 'organic' if impId is not available
    return value;
  };


  function onLoadCallback() {
    const params = new URLSearchParams(window.location.search);
    const eventUrl = window.location.origin + window.location.pathname;

    const keys = [
      { key: 'gl_imp_id', apiKey: 'impId' },
      { key: 'gl_user_id', apiKey: 'userId' },
      { key: 'gl_glance_id', apiKey: 'glanceId' }
    ];
    const headerKeys = [{ key: 'oem', apiKey: 'X-API-KEY' }];

    // Extract orderId from the specific URL and set in cookie
    const orderId = params.get('orderId');
    if (orderId) {
      glance_SetCookie('gl_order_id', orderId);
    }

    // Check if orderId and impId are present
    const cookieOrderId = glance_GetCookie('gl_order_id');
    const impId = glance_GetValue('gl_imp_id', params);

    if (cookieOrderId && impId) {
      // Build the query string using available parameters for impId, userId, glanceId
      const queryString = keys.reduce((acc, curr) => {
        const value = glance_GetValue(curr.key, params);
        return !value ? acc : `${acc}${curr.apiKey}=${value}&`;
      }, '');

      // Add orderId from the cookie to the queryString
      const fullQueryString = `${queryString}orderId=${cookieOrderId}&`;

      // Add other headers from the headerKeys array
      let headers = {};
      headerKeys.forEach(headerObject => {
        const value = glance_GetValue(headerObject.key, params);
        headers = { ...headers, [headerObject.apiKey]: value };
      });

      // Fire pixel event with orderId and impId
      const host = 'https://postback.glanceapis.com/v1/pixel/events/page_view';
      const url = `${host}?${fullQueryString}eventUrl=${eventUrl}`;
      glance_PostDetails(url, headers);
    }

    // Store the other parameters (impId, userId, glanceId) in cookies
    keys.forEach(item => {
      glance_SetCookie(item.key, glance_GetValue(item.key, params));
    });
    glance_SetCookie('eventUrl', eventUrl);
  }

  window.addEventListener('load', onLoadCallback);
})();
