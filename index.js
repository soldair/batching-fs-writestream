var through2 = require('through2')
var fs = require('fs')
var eos = require('end-of-stream')


module.exports = function (file, options) {
  if (typeof options === 'string') options = {flags: options}
  options = options || {}

  options.pending = options.pending || 2

  var ws = fs.createWriteStream(file, options.flags)

  var bufs = []
  var bufLen = 0
  var bufferedWrites = 0
  var highWaterMark = options.highWaterMark || 10000
  var pauses = 0
  var pending = 0
  var resumes = 0
  var unPause
  var writes = 0

  var flushCb
  var writeEnded
  eos(ws,function(err){

    writeEnded = true;
  })

  var s = through2(function (chunk, enc, cb) {
    bufferedWrites++

    bufs.push(chunk)
    bufLen += chunk.length

    if (bufLen >= highWaterMark) {
      if (unPause) this.emit('error', 'pausing over paused')
      unPause = cb
      pauses++
    }

    // moved here so it behaves the same with sync or async stream write callbacks
    if (pending < options.pending) drain()
    if (!unPause) cb()

  }, function (cb) {

    flushCb = cb;
    if(options.flush){
      flushCb = function(){
        options.flush(function(){
          cb()
        })
      }
    }

    drain()
  })

  s._bufData = function () {
    return {bufferedWrites: bufferedWrites, writes: writes, pauses: pauses, resumes: resumes, pending: pending, bufs: bufs, bufLen: bufLen, paused: !!unPause}
  }

  // force to flowing mode because this should really be a writeable-stream only and i should fix that instead of hacking this.
  s.on('data',function(data){})

  return s

  function checkFlush(){
    if(!flushCb) return;
    if(!pending) {
      ws.end()
      flushCb()
    }
  }

  function drain (cb) {
    var toWrite = Buffer.concat(bufs)
    bufs = []
    bufLen = 0

    if(!toWrite.length) {
      if(cb) cb()
      return checkFlush();
    }

    pending++
    writes++
    ws.write(toWrite, function (written) {
      pending--

      if (bufs.length) drain()

      if (unPause && pending < options.pending) {
        var resume = unPause
        resumes++
        unPause = false
        resume()
      }

      if (cb) cb()
      checkFlush()
    })
  }

}
