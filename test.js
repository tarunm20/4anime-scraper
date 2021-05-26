let Anime = require('./index').default;

Anime.getAnimeFromURL("https://4anime.to/anime/odd-taxi").then(res => {
	console.log(res);
});