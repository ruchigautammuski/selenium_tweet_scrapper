import { Builder, By, until } from 'selenium-webdriver';

export const performScraping = async (keyword) => {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log('[Selenium] Navigating to login page...');
        await driver.get('https://x.com/i/flow/login');

        // STEP 1: Type username
        const usernameInput = await driver.wait(until.elementLocated(By.name('text')), 15000);
        await usernameInput.sendKeys(process.env.TWITTER_USERNAME);

        // STEP 2: Click "Next"
        const nextBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[.//span[text()='Next']]")),
            10000
        );
        await nextBtn.click();

        // STEP 3: Check if email step appears
        await driver.sleep(2000);
        let isEmailRequired = false;
        try {
            await driver.findElement(By.name('text')); // If another "text" input appears, it's for email
            isEmailRequired = true;
        } catch { }

        if (isEmailRequired) {
            console.log('[Selenium] Email step detected, entering email...');
            const emailInput = await driver.findElement(By.name('text'));
            await emailInput.sendKeys("sarthakrai281410@gmail.com");

            const nextBtnEmail = await driver.findElement(By.xpath("//button[.//span[text()='Next']]"));
            await nextBtnEmail.click();
        } else {
            console.log('[Selenium] No email step detected, proceeding...');
        }

        // STEP 4: Wait for password and enter
        await driver.wait(until.elementLocated(By.name('password')), 10000);
        const passwordInput = await driver.findElement(By.name('password'));
        await passwordInput.sendKeys(process.env.TWITTER_PASSWORD);

        // STEP 5: Click "Log in"
        let loginBtn;
        try {
            loginBtn = await driver.wait(
                until.elementLocated(By.xpath("//div[@role='button']//span[contains(text(), 'Log in')]")),
                10000
            );
        } catch {
            // Fallback selector
            loginBtn = await driver.wait(
                until.elementLocated(By.xpath("//button[@role='button']//span[contains(text(), 'Log in')]")),
                5000
            );
        }

        await driver.sleep(1000); // Wait for UI to settle
        await loginBtn.click();

        // STEP 6: Wait for home page
        await driver.wait(until.urlContains('/home'), 15000);
        console.log('[Selenium] Logged in successfully!');

        // STEP 7: Search for tweets
        const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const searchUrl = `https://x.com/search?q=${encodeURIComponent(keyword)}%20since%3A${sinceDate}&src=typed_query&f=live`;
        await driver.get(searchUrl);

        await driver.wait(until.elementsLocated(By.css('article[data-testid="tweet"]')), 15000);

        // Scroll to load more tweets
        for (let i = 0; i < 5; i++) {
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
            await driver.sleep(1000);
        }

        // Extract tweet data
        const tweetElements = await driver.findElements(By.css('article[data-testid="tweet"]'));
        const tweets = [];
        const users = new Set();

        for (const tweet of tweetElements) {
            try {
                const usernameEl = await tweet.findElement(By.css('div[data-testid="User-Name"] a'));
                const username = await usernameEl.getText();

                const timestampEl = await tweet.findElement(By.css('time'));
                const timestamp = await timestampEl.getAttribute('datetime');

                const textEl = await tweet.findElement(By.css('div[data-testid="tweetText"]'));
                const snippet = await textEl.getText();

                tweets.push({ username, timestamp, snippet });
                users.add(username);
            } catch (err) {
                continue;
            }
        }

        console.log(`[Selenium] Collected ${tweets.length} tweets from ${users.size} users.`);
        return {
            totalPosts: tweets.length,
            uniqueUsers: Array.from(users),
            tweets,
        };

    } catch (err) {
        console.error('[Selenium ERROR]', err);
        throw new Error('Selenium scraper failed');
    } finally {
        await driver.quit();
        console.log('[Selenium] Browser closed.');
    }
};
