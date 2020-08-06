const Anime = require('./index').default;

Anime.getAnimeFromURL("https://4anime.to/anime/the-god-of-high-school").then(res => {console.log(res)})