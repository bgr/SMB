
//var elem = document.getElementById('game');
var elem = $('#game')[0];

var manifest = [
  {src:'assets/levels/1-1.txt', id:'level1-1'},
  {src:'assets/images/smbtiles.png', id:'spriteset_1'}
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

var gameState = {
  viewportX : 0,
  type: 'level',
  data: {}
};


function parseMap(mapString) {
  var mapStuff = mapString.split(';');
  
  var mapData = mapStuff[0].split(',');
  // assert mapData.length % 15 == 0
  var height = 15; // all mario levels have height of 15 blocks
  var width = mapData.length / height;
  
  var parsed = { 
    bgColor: null, 
    bgData: null, 
    entities: null, 
    timeLimit: null, 
    spriteSet: null,
    music: null,
    hasWarpZone: false,
    underwater: false
  };

  var map = [];
  for(var y=0; y < height; y++) {
     var row = [];
     for(var x=0; x < width; x++) {
       var blockID = mapData[y*width+x];
       row.push(blockID);
     }
     map.push(row);
  }
  parsed.bgData = map;

  for(var i=1; i < mapStuff.length; i++) {
    var kv = mapStuff[i].split('=');
    switch ( kv[0] ) {
      case 'background':
        switch ( kv[1] ) {
          case '1':
            parsed.bgColor = '5c94fc'; break;
          case '2':
            parsed.bgColor = '007700'; break;
          case '3':
            parsed.bgColor = '2038ec'; break;
          default:
            parsed.bgColor = 'FF00FF'; console.err('Unknown background color id '+kv[1]);
        };
        break;
      case 'spriteset':
        parsed.spriteSet = 'spriteset_' + kv[1]; break;
      case 'timelimit':
        parsed.time = kv[1]; break;
      case 'music':
        parsed.music = kv[1]; break;
      case 'underwater':
        parsed.underwater = true; break;
      case 'haswarpzone':
        parsed.hasWarpZone = true; break;
      default:
        console.log('Found map parameter ' + mapStuff[i]);
    }
  }
  return parsed;
}


var renderScale = 2;

function render(gameState) {
  // viewport dimensions
  var map = gameState.data.bgData;
  var bgColor = gameState.data.bgColor;
  var spriteSet = assets[gameState.data.spriteSet];
  var mapWidthPx = (map[0].length - Screen_Width_Blocks) * Block_Size_Px;

  gameState.viewportX = mapWidthPx*(mouse.x/(Screen_Width_Px*renderScale));
  gameState.viewportX = Math.min(mapWidthPx, Math.max(gameState.viewportX,0));

  var b = Math.floor(gameState.viewportX / Block_Size_Px); // first column of blocks in map
  var viewport_offset = gameState.viewportX % Block_Size_Px;

  canvas.font = 'regular 15px sans-serif';
  canvas.textBaseline = 'top';

  // clear to background color
  canvas.fillStyle = bgColor;
  canvas.fillRect(0,0, Screen_Width_Px * renderScale, Screen_Height_Px * renderScale);

  for(var y=0; y < Screen_Height_Blocks; y++) {
    for(var x=0; x <= Screen_Width_Blocks; x++) {

      var block = map[y][x+b];

      if(block=='1') continue; // block is background

      var rx = (x*Block_Size_Px-viewport_offset)*renderScale;
      var ry = y*Block_Size_Px*renderScale;
      var wh = Block_Size_Px*renderScale;

      //canvas.fillStyle = getColor(block);
      //canvas.fillRect(rx, ry, wh, wh);
      var bi = parseInt(block)-1;
      ssX = (bi*17) % spriteSet.width;
      ssY = Math.floor((bi*17)/spriteSet.width)*17;
      canvas.drawImage(spriteSet, ssX, ssY, 16, 16, rx, ry, wh, wh);

      // print block info text
      canvas.fillStyle = '#000000';
      canvas.fillText  (block, rx, ry);
    }
  }
}


// store mouse coordinates
var mouse = {x:0, y:0};
$('#game').mousemove(function(e) { 
  mouse.x = e.pageX - e.target.offsetLeft;
  mouse.y = e.pageY - e.target.offsetTop;
});


function renderLoop() {
  window.requestAnimFrame(renderLoop);
  render(gameState);
}


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ) { window.setTimeout(callback, 1000 / 60); };
})();



var tilesMetadata = [];

// dev utility to update spritesheet mappings during runtime
function reloadSpriteSheets() {
  $.getJSON('assets/tiles_metadata.json', function(json) { tilesMetadata = json; });
}

// called once after all assets are loaded
function run() {
  //console.log(assets);
  tilesMetadata = $.parseJSON(assets['tiles_metadata_levels']);
  gameState.data = parseMap(assets['level1-1']);
  renderLoop();
  //console.log(colorTable);
}
