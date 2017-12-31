var express = require("express");
var app = express();
var PORT = process.argv[2] || 8000;
var users = [];
var currentCard = randomCard(true);
var turn = -1;
var wildColor = -1;

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
    return [getRandomInt(1,4),getRandomInt(0,noPowerCards ? 9 : 12)];
  }
}

function getGameState(id) {
  var data = users.filter(item => item.id == id);
  if ( data.length <= 0 ) return "err_invalid_id";
  data = data[0];
  var specialCardsArr = users.filter(item => item.cards.length <= 1);
  var specialCards = {};
  for ( var i = 0; i < specialCardsArr.length; i++ ) {
    specialCards[specialCardsArr[i].nickname] = specialCardsArr[i].cards.length;
  }
  return JSON.stringify({
    id: id,
    turn: users[turn].nickname,
    yourTurn: users.indexOf(data) == turn,
    cards: data.cards,
    currentCard: currentCard,
    wildColor: wildColor,
    specialCards: specialCards
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
    nickname: qs,
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
  var id,index,wild;
  [id,index,wild] = qs.split(",");
  if ( ! qs || qs.split(",").length < 2 || qs.split(",").length > 3 ) {
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
  if ( data.cards[index] === undefined ) {
    response.send("err_no_such_card");
    return;
  }
  if ( (data.cards[index][0] != 0 && (data.cards[index][0] == currentCard[0] || data.cards[index][1] == currentCard[1])) ||
        data.cards[index][0] == 0 ||
        (currentCard[0] == 0 && currentCard[1] == 1) ||
        (currentCard[0] == 0 && currentCard[1] == 0 && data.cards[index][0] == wildColor) ) {
    currentCard = data.cards[index];
    data.cards.splice(index,1);
    var nextUser = turn + 1;
    while ( nextUser >= users.length || users[nextUser].cards.length <= 0 ) {
      if ( nextUser >= users.length ) nextUser = 0;
      else nextUser++;
    }
    if ( currentCard[0] == 0 && currentCard[1] == 0 ) wildColor = parseInt(wild);
    if ( ! ((currentCard[0] == 0 && currentCard[1] == 1) || currentCard[1] >= 10) ) turn = nextUser;
    users[uIndex].cards = data.cards;
    if ( currentCard[1] == 12 || (currentCard[0] == 0 && currentCard[1] == 1) ) {
      users[nextUser].cards.push(randomCard());
      users[nextUser].cards.push(randomCard());
      if ( currentCard[0] == 0 && currentCard[1] == 1 ) {
        users[nextUser].cards.push(randomCard());
        users[nextUser].cards.push(randomCard());
      }
    }
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

app.get("/api/sort_cards",function(request,response) {
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
  var toSort = [[0,1,2,3,4],[0,1,2,3,4]];
  toSort[0] = toSort[0].map(item => data.cards.filter(jtem => jtem[0] == item && jtem[1] <= 9 && jtem[0] != 0));
  toSort[1] = toSort[1].map(item => data.cards.filter(jtem => jtem[0] == item && (jtem[1] >= 10 || jtem[0] == 0)));
  toSort = toSort.map(item => item.map(jtem => jtem.sort((a,b) => a[1] - b[1])));
  console.log(toSort[1]);
  toSort = toSort.map(item => {
    var result = [];
    for ( var i = 0; i < item.length; i++ ) {
      result = result.concat(item[i]);
    }
    return result;
  });
  toSort = toSort[1].concat(toSort[0]);
  var uIndex = users.indexOf(data);
  users[uIndex].cards = toSort;
  response.send(getGameState(qs));
});

app.use("/public",express.static(__dirname + "/public"));

app.get("/",function(request,response) {
  response.redirect("/public/index.html");
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
});
