var fs = require('fs')

var ws = fs.createWriteStream('./test.log')

var start = Date.now();

ws.on('finish',function(){
  var end = Date.now()

  console.log('took ',end-start,'ms')

})


for(var i=0;i<10000;++i){
  ws.write(Math.random()+"\n")
}


ws.end();
