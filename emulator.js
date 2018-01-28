/**
 * Created by Henrikh Kantuni on 1/28/18.
 */


'use strict';

const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('port', 5001);
app.use(bodyParser.json({limit: '50mb'}));

app.post('/orders', (req, res) => {
  res.status(200).end();

  process(req.body)
    .catch(error => {
      console.error(error);
    });
});

app.listen(app.get('port'), () => {
  console.log('Express is running on port ' + app.get('port'));
});


async function process(json) {
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
  await page.waitFor(random(5000, 7000));
  await page.waitFor('#delivery_btn');
  await page.click('#delivery_btn');
  await page.goto(json['restaurant_url']);
  await page.waitFor(random(5000, 7000));

  // TODO: calculate order price for each user  
  let items = await page.evaluate(orders => {
    // get order urls and titles
    let links = [...document.querySelectorAll('.title.prod_content_a')];
    let items = [];

    links.map(link => {
      let title = link.innerText.trim();
      let number = title.split(' ')[0];

      // flatten orders into a simple array
      orders = Array.prototype.concat(...Object.values(orders));
      orders.map(order => {
        if (number === '#' + order) {
          items.push({
            url: link.href,
            title: title
          });
        }
      });
    });

    return items;
  }, json['orders']);


  // open an item and order it
  for (const {url, title} of items) {
    await page.goto(url);
    await page.waitFor(random(5000, 7000));
    await page.waitFor('#opts-save');
    await page.click('#opts-save');
    await page.waitFor(random(5000, 7000));
    console.log(`${title} is ordered.`);
  }

  // click on "Order Now"
  await page.click('.order');
  await page.waitFor(random(5000, 7000));

  // enter delivery information
  await page.type('#quick_order_phone', json['telephone'], {delay: random(100, 300)});
  await page.type('#addres_info_street', json['delivery_address'], {delay: random(100, 300)});
  await page.type('#addres_info_house', json['house'], {delay: random(100, 300)});
  await page.type('#addres_info_apartament', json['apartment'], {delay: random(100, 300)});
  await page.type('.add_info textarea', json['address_details'], {delay: random(100, 300)});
  await page.type('.comments textarea', json['comments'], {delay: random(100, 300)});
  // TODO: click on "Pay on delivery"

  // await browser.close();
}


// helper
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
