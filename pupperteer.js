const puppeteer = require('puppeteer');
const { delay } = require('./utils')

let browserWSEndpoint = null;

async function init() {
    const browser = await puppeteer.launch({headless:false,
        args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process'
    ]});
    browserWSEndpoint = await browser.wsEndpoint();
}

async function getPage() {
    if (!browserWSEndpoint) {
        await init();
    }
    const targetUrl = 'https://time.geekbang.org/dashboard/course';
    const browser = await puppeteer.connect({browserWSEndpoint});
    const page = await browser.newPage();
    const response = await page.goto(targetUrl);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36');
    await page.evaluate(() => {
        Object.defineProperty(window.navigator, 'webdriver', {
            get: () => false,
        });
    });
    const finalUrl = response.url();
    if (finalUrl !== targetUrl) {
        const result = await page.evaluate(async () => {
            function delay(time) {
                return new Promise((resolve) => {
                    setTimeout(resolve, time);
                });
            }
            const togglePwdLoginBtn = document.querySelector('.change-login');
            togglePwdLoginBtn.click()
            await delay(1000);
            const [tel, pwd] = document.querySelectorAll('.gkui-form-text')
            const submit = document.querySelector('.Button_button_3onsJ');
            tel.value = '18373841953'
            pwd.value = '110120qwe'
            // await delay(1000);
            // submit.click();
        })
        // const togglePwdLoginBtn = await page.$('.change-login');
        // togglePwdLoginBtn.click()
        // await delay(1000);
        // const [tel, pwd] = await page.$$('.gkui-form-text');
        // tel && tel.type('18373841953');
        // pwd && pwd.type('110120qwe');
    }
    await page.setViewport({
        width: 600,
        height: 400
    });
    // togglePwdLoginBtn.click();
    return page;
}

getPage()