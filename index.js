const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const anime = require('./anime');
const Anime = require('./anime').Anime

class Scraper {
  //Handle spaces in name to match url
  handleName(animeName) {
    return animeName.replace(/ /g, "+");
  }

  //Returns an array of all urls gathered from search result
  getAnimeSearchURL(animeName) {
    return (
      axios.get("https://4anime.to/?s=" + this.handleName(animeName))
        .then(async res => {
          let searchURLS = [];
          const $ = cheerio.load(res.data);
          await $("#headerDIV_95").each((i, elm) => {
            searchURLS.push($(elm).find("a").attr("href"));
          })
          return searchURLS;
        }).catch(err => {
          console.log(err);
        })
    );
  }

  //Returns an Anime object given a complete url
  getAnimeFromURL(animeURL) {
    return (
      axios.get(animeURL)
        .then(async res => {
          const $ = cheerio.load(res.data);

          //Get anime name
          let animeName = $(".single-anime-desktop").text();

          //Get anime genres and panelData
          let animeGenres = [];
          $(".list").children().each((i, elm) => {
            let rawGenres = $(elm).text().split("\n");
            if (rawGenres[0] != '') {
              animeGenres.push(rawGenres[0]);
            }
          });

          //Organize panelData
          let panelData = [];
          $(".details").children().each((i, elm) => {
            panelData.push($(elm).text())
          })
          panelData.shift();

          panelData[0] = panelData[0].split(" Type "); //type
          panelData[1] = panelData[1].split("Studio "); //studio
          panelData[2] = panelData[2].split("Release Date (JP) "); //release date
          panelData[3] = panelData[3].split("Status "); //status
          panelData[4] = panelData[4].split("Language "); //language
          // console.log(panelData)

          //Fix studio bug
          if (panelData[1][1] == '') {
            panelData[1][1] = 'Studio ';
          }

          //Fix language string
          panelData[4][1] = panelData[4][1].replace("  ", "");

          //Correcting panelData arrays
          for (let elm of panelData) {
            elm.shift();
          }

          //Get anime description
          let animeDes = $("#description-mob").children().last().text();

          //Get anime cover image
          let imageUrl = "https://4anime.to" + $(".cover").children().last().attr("src");

          //Get anime episodes
          let animeEpisodes = []

          $(".episodes").children().each((i, elm) => {
            let idIndex = $(elm).find("a").attr("href").indexOf("=") + 1;
            let episodeData = {
              id: parseInt($(elm).find("a").attr("href").substring(idIndex)),
              episode: parseInt($(elm).text()),
              url: $(elm).find("a").attr("href")
            };

            animeEpisodes.push(episodeData);
          });

          let anime = new Anime(
            animeName,
            animeGenres,
            animeDes,
            imageUrl,
            panelData[0].join(),
            panelData[1].join().replace(",", ""),
            panelData[2].join(),
            panelData[3].join(),
            panelData[4].join(),
            animeURL,
            animeEpisodes
          );
          return anime;
        }).catch(err => {
          console.log(err);
        })
    );
  }

  //Returns a video link of an episode given a complete url of an episode
  getVideoLinkFromUrl(episodeUrl) {
    return (
      axios.get(episodeUrl)
        .then(async res => {
          const $ = cheerio.load(res.data);

          //Regex
          let regexVideoLinks = /class=\\"(mirror_dl\\)" href=\\"([^"]+)"/g

          //Get link
          let nonCleanedUrl = res.data.match(regexVideoLinks)[0]

          // clean url by removing tags
          let videoLink = this.cleanUpLink(nonCleanedUrl)

          return videoLink;
        }).catch(err => {
          console.log(err);
        })
    );
  }

  //Downloads a video from the given videoURL
  downloadVideoFromLink(videoURL, {filePath = false, } = {}) {
    if (filePath == false) {
      filePath = videoURL.split('/')
      filePath = filePath[filePath.length - 1]
    }
    else {
      let fileName = videoURL.split('/')
      fileName = fileName[fileName.length - 1]
      filePath = args[0] + "/" + fileName
    }
    const file = fs.createWriteStream(filePath)
    return (
      axios.get(videoURL, {responseType : 'stream'})
        .then(async res => {
          await res.data.pipe(file)
          console.log('File Downloading at: ' + filePath)
        })
    );
  }

  //Returns an array of Anime objects given a search query
  getAnimeFromSearch(animeSearch) {
    return (
      this.getAnimeSearchURL(animeSearch)
        .then(async res => {
          let animeFromSearch = [];
          for (let searchResult of res) {
            await this.getAnimeFromURL(searchResult)
              .then(data => {
                animeFromSearch.push(data);
              }).catch(err => {
                console.log(err);
              })
          }
          return animeFromSearch
        }).catch(err => {
          console.log(err);
        })
    );
  }

  //Returns an array of all ongoing anime links
  async getOngoingLinks() {
    let pageCount = 1;
    let animeLinks = [];
    let htmlSource = "";
    while (htmlSource != null) {
      await axios.get("https://4anime.to/browse?_sft_status=airing&sf_paged=" + pageCount)
        .then(res => {
          const $ = cheerio.load(res.data);
          htmlSource = $(".wp-pagenavi").html();
          $("#headerDIV_3").each((i, elm) => {
            animeLinks.push($(elm).find("#headerA_7").attr("href"))
          })
        }).catch(err => {
          console.log(err);
        });
      pageCount++;
    }
    return animeLinks;
  }

  //Returns an array of all ongoing anime names
  async getOngoingNames(ongoingLinks) {
    let ongoingNames = [];
    for (let link of ongoingLinks) {
      await axios.get(link)
        .then(res => {
          const $ = cheerio.load(res.data);
          ongoingNames.push($(".single-anime-desktop").text());
        });
    }
    return ongoingNames;
  }

  //Returs an array of Anime objects given an array of links to the anime page
  async getDataFromLinks(links) {
    let allData = [];
    for (let link of links) {
      await this.getAnimeFromURL(link)
        .then(res => {
          allData.push(res);
        }).catch(err => {
          console.log(err)
        })
    }
    return allData;
  }

  cleanUpLink(url) {
    return url.substring(
      url.lastIndexOf("http"),
      url.lastIndexOf("\\")
    )
  }

}

let scraper = new Scraper();
module.exports = {
  default: scraper
}
