const axios = require('axios');
const cheerio = require('cheerio');
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
          let panelData = animeGenres.pop(animeGenres.length - 1);
          panelData = panelData.split("   ");
          panelData.shift();
          panelData.shift();
          panelData[0] = panelData[0].split(" Type "); //type
          panelData[1] = panelData[1].split("Studio "); //studio
          panelData[2] = panelData[2].split("Release Date (JP) "); //release date
          panelData[3] = panelData[3].split("Status "); //status
          panelData[4] = panelData[4].split("Language "); //language


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

  getVideoLinkFromUrl(episodeUrl) {
    return (
      axios.get(episodeUrl)
        .then(async res => {
          const $ = cheerio.load(res.data);

          //Get video link by regex
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

  async getOngoingData(ongoingLinks) {
    let ongoingData = [];
    for (let link of ongoingLinks) {
      await this.getAnimeFromURL(link)
        .then(res => {
          ongoingData.push(res);
        }).catch(err => {
          console.log(err)
        })
    }
    return ongoingData;
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