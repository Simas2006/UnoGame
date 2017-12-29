var express = require("express");
var app = express();
var PORT = process.argv[2] || 8000;
var users = [];
var currentCard = randomCard(true);
var turn = -1;

function randomString(length) {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for ( var i = 0; i < length; i++ ) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomCard(noPowerCards) {
  getRandomInt = (min,max) => Math.floor(Math.random() * ((max + 1) - min)) + min;
  if ( Math.floor(Math.random() * 14) == 0 && (! noPowerCards) ) {
    return [0,getRandomInt(0,1)];
  } else {
    return [getRandomInt(1,4),getRandomInt(0,noPowerCards ? 9 : 13)];
  }
}

function getGameState(id) {
  var data = users.filter(item => item.id == id);
  if ( data.length <= 0 ) return "err_invalid_id";
  data = data[0];
  return JSON.stringify({
    cards: data.cards,
    id: id,
    turn: turn,
    currentCard: currentCard
  });
}

app.get("/api/init_player",function(request,response) {
  var qs = request.url.split("?").slice(1).join("?");
  if ( ! qs ) {
    response.send("err_args_missing");
    return;
  }
  var id = randomString(10);
  users.push({
    id: id,
    nick: qs,
    cards: "x".repeat(7).split("").map(item => randomCard())
  });
  if ( turn < 0 ) turn = 0;
  response.send(getGameState(id));
});

app.get("/api/get_state",function(request,response) {
  var qs = request.url.split("?").slice(1).join("?");
  if ( ! qs ) {
    response.send("err_args_missing");
    return;
  }
  response.send(getGameState(qs));
});

app.get("/api/play_card",function(request,response) {
  var qs = request.url.split("?").slice(1).join("?");
  var id,index;
  [id,index] = qs.split(",");
  if ( ! qs || qs.split(",").length != 2 ) {
    response.send("err_args_missing");
    return;
  }
  var data = users.filter(item => item.id == id);
  if ( data.length <= 0 ) {
    response.send("err_invalid_id");
    return;
  }
  data = data[0];
  var uIndex = users.indexOf(data);
  if ( uIndex != turn ) {
    response.send("err_incorrect_turn");
    return;
  }
  if ( ! data.cards[index] ) {
    response.send("err_no_such_card");
    return;
  }
  if ( (data.cards[index][0] != 0 && (data.cards[index][0] == currentCard[0] || data.cards[index][1] == currentCard)) || data.cards[index][0] == 0 ) {
    currentCard = data.cards[index];
    data.cards.splice(index,1);
    users[uIndex].cards = data.cards;
    turn++;
    response.send(getGameState(id));
  } else {
    response.send("err_invalid_card");
  }
});

app.get("/api/draw_card",function(request,response) {
  var qs = request.url.split("?").slice(1).join("?");
  if ( ! qs ) {
    response.send("err_args_missing");
    return;
  }
  var data = users.filter(item => item.id == qs);
  if ( data.length <= 0 ) {
    response.send("err_invalid_id");
    return;
  }
  data = data[0];
  var uIndex = users.indexOf(data);
  data.cards.push(randomCard());
  users[uIndex].cards = data.cards;
  response.send(getGameState(qs));
});

app.use("/public",express.static(__dirname + "/public"));

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});