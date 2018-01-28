/**
 * Created by Henrikh Kantuni on 1/28/18.
 */


'use strict';

const puppeteer = require('puppeteer');

// data
const RESTAURANT = 'https://www.menu.am/en/yerevan/delivery/restaurant/black-angus-mashtots.html';
const ORDERS = [1, 3, 7];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  await page.emulate({
    viewport: {
      height: 768,
      width: 1200
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0'
  });

  await page.goto('http://menu.am/en/');
  await page.waitFor(delay(5, 7));
  await page.waitFor('#delivery_btn');
  await page.click('#delivery_btn');
  await page.goto(RESTAURANT);
  await page.waitFor(delay(5, 7));

  let data = await page.evaluate(orders => {
    let links = [...document.querySelectorAll('.title.prod_content_a')];
    let data = [];
    links.map(link => {
      let title = link.innerText.trim();
      let chunks = title.split(' ');
      orders.map(order => {
        if (chunks[0] === '#' + order) {
          data.push({
            url: link.href,
            title: title
          });
        }
      });
    });
    return data;
  }, ORDERS);

  for (const {url, title} of data) {
    await page.goto(url);
    await page.waitFor(delay(5, 7));
    await page.waitFor('#opts-save');
    await page.click('#opts-save');
    await page.waitFor(delay(5, 7));
    console.log(title + ' is ordered.');
  }
  
  await page.click('.order');
  await page.waitFor(delay(5, 7));

  // await browser.close();
})();


function delay(min, max) {
  return Math.floor(1000 * (Math.random() * (max - min + 1) + min));
}
