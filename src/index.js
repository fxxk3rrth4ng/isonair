export default {
  async fetch(request, env, ctx) {
    let results = []

    async function gatherResponse(response) {
      return JSON.stringify(await response.json())
    }

    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    }

    const ids = [
      '0f171fd568c130cf09f2d3a641c4cbf1', // 김편집
      'de33a533e705c56ebbe8f087d609ce48', // 현성팍
      'c663e425e015731a5665a57fbac30bb6', // 라모
      '6e06f5e1907f17eff543abd06cb62891', // 녹두로
      '7d4157ae4fddab134243704cab847f23', // 펀즈이누
      'b8119eaadca58a5cd0c8cf2d48af8bea', // 일급천재
      '0889909c5e4a8234a1f963cf4a9e3081', // 칸나비
      '96fe5087cb0195df09ad54cac8a1e24a', // 서치
      '61ca8b9ffd80dc8e529148734f9352da', // 무츠키쨩
    ]

    for (let id of ids) {
      let response = await fetch(`https://api.chzzk.naver.com/service/v2/channels/${id}/live-detail`, init);
      let result = JSON.parse(await gatherResponse(response)).content;
      if (result.status == "OPEN") {results.push({
        "status": result.status,
        "channel": {
          "channelId": id,
          "channelName": result.channel.channelName,
          "channelImage": result.channel.channelImageUrl,
          "isVerified": result.channel.verifiedMark
        },
        "live": {
          "liveTitle": result.liveTitle,
          "liveCategory": result.liveCategoryValue,
          "frameRate": (result.adult) ? "19.0" : (JSON.parse(result.livePlaybackJson).media[0].encodingTrack[3].videoFrameRate),
          "startedAt": result.openDate,
          "m3u8": (!result.adult) ? (JSON.parse(result.livePlaybackJson).media[1].path) : null
        }
      })} else {results.push({
        "status": result.status,
        "channel": {
          "channelId": id,
          "channelName": result.channel.channelName,
          "channelImage": result.channel.channelImageUrl,
          "isVerified": result.channel.verifiedMark
        },
        "live": {
          "closedAt": result.closeDate
        }
      })

      };
    }

    return new Response(JSON.stringify(results), init)
  }
}
