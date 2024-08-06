import puppeteer from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";

import ora from "ora";
import chalk from "chalk";

// Get the search query and number of pages from the command line arguments

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error(chalk.red('Usage: npm start -- "query" numberOfPages'));
  process.exit(1);
}

const searchQuery = args[0];
const MAX_SCROLLS = parseInt(args[1] || 1000, 10);

if (!searchQuery) {
  console.error(chalk.red("The searchQuery must not be empty."));
  process.exit(1);
}

if (isNaN(MAX_SCROLLS) || MAX_SCROLLS < 0) {
  console.error(
    chalk.red("The number of pages must be a positive integer. (Default: 1000)")
  );
  process.exit(1);
}

console.log(chalk.blue(`Searching for query: ${searchQuery}`));

// Main function
(async () => {
  // Launch the browser
  const spinner = ora(chalk.green("Launching browser...")).start();
  const browser = await puppeteer.launch({
    headless: true, // Running in non-headless mode to see the actions
  });
  const page = await browser.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);
  spinner.text = chalk.green("Browser launched. Navigating...");

  {
    const targetPage = page;
    await targetPage.setViewport({
      width: 990,
      height: 708,
    });
  }
  // Navigate to the Google Maps search page
  {
    const targetPage = page;
    const promises = [];
    const startWaitingForEvents = () => {
      promises.push(targetPage.waitForNavigation());
    };
    startWaitingForEvents();
    await targetPage.goto("chrome://newtab/");
    await Promise.all(promises);
  }
  {
    const targetPage = page;
    const promises = [];
    const startWaitingForEvents = () => {
      promises.push(targetPage.waitForNavigation());
    };
    startWaitingForEvents();

    let url = searchQuery.includes(" ")
      ? encodeURIComponent(encodeURIComponent(searchQuery))
      : searchQuery;

    await targetPage.goto(
      "https://consent.google.com/m?continue=https://www.google.com/maps/search/" +
        url +
        "/&gl=DE&m=0&pc=m&uxe=eomtm&cm=2&hl=en&src=1"
    );
    await Promise.all(promises);
  }

  // Scroll to the bottom of the page to load more results
  let count = 0;

  do {
    spinner.text = chalk.green(
      "Auto-scrolling to load more results (" + (count + 1) + ")"
    );

    await scrollToBottom(page);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    count++;
  } while (
    !(await page.evaluate(() =>
      document.body.innerText.includes("Das Ende der Liste ist erreicht.")
    )) &&
    count < MAX_SCROLLS
  );

  // Scroll to the bottom of the page to load more results
  await page.waitForSelector(".Nv2PK");
  await page.evaluate(() => {
    const elements = document.querySelectorAll(".Nv2PK");
    const lastElement = elements[elements.length - 1];
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });

  spinner.succeed(chalk.green("Completed scrolling."));

  await new Promise((resolve) => setTimeout(resolve, 1500));

  spinner.start(chalk.green("Extracting URLs..."));

  // Extract URLs containing 'https://www.google.com/maps/place/' with class 'hfpxzc'
  const urls = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll(
        'a.hfpxzc[href*="https://www.google.com/maps/place/"]'
      )
    );

    return links.map((link) => link.href);
  });

  spinner.succeed(chalk.green(`Found ${urls.length} URLs to scrape.`));

  let data = [];

  //Main loop to extract data from each URL
  for (let i = 0; i < urls.length; i++) {
    try {
      let pageOpenStart = Date.now();
      const url = urls[i];
      const newPage = await browser.newPage();
      await newPage.goto(url);

      await newPage.waitForSelector(".DUwDvf span");

      // Extracting the Name, Type, Star Rating, Address, Phone Number, and Website URL
      const result = await newPage.evaluate(() => {
        const data = {};

        try {
          // Extracting the Name, value of #searchboxinput input
          const nameElement = document.querySelector("#searchboxinput");
          data.name = nameElement ? nameElement.value : null;

          // Extracting the Type
          const typeElement = document.querySelector(".DkEaL");
          data.type = typeElement ? typeElement.textContent : null;

          // Extracting the Star Rating
          const starRatingElement = document.querySelector(".F7nice .ceNzKf");
          data.starRating = starRatingElement
            ? starRatingElement.getAttribute("aria-label")
            : null;
          data.starRating = data.starRating.slice(0, -1);

          const addressElement = document.querySelector(".Io6YTe");
          data.address = addressElement ? addressElement.textContent : null;

          // Extracting the Phone Number
          const phoneElement = document.querySelector(
            '[aria-label^="Telefon:"]'
          );
          data.phone = phoneElement ? phoneElement.textContent : null;
          data.phone = data.phone.replace("", "");

          // Extracting the Website URL
          const websiteElement = document.querySelectorAll(".CsEnBe");

          //add all website urls to an array
          let websiteUrls = [];
          websiteElement.forEach((element) => {
            if (element?.href) websiteUrls.push(element?.href);
          });

          data.website = websiteUrls;
          data.scrapedAt = new Date().toISOString();
        } catch (error) {
          console.error("Error extracting data", error);
        }

        return data;
      });

      data.push({ ...result, url });
      //await new Promise((resolve) => setTimeout(resolve, 1500));
      spinner.succeed(
        chalk.green(
          `Extracted data for ${result.name} in ${Date.now() - pageOpenStart}ms`
        )
      );

      await newPage.close();
    } catch (error) {
      spinner.fail(
        chalk.red(`Error extracting data for URL ${urls[i]}, skipping`)
      );
    }
  }

  // Convert the JSON data to CSV format and write it to a file
  await jsonToCsv(data);

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Convert JSON data to CSV format and write it to a file
 * @param {*} data The JSON data to convert to CSV
 */
const jsonToCsv = async (data) => {
  let name = `output/${searchQuery.replace(
    " ",
    "-"
  )}-${new Date().toISOString()}.csv`;

  // Create the output directory if it doesn't exist, this is a npx script, use the current directory
  if (!fs.existsSync("output")) {
    fs.mkdirSync("output");
  }
  const csvWriter = createObjectCsvWriter({
    path: name,
    header: [
      { id: "name", title: "NAME" },
      { id: "type", title: "TYPE" },
      { id: "starRating", title: "STAR RATING" },
      { id: "address", title: "ADDRESS" },
      { id: "phone", title: "PHONE" },
      { id: "website", title: "WEBSITE" },
      { id: "scrapedAt", title: "SCRAPED AT" },
      { id: "email", title: "EMAIL" },
      { id: "contacted", title: "CONTACTED" },
      { id: "url", title: "URL" },
    ],
  });

  // Writing the data to a CSV file
  await csvWriter.writeRecords(data);
  console.log(
    chalk.green(
      "Successfully written " + data.length + " records to CSV file " + name
    )
  );
};

/**
 * Scroll to the bottom of the page
 * @param {*} page The Puppeteer page object
 */
async function scrollToBottom(page) {
  await page.waitForSelector(".Nv2PK");
  await page.evaluate(() => {
    const firstElement = document.querySelector(".Nv2PK");
    if (!firstElement) return null;
    let parent = firstElement.parentElement;
    let count = 0;
    while (parent && count < 2) {
      // Traverse upwards until we reach the second div
      if (parent.tagName === "DIV") {
        count++;
      }
      if (count < 2) {
        parent = parent.parentElement;
      }
    }
    if (parent) {
      parent.style.backgroundColor = "red"; // Highlight the scrollable section
      parent.scrollTop = parent.scrollHeight; // Scroll to the bottom
    }
    return parent ? parent.outerHTML : null; // Return the outer HTML for debugging
  });
}
