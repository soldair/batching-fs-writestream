# batching-fs-writestream
writes files faster by writing data to disk in chunks rather then one syscall for each call to write as in `fs.createWriteStream` except buffers chunks of data while other writes are pending to batch them to disk


## EXAMPLE

```js
var batching = require('batching-fs-writestream')

var ws = batching('./test.log') 

var start = Date.now();

ws.on('finish',function(){
  var end = Date,now()

  console.log('took ',end-start,'ms')

})


for(var i=0;++i;i<10000){
  ws.write(Math.random()+"\n")
}

ws.end();

```

its more than 50% faster in most cases where you have many small writes.


```
$ node without.js 
took  155 ms
$ node exmaple.js 
took  45 ms

```

the only change is using this buffered write stream instead of the stock f.createWriteStream


## api

module.exorts(file,options)

  - file the file name
  - options

    - flags
    - highWaterMark, default 10000. how much to buffer before pausing
    - pending, default 2. how many pending calls to fs.write should be active concurrently 

 if options is a string is is passed in as flags to fs.createWriteStream "a+"

