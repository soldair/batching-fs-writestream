var test = require('tape')

var through2 = require('through2')
var bws = require('../')
var fs = require('fs')

var streams = {}

fs.createWriteStream = function (file) {
  if (!streams[file]) streams[file] = []

  var data = []
  streams[file].push(data)

  var s = through2(function (chunk, enc, cb) {
    data.push(chunk)
    cb()
  })

  return s
}

test('can', function (t) {
  var id = Date.now()

  var s = bws(id, {highWaterMark: 10})

  s.write('hi')
  t.ok(streams[id], 'should have made fs stream')

  var streamData = streams[id][streams[id].length - 1]

  t.equals(streamData.length, 1, 'should have written data')

  s.write('ho')
  s.write('he')

  var o = s._bufData()

  console.log(o)
  console.log(streamData)

  t.equals(o.bufs.length, 1, 'should have 1 buffer buffered')
  t.equals(streamData.length, 2, 'should have written twice')

  setImmediate(function () {
    var o = s._bufData()
    console.log(o)
    console.log(streamData)

    t.equals(streamData.length, 3, 'should have written thrice')

    t.equals(s._bufData().pauses, 0, 'should have not paused')
    s.write('1234567890')
    s.write('1234567890')
    s.write('1234567890')
    t.equals(s._bufData().pauses, 1, 'should have paused')

    setImmediate(function () {
      var o = s._bufData()
      t.equals(o.resumes, o.pauses, 'should have resumed')
      t.end()
    })

  })
})
