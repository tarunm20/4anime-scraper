let anime = require('./index').default;

// anime.getOngoingLinks()
//   .then(res => {
//     anime.getOngoingNames(res)
//       .then(data => {
//         console.log(data);
//       })
//   })


// anime.getVideoLinkFromUrl('https://4anime.to/himegoto-episode-01?id=28984')
//   .then(res => {
//     console.log(res)
//   })

anime.downloadVideoFromLink("https://storage.googleapis.com/justawesome-183319.appspot.com/v2.4animu.me/Higurashi-no-Naku-Koro-ni-Gou/Higurashi-no-Naku-Koro-ni-Gou-Episode-04-1080p.mp4", "./test")

