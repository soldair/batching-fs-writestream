
var ws = require('./')('./test.log')

var start = Date.now();

ws.on('finish',function(){
  var end = Date.now()

  console.log('took ',end-start,'ms')
  //console.log(ws._bufData())
})


for(var i=0;i<10000;++i){
  ws.write(Math.random()+"\n")
}


ws.end();
