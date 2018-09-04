'use strict';

/* global browser matchPatternToRegExp */

const mapPatterns = sites =>
    Array.isArray(sites)
        ? sites.map(matchPatternToRegExp)
        : [];

const filterHeaders = regexes =>
    ({ documentUrl, type, responseHeaders }) =>
        type === 'sub_frame' &&
        documentUrl &&
        regexes.find(regex => documentUrl.match(regex))
            ? {
                responseHeaders: responseHeaders
                    .filter(({ name }) =>
                        name.toLowerCase() !== 'x-frame-options'),
            }
            : {};

const loadSites = (sites, lazy) =>
    Promise.resolve({ sites } || lazy
        ? { sites: [] }
        : browser.storage.local.get('sites'))
        .then(({ sites }) => {
            const filterer = filterHeaders(mapPatterns(sites));

            browser.webRequest.onHeadersReceived.addListener(
                filterer,
                { urls: [ '<all_urls>' ] },
                [ 'blocking', 'responseHeaders' ]);

            const loadChangedSites = ({ sites }) => {
                browser.storage.onChanged.removeListener(loadChangedSites);
                browser.webRequest.onHeadersReceived.removeListener(filterer);
                const newSites = sites.newValue;
                loadSites(newSites);
            };

            browser.storage.onChanged.addListener(loadChangedSites);
        });

loadSites([], true);
