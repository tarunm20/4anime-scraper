
class Anime {
  constructor(name, genres, description, imageUrl, type, studio, releaseDate, status, language, url, episodes) {
    this.name = name;
    this.genres = genres;
    this.description = description;
    this.imageUrl = imageUrl;
    this.type = type;
    this.studio = studio;
    this.releaseDate = releaseDate;
    this.status = status;
    this.language = language;
    this.url = url;
    this.episodes = episodes;
  }
}

module.exports = {
  Anime: Anime
}