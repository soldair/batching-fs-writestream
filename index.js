var through2 = require('through2')
var fs = require('fs')

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
    
    if(options.flush){
      var orig = cb;
      cb = function(){
        options.flush(function(){
          orig()
        })
      }
    }
    drain(cb)

  })

  s._bufData = function () {
    return {bufferedWrites: bufferedWrites, writes: writes, pauses: pauses, resumes: resumes, pending: pending, bufs: bufs, bufLen: bufLen, paused: !!unPause}
  }

  return s

  function drain (cb) {
    var toWrite = Buffer.concat(bufs)
    bufs = []
    bufLen = 0

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

    })
  }

}
