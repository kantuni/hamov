/**
 * Created by Henrikh Kantuni on 1/28/18.
 */


'use strict';

const nightmare = require('nightmare');
const browser = nightmare({show: true})
  .useragent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0')
  .viewport(1366, 768);

const RESTAURANT = 'https://www.menu.am/en/yerevan/delivery/restaurant/black-angus-mashtots.html';
const ORDERS = [1, 3, 7];

browser
  .cookies.clearAll()
  .goto('https://menu.am/en/')
  .wait()
  .click('#delivery_btn')
  .wait()
  .goto(RESTAURANT)
  .wait()
  .catch(error => {
    console.error(error);
  });
