const puppeteer = require('puppeteer');

const PORT = 3000;
const TEST_URL = `http://localhost:${PORT}`;

function isSentryRequest(request) {
  return /sentry.io\/api/.test(request.url());
}

function isStoreRequest(request) {
  return /sentry.io\/api\/\d+\/store/.test(request.url());
}

function isEnvelopeRequest(request) {
  return /sentry.io\/api\/\d+\/envelope/.test(request.url());
}

function extractEventFromResponse(response) {
  return JSON.parse(response._request.postData());
}

(async () => {
  const browser = await puppeteer.launch({
    devtools: false,
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log(msg.text()));

  await page.setRequestInterception(true);
  page.on('request', request => {
    if (isStoreRequest(request)) {
      console.log('Store request intercepted.');
    }

    if (isEnvelopeRequest(request)) {
      console.log('Envelope request intercepted.');
    }

    if (isSentryRequest(request)) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: '',
      });
    } else {
      request.continue();
    }
  });

  await page.goto(TEST_URL);
  const [response] = await Promise.all([page.waitForResponse(isStoreRequest), page.click('button')]);

  const event = extractEventFromResponse(response);
  const { type, value } = event.exception.values[0];
  const expectedType = 'Error';
  const expectedValue = 'dupa';

  if (type === expectedType && value === expectedValue) {
    console.log('✓ Test Succeded');
    await browser.close();
    process.exit(0);
  } else {
    console.log(
      `X Test Failed\n  Expected:\n    type=${expectedType} | value=${expectedValue}\n  Got:\n    type=${type} | value=${value}`,
    );
    await browser.close();
    process.exit(1);
  }
})();
