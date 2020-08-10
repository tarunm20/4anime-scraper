let anime = require('./index').default;

anime.getOngoingLinks()
  .then(res => {
    anime.getOngoingNames(res)
      .then(data => {
        console.log(data);
      })
  })
