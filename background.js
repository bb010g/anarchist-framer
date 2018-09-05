// The extra array is for boxing the inner array because closures.
const regexes = [[]];

// from https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
const matchPatternToRegExp = pattern => {
    if (pattern === '') {
        return /^(?:http|https|ws|wss|file|ftp|ftps):\/\//;
    }

    const schemeSegment = '(\\*|http|https|ws|wss|file|ftp|ftps)';
    const hostSegment = '(\\*|(?:\\*\\.)?(?:[^/*]+))?';
    const pathSegment = '(.*)';
    const matchPatternRegExp = new RegExp(
        `^${schemeSegment}://${hostSegment}/${pathSegment}$`
    );

    const match = matchPatternRegExp.exec(pattern);
    if (!match) {
        throw new TypeError(`"${pattern}" is not a valid MatchPattern`);
    }

    let [, scheme, host, path] = match;
    if (!host && scheme !== 'file') {
        throw new TypeError(`"${pattern}" does not have a valid host`);
    }

    const schemeRegex = scheme === '*' ? '(http|https|ws|wss)' : scheme;

    let hostRegex = '';
    if (host) {
        if (host === '*') {
            hostRegex = '[^/]+?';
        } else {
            if (host.startsWith('*.')) {
                hostRegex = '(?:[^/]+?\\.)?';
                host = host.substring(2);
            }
            hostRegex += host.replace(/\./g, '\\.');
        }
    }

    let pathRegex = '/?';
    if (path) {
        if (path === '*') {
            pathRegex = '(/.*)?';
        } else if (path.charAt(0) !== '/') {
            pathRegex = `/${path.replace(/\./g, '\\.').replace(/\*/g, '.*?')}`;
        }
    }

    const regex = `^${schemeRegex}://${hostRegex}${pathRegex}$`;
    return new RegExp(regex);
}

browser.storage.local.get('sites').then(({sites}) => {
  if (Array.isArray(sites)) {
    regexes[0] = sites.map(matchPatternToRegExp);
  }
});

browser.webRequest.onHeadersReceived.addListener(
  function(details) {
    const {documentUrl, responseHeaders} = details;
    if (documentUrl) {
      for (const regex of regexes[0]) {
        if (documentUrl.match(regex)) {
          return {
            responseHeaders: responseHeaders.filter(({name}) => name.toLowerCase() != "x-frame-options"),
          };
        }
      }
    }
    return {};
  },
  { urls: ["<all_urls>"], types: ["sub_frame"] },
  ["blocking", "responseHeaders"]
);

browser.storage.onChanged.addListener(function (items, areaName) {
  const newSites = items.sites.newValue;
  if (Array.isArray(newSites)) {
    regexes[0] = newSites.map(matchPatternToRegExp);
  }
});
