/**
 * Created by Henrikh Kantuni on 1/28/18.
 */


const puppeteer = require("puppeteer")
const axios = require("axios")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()

app.set("port", 3000)
app.use(bodyParser.json())


async function process(json) {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true
  })

  const page = await browser.newPage()
  await page.emulate({
    viewport: {
      height: 768,
      width: 1200
    },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0"
  })

  await page.goto("http://menu.am/en/")
  await page.waitFor(random(5000, 7000))
  await page.waitFor("#delivery_btn")
  await page.click("#delivery_btn")
  await page.goto(json["restaurant_url"])
  await page.waitFor(random(5000, 7000))

  // TODO: Calculate order price for each user.
  let items = await page.evaluate(orders => {
    // Get order urls and titles.
    let links = [...document.querySelectorAll(".title.prod_content_a")]
    let items = []

    links.map(link => {
      let title = link.innerText.trim()
      let number = title.split(" ")[0]

      // Flatten orders into a simple array.
      orders = Array.prototype.concat(...Object.values(orders))
      orders.map(order => {
        if (number === "#" + order) {
          items.push({
            url: link.href,
            title: title
          })
        }
      })
    })

    return items
  }, json["orders"])

  // Open item and order it.
  for (const {url, title} of items) {
    await page.goto(url)
    await page.waitFor(random(5000, 7000))
    await page.waitFor("#opts-save")
    await page.click("#opts-save")
    await page.waitFor(random(5000, 7000))
    console.log(`${title} is ordered.`)
  }

  // Click on "Order Now" button.
  await page.click(".order")
  await page.waitFor(random(5000, 7000))

  // Enter delivery information.
  await page.type("#quick_order_phone", json["telephone"], {delay: random(100, 300)})
  await page.type("#addres_info_street", json["delivery_address"], {delay: random(100, 300)})
  await page.type("#addres_info_house", json["house"], {delay: random(100, 300)})
  await page.type("#addres_info_apartament", json["apartment"], {delay: random(100, 300)})
  await page.type(".add_info textarea", json["address_details"], {delay: random(100, 300)})
  await page.type(".comments textarea", json["comments"], {delay: random(100, 300)})

  // Click on "Pay on delivery" button.
  await page.click("#submitOrder-pay_in_place")
  
  // Close the browser.
  await browser.close()
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}


app.post("/orders", (request, response) => {
  response.status(200).end()

  process(request.body)
    .then(() => {
      const url = "http://f97c8d3b.ngrok.io/done"
      axios.post(url)
        .then(response => {
          console.log(response.statusText)
        })
        .catch(error => {
          console.error(error)
        })
    })
    .catch(error => {
      console.error(error)
    })
})

app.listen(app.get("port"), () => {
  console.log("Express is running on port " + app.get("port"))
})
