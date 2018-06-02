'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

const pinCountMap = new Map();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise
    .all(req.body.events.map(handlePinponpan))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handlePinponpan(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  let text;
  if (event.message.text == "ピン") {
    let pinCount = pinCountMap.get(event.source.userId) || 0;
    if (++pinCount < 5) {
      text = "背筋伸びてるやん！";
      pinCountMap.set(event.source.userId, pinCount);
    } else {
      text = "背筋伸びきってるやん！";
      pinCountMap.set(event.source.userId, 0);
    }
  } else {
    pinCountMap.set(event.source.userId, 0);
    if (event.message.text == "ピンポンパンポンピーン") {
      text = "１個多いわ！";
    } else if (event.message.text == "ピンポンパン") {
      text = "１個少ないわ！";
    } else if (event.message.text == "ピンポーン") {
      text = "誰か来ましたよ！";
    } else if (event.message.text == "ポンピーン") {
      text = "来ましたよ誰か！";
    } else if (event.message.text == "ピンポンパンライス") {
      text = "ファミレスでピンポン押して店員さん呼んでハンバーグセット頼んでパンorライスって聞かれてるやん！";
    } else {
      text = "知らん！";
    } 
  }

  // create a echoing text message
  const echo = { type: 'text', text: text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
