# 4anime Web scraper
This anime web scraper uses the 4anime.to website to get data of any anime available on the platform. 

The data includes the name, the genres, the description, the type of show, the studio that produced the show, the release date, the status- i.e. completed or ongoing-, the language- i.e. subbed or dubbed, the url of the page, and the episodes.

The episodes have the following information: the episode id, the episode number, and the episode url.

## Installation
```bash
npm install 4anime-scraper
```

## Information
### Anime object structure
```
Anime {
  name: string,
  genres: array of strings,
  description: string,
  imageUrl: string,
  type: string,
  studio: string,
  releaseDate: string,
  status: string,
  language: string,
  url: string,
  episodes: array of objects
}
```

### Episode object structure
```
    {
      id: int,
      episode: int,
      url: string
    }
```

## Usage
There are two functions to this package. One takes in a string and returns a list of all anime that came from the search result. The other takes in a url to the anime page and returns all the data regarding that page alone.

### Getting data from url

```javascript
Anime.getAnimeFromURL("https://4anime.to/anime/the-god-of-high-school")
	.then(res => {
		console.log(res);
	});
```

### Sample response
```
Anime {
  name: 'The God of High School',
  genres: [
    'Action',
    'Adventure',
    'Comedy',
    'Fantasy',
    'Martial Arts',
    'Sci-Fi',
    'Supernatural'
  ],
  description: 'It all began as a fighting tournament to seek out for the best fighter among all high school students in Korea. Mori Jin, a Taekwondo specialist and a high school student, soon learns that there is something much greater beneath the stage of the tournament.',
  type: 'TV Series',
  studio: 'MAPPA',
  releaseDate: 'Summer, 2020',
  status: 'Currently Airing',
  language: 'Subbed',
  url: 'https://4anime.to/anime/the-god-of-high-school',
  episodes: [
    {
      id: 42172,
      episode: 1,
      url: 'https://4anime.to/the-god-of-high-school-episode-01/?id=42172'
    },
    {
      id: 42546,
      episode: 2,
      url: 'https://4anime.to/the-god-of-high-school-episode-02/?id=42546'
    },
    {
      id: 42710,
      episode: 3,
      url: 'https://4anime.to/the-god-of-high-school-episode-03/?id=42710'
    },
    {
      id: 42822,
      episode: 4,
      url: 'https://4anime.to/the-god-of-high-school-episode-04/?id=42822'
    },
    {
      id: 42950,
      episode: 5,
      url: 'https://4anime.to/the-god-of-high-school-episode-05/?id=42950'
    }
  ]
}
```

### Getting data from a search 
```javascript
const Anime = require('4anime-scraper').default;

Anime.getAnimeFromSearch("enen no shouboutai")
	.then(res => {
		console.log(res);
	});
```


### Getting the video link from an episode url 
```javascript
const Anime = require('4anime-scraper').default;

Anime.getVideoLinkFromUrl("https://4anime.to/one-piece-episode-938?id=43181")
	.then(res => {
		console.log(res);
	});
```

## Other
If you would like to check out the code there will be a link to the github page. 

Thanks for checking out this package.
