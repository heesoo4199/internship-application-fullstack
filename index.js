addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * @param {Request} request
 */
async function handleRequest(request) {
  // fetch array of variants
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  let resp = await fetch(url);
  const variants = (await resp.json()).variants;

  // check cookie for returning client
  const key = 'group';
  const cookie = getCookie(request, key);
  if (cookie) {
    var group = parseInt(cookie);
  } else {
    var group = Math.floor(Math.random() * variants.length);
  }

  // modify html
  let page = await fetch(variants[group]);
  page = new HTMLRewriter().on('*', new ElementHandler()).transform(page);

  // return response
  resp = new Response(page.body, page);
  resp.headers.append('Set-Cookie', `${key}=${group}`);
  return resp;
}

/**
 * From https://developers.cloudflare.com/workers/templates/pages/cookie_extract/
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

/**
 * Takes in rules for how to replace the content of certain html tags
 */
class ElementHandler {
  element(element) {
    if (element.tagName == 'title')
      element.setInnerContent('Heesoo\'s Submission');
    else if (element.tagName == 'h1' && element.getAttribute('id') == 'title')
      element.setInnerContent('Hi, I\'m Heesoo!');
    else if (element.tagName == 'p' && element.getAttribute('id') == 'description')
      element.setInnerContent('I\'m a CS student at UIUC. My internship at Sumo Logic was canceled due to COVID-19. I really appreciate this opportunity from CloudFlare and look forward to speaking with you soon :)');
    else if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
      element.setInnerContent('Meanwhile, come check out my LinkedIn!');
      element.setAttribute('href', 'https://linkedin.com/in/heesooy2');
    }
  }
}