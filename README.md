# Google Maps Scraper

This is a [pupeeter](https://pptr.dev/) based scraper for **Google Maps**. This script will seach for the term you provide and scrape the information from the search results. Each search will be saved in a separate file in the current directory. Due to the limitations of the Google Maps API, this script will not work for more than 120 search results.

The output file will be a `csv` file with the following format:

```csv
- Name
- Business Type
- Address
- Phone
- Website
- Rating
- URL
- Scraping Date
- Website
```

## Prerequisite

The following software is required to run this script:

- [Node.js](https://nodejs.org/en/) 18+
- [npm](https://www.npmjs.com/) 6+

## Usage

You can run the script by providing the search term as an argument. For example, to search for `restaurants in New York`, you can run the following command:

```bash
npx google-maps-scraper "restaurants in New York"
```

Or you pass the search term as well as the output file name. In this case, 10 scroll events will be performed to load more results:

```bash
npx google-maps-scraper "restaurants in New York" 10 "User/Path/To/OutputFile.csv"
```

This will start a search for `restaurants in New York` and save the results in a file in the current directory. The file will be named `restaurants-in-new-york.csv`.

| NAME                   | TYPE                     | STAR RATING | ADDRESS                                                 | PHONE           | WEBSITE                                                                                                                                                                                                                               | SCRAPED AT               | EMAIL | CONTACTED | URL                                                                                                                                                                                                                                             |
| ---------------------- | ------------------------ | ----------- | ------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OLIO E PIÙ             | Italienisches Restaurant | 4,6 Sterne  | 3 Greenwich Ave, New York, NY 10014, Vereinigte Staaten | +1 212-243-6546 | [Opentable](https://www.opentable.com/restaurant/profile/55837?ref=1068), [Menus](https://www.olioepiu.com/menus/), [Website](https://www.olioepiu.com/)                                                                              | 2024-08-06T15:41:10.406Z |       |           | [Google Maps](https://www.google.com/maps/place/OLIO+E+PI%C3%99/data=!4m7!3m6!1s0x89c25996bd0915fd:0x294a27aedc2f4135!8m2!3d40.7338208!4d-73.9997931!16s%2Fg%2F1tjyvj49!19sChIJ_RUJvZZZwokRNUEv3K4nSik?ucbcb=1&authuser=0&hl=de&rclk=1)         |
| Boucherie West Village | Französisches Restaurant | 4,7 Sterne  | 99 7th Ave S, New York, NY 10014, Vereinigte Staaten    | +1 212-837-1616 | [Opentable](https://www.opentable.com/restaurant/profile/346609?ref=1068), [West Village Menus](https://www.boucherie.nyc/west-village-menus/), [Website](https://www.boucherieus.com/)                                               | 2024-08-06T15:41:12.208Z |       |           | [Google Maps](https://www.google.com/maps/place/Boucherie+West+Village/data=!4m7!3m6!1s0x89c25993862d9fab:0xc76173738eeacb72!8m2!3d40.733047!4d-74.0028772!16s%2Fg%2F11c2lq_l86!19sChIJq58thpNZwokRcsvqjnNzYcc?ucbcb=1&authuser=0&hl=de&rclk=1) |
| Gramercy Tavern        | Restaurant               | 4,6 Sterne  | 42 E 20th St, New York, NY 10003, Vereinigte Staaten    | +1 212-477-0777 | [Menu](http://www.gramercytavern.com/menu/?utm_source=GoogleBusinessProfile&utm_medium=Menu&utm_campaign=MapLabs), [Website](http://www.gramercytavern.com/?utm_source=GoogleBusinessProfile&utm_medium=Website&utm_campaign=MapLabs) | 2024-08-06T15:41:14.022Z |       |           | [Google Maps](https://www.google.com/maps/place/Gramercy+Tavern/data=!4m7!3m6!1s0x89c259a1820824bd:0x2b79dcdc251b8415!8m2!3d40.7384555!4d-73.9885064!16s%2Fm%2F020dmrk!19sChIJvSQIgqFZwokRFYQbJdzceSs?ucbcb=1&authuser=0&hl=de&rclk=1)          |

## Author

This tool is created by [Robert Julian Kratz](https://rjks.us). You can find the source code on [robert-kratz](https://github.com/robert-kratz).

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.
