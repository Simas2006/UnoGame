var currentState;

function simpleAJAX(url,qs,callback) {
  var req = new XMLHttpRequest();
  req.onload = function() {
    callback(this.responseText);
  }
  req.open("GET",url + "?" + qs);
  req.send();
}

function doLogin() {
  simpleAJAX("/api/init_player",document.getElementById("nickname").value,function(data) {
    currentState = JSON.parse(data);
    renderAllCards();
  });
}

function renderCard(canvas,card) {
  var ctx = canvas.getContext("2d");
  var colors = ["#000","#d11","#31d","#073","#fc4"];
  ctx.fillStyle = colors[card[0]];
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2,canvas.height / 2,canvas.width / 2,canvas.height / 2,Math.PI * .8,0,2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = colors[card[0]];
  ctx.font = "60px Arial";
  if ( card[0] != 0 ) {
    var item = card[1].toString();
    var xoffset = 15;
    var yoffset = 20;
    if ( card[1] == 10 ) {
      item = "🚫";
      xoffset = 30;
      yoffset = 20;
    } else if ( card[1] == 11 ) {
      item = "↕";
      xoffset = 15;
      yoffset = 15;
    } else if ( card[1] == 12 ) {
      item = "+2";
      xoffset = 37;
      yoffset = 15;
    }
    ctx.fillText(item,canvas.width / 2 - xoffset,canvas.height / 2 + yoffset);
  } else {
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(canvas.width / 2,canvas.width / 2 + 10,canvas.width * .4,Math.PI,Math.PI * 1.5,false);
    ctx.lineTo(canvas.width / 2,canvas.width / 2 + 10);
    ctx.fill();
    ctx.fillStyle = colors[2];
    ctx.beginPath();
    ctx.arc(canvas.width / 2,canvas.width / 2 + 10,canvas.width * .4,0,Math.PI * 1.5,true);
    ctx.lineTo(canvas.width / 2,canvas.width / 2 + 10);
    ctx.fill();
    ctx.fillStyle = colors[3];
    ctx.beginPath();
    ctx.arc(canvas.width / 2,canvas.width / 2 + 10,canvas.width * .4,Math.PI * .5,Math.PI,false);
    ctx.lineTo(canvas.width / 2,canvas.width / 2 + 10);
    ctx.fill();
    ctx.fillStyle = colors[4];
    ctx.beginPath();
    ctx.arc(canvas.width / 2,canvas.width / 2 + 10,canvas.width * .4,0,Math.PI * 0.5,false);
    ctx.lineTo(canvas.width / 2,canvas.width / 2 + 10);
    ctx.fill();
    ctx.fillStyle = "#000";
    if ( card[1] == 1 ) {
      ctx.fillText("+4",canvas.width / 2 - 37,canvas.height / 2 + 15);
    } else if ( card[1] == 2 ) {
      ctx.font = "30px Arial";
      ctx.fillText("UNO",canvas.width / 2 - 33,canvas.height / 2 + 7);
    }
  }
}

function renderAllCards() {
  renderCard(document.getElementById("currentCard"),currentState.currentCard);
  renderCard(document.getElementById("drawCard"),[0,2]);
  var div = document.getElementById("cards");
  for ( var i = 0; i < currentState.cards.length; i++ ) {
    var canvas = document.createElement("canvas");
    canvas.height = "125";
    canvas.width = "100";
    div.appendChild(canvas);
    renderCard(canvas,currentState.cards[i]);
  }
}
