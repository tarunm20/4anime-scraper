let anime = require('./index').default;

anime.getOngoingLinks()
  .then(res => {
    anime.getOngoingNames(res)
      .then(data => {
        console.log(data);
      })
  })


anime.getVideoLinkFromUrl('https://4anime.to/ninja-collection-episode-07?id=43185')
  .then(res => {
    console.log(res)
  })