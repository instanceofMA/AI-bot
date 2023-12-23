require("dotenv").config();
const cheerio = require('cheerio');
const { default: puppeteer } = require('puppeteer');
const { LocalStorage } = require("node-localstorage");
const { sendToGPT } = require("./gpt");

const localStorage = new LocalStorage('./cookies');

const baseUrl = "https://app.directly.com";
const loginPath = `/login/auth`;
const dashboardPath = "/dashboard/index";

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false, timeout: -1 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 720});

    // Attach cookies from local storage
    const cookie = JSON.parse(localStorage.getItem(baseUrl));
    if(cookie) await page.setCookie(...cookie);

    // Go to dashboard page.
    await page.goto(`${baseUrl}${dashboardPath}`);
    // If redirected to login page, then proceed to logging in.
    if(page.url() === `${baseUrl}${loginPath}`) await login(page);

    // NOT TESTED FROM HERE BELOW.
    // Check for new task in "tasks for you"
    await page.waitForSelector("div .task .is-current").then(div => div.click()); // But where is the link to question?

    // Get question category and text.
    const qCategory = await page.waitForSelector("span .label-item .tag").then(_ => page.$eval("span .label-item .tag", span => span.innerText()));
    const qText = await page.waitForSelector("p .question-text").then(_ => page.$eval("p .question-text", p => p.innerText()));

    sendToGPT(qCategory, qText);

//   await page.type('.search-box__input', 'automate beyond recorder');

//   // Wait and click on first result
//   const searchResultSelector = '.search-box__link';
//   await page.waitForSelector(searchResultSelector);
//   await page.click(searchResultSelector);

//   // Locate the full title with a unique string
//   const textSelector = await page.waitForSelector(
//     'text/Customize and automate'
//   );
//   const fullTitle = await textSelector?.evaluate(el => el.textContent);

//   // Print the full title
//   console.log('The title of this blog post is "%s".', fullTitle);

//   await browser.close();
})();

async function login(page) {
    await page.waitForSelector("button[type=submit]").then(async submitBtn => {
        await page.type("input[type=email]", process.env.EMAIL);
        await page.type("input[type=password]", process.env.PASSWORD);
        await submitBtn.click();
    });
    // Wait for dashboard page to load before saving cookies because otherwise, session cookies don't save.
    await page.waitForNavigation();

    const cookies = await page.cookies();
    localStorage.setItem(baseUrl, JSON.stringify(cookies));
}