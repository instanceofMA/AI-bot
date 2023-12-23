const { default: puppeteer } = require('puppeteer');

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({headless: false});
    const homePage = await browser.newPage();

    // Navigate the page to a URL
    await homePage.goto("https://grandeur.dev");

    // Click on "Start your project" link
    await homePage.waitForSelector("a ::-p-text(Start your project)").then(a => a.click());
    const loginPage = await browser.waitForTarget(target => target.opener() === homePage.target()).then(target => target.page());
    await loginPage.waitForSelector("input[type=submit]").then(async submitBtn => {
        await loginPage.type("input[name=email]", "email@email.com");
        submitBtn.click();
    });

//   await browser.close();
})();