import fetch from "node-fetch";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from 'path';


var imgs = new Array();
const seenUrls = {};
const seenImgs = {};

const baseUrl = "https://www.northwestskater.com/"

const crawl = async ({ url }) => {
  // if the url is in the cache, return
  if (seenUrls[url]) return;

  // if it's not in cache, add to cache now.
  seenUrls[url] = true;
  console.log("crawling", url)
  
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html)
  const links = $('a').map((i, link) => link.attribs.href).get();

// Make array of image urls
  const imageUrls = $('img').map((i, link) => link.attribs.src).get();

  // for each image, request the filename and save it. 
  imageUrls.forEach((imageUrl, index) => {
    if (seenImgs[imageUrl]) return;

    fetch(`${baseUrl}${imageUrl}`).then(response => {
      //make sure and  reduce file path to just file name
      const fileName = path.basename(imageUrl);

      //write to folder
      const dest = fs.createWriteStream(`images/${fileName}`);
      response.body.pipe(dest);
    })
  })


  links.forEach(link => {
    
    if (!link.includes("http")) {
      crawl({
        url: `https://www.northwestskater.com/${link}`,
      })
    }
  })
}



crawl({
    url: "https://www.northwestskater.com",
   });



 