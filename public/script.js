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
    currentState.currentCard = [0,1];
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
    if ( card[1] == 1 ) {
      ctx.fillStyle = "#fff";
      ctx.fillText("+4",canvas.width / 2 - 37,canvas.height / 2 + 15);
    }
  }
}

function renderAllCards() {
  renderCard(document.getElementById("currentCard"),currentState.currentCard);
}