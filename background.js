let regexes = [];

// from https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
const matchPatternToRegExp = function(pattern) {
    if (pattern === '') {
        return (/^(?:http|https|file|ftp|app):\/\//);
    }

    const schemeSegment = '(\\*|http|https|ws|wss|file|ftp)';
    const hostSegment = '(\\*|(?:\\*\\.)?(?:[^/*]+))?';
    const pathSegment = '(.*)';
    const matchPatternRegExp = new RegExp(
        `^${schemeSegment}://${hostSegment}/${pathSegment}$`
    );

    let match = matchPatternRegExp.exec(pattern);
    if (!match) {
         throw new TypeError(`"${pattern}" is not a valid MatchPattern`);
    }

    let [, scheme, host, path] = match;
    if (!host) {
        throw new TypeError(`"${pattern}" does not have a valid host`);
    }

    let regex = '^';

    if (scheme === '*') {
        regex += '(http|https)';
    } else {
        regex += scheme;
    }

    regex += '://';

    if (host && host === '*') {
        regex += '[^/]+?';
    } else if (host) {
        if (host.match(/^\*\./)) {
            regex += '[^/]*?';
            host = host.substring(2);
        }
        regex += host.replace(/\./g, '\\.');
    }

    if (path) {
        if (path === '*') {
            regex += '(/.*)?';
        } else if (path.charAt(0) !== '/') {
            regex += '/';
            regex += path.replace(/\./g, '\\.').replace(/\*/g, '.*?');
            regex += '/?';
        }
    } else {
        regex += '/?';
    }

    regex += '$';
    return new RegExp(regex);
}

browser.storage.local.get('sites').then(({sites}) => {
  if (typeof sites === 'object' && Array.isArray(sites)) {
    regexes = sites.map(matchPatternToRegExp);
  }
});

browser.webRequest.onHeadersReceived.addListener(
  function(details) {
    const {documentUrl, type, responseHeaders} = details;
    if (type == 'sub_frame' && documentUrl) {
      for (const regex of regexes) {
        if (documentUrl.match(regex)) {
          return {
            responseHeaders: responseHeaders.filter(({name}) => name.toLowerCase() != "x-frame-options"),
          };
        }
      }
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders"]
);

browser.storage.onChanged.addListener(function (items, areaName) {
  const {sites} = items;
  const newSites = sites.newValue;
  if (typeof newSites === 'object' && Array.isArray(newSites)) {
    regexes = newSites.map(matchPatternToRegExp);
  }
});
