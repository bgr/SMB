
//var elem = document.getElementById('game');
var elem = $('#game')[0];

var manifest = [
  {src:'./assets/levels/1-1.txt', id:'level1-1'}
];

var assets = []; // function that serves as a map, call asset(assetID) to get asset object

if (elem && elem.getContext) {
  var canvas = elem.getContext('2d');
  if (canvas) {
    var preload = new createjs.PreloadJS();
    preload.onFileLoad = function(e) {
      //console.log("file complete");
      assets[e.id] = e.result;
      //console.log(e);
    }

    preload.onComplete = function(e) {
      //console.log("completed");
      //console.log(e);
      //asset = preload.getResult; // make asset function point here
      run();
    }

    preload.loadManifest(manifest);
  }
}

var colorTable = [];
function getColor(val) {
  if(!colorTable.hasOwnProperty(val)) colorTable[val] = Math.floor(Math.random()*0xFFFFFF).toString(16);
  return colorTable[val];
}

Block_Size_Px = 16;
Screen_Width_Blocks = 16;
Screen_Height_Blocks = 15;
Screen_Width_Px = 256;
Screen_Height_Px = 240;

var gamestate = {
  viewportX : 0,
  type: 'level',
  data: { }
};


function parseMap(mapString) {
  var mapSplit = mapString.substr(0,mapString.indexOf(';')).split(',');
  // assert map.length % 15 == 0
  var height = 15; // all mario levels have height of 15 blocks
  var width = mapSplit.length / height;
  var map = [];
  for(var y=0; y < height; y++) {
     var row = [];
     for(var x=0; x < width; x++) {
       var blockID = mapSplit[y*width+x];
       row.push(blockID);
     }
     map.push(row);
  }
  return { bg: map, entities:[], time:400, lives: 3 };
}


var renderScale = 2;

function render(gamestate) {
  // viewport dimensions
  var map = gamestate.data.bg;
  var mapWidthPx = (map[0].length - Screen_Width_Blocks) * Block_Size_Px;

  gamestate.viewportX = mapWidthPx*(mouse.x/(Screen_Width_Px*renderScale));
  gamestate.viewportX = Math.min(mapWidthPx, Math.max(gamestate.viewportX,0));

  var vx = gamestate.viewportX;
  var b = Math.floor(vx/Block_Size_Px); // first column of blocks in map
  var viewport_offset = vx % Block_Size_Px;

  for(var y=0; y < Screen_Height_Blocks; y++) {
    for(var x=0; x <= Screen_Width_Blocks; x++) {
      var block = map[y][x+b];
      canvas.fillStyle = getColor(block);
      //canvas.lineStyle = '#000000';
      var rx = (x*Block_Size_Px-viewport_offset)*renderScale;
      var ry = y*Block_Size_Px*renderScale;
      var wh = Block_Size_Px*renderScale;
      canvas.fillRect(rx, ry, wh, wh);
    }
  }
}

mouse = {x:0, y:0};
$('#game').mousemove(function(e) { 
  mouse.x = e.pageX - e.target.offsetLeft;
  mouse.y = e.pageY - e.target.offsetTop;
});


function renderLoop() {
  window.requestAnimFrame(renderLoop);
  render(gamestate);
  //console.log("RENDER LOOP!!");
}


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();



function run() {
  //console.log(assets);
  gamestate.data = parseMap(assets['level1-1']);
  renderLoop();
  //console.log(colorTable);
}
