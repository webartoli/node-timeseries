var assert = require("assert");
var level = require('level-test')();
var timeSeriesFactory = require("../index");
var callbackStream = require("callback-stream");
var from = require('from2');

describe("timeSeries Module", function () {

  var db;
  var count = 0;

  beforeEach(function (done) {
    db = level('foo', { clean: true }, done);
  });

  it("should work", function (done) {

    var timeSeries = timeSeriesFactory(db);

    var value = {
      assetId: '1',
      value: 'value'
    };

    timeSeries.add(value, function (err, returnValue) {

      assert.equal(returnValue.value, value.value);
      done();
    });
  });

  it("should store", function (done) {
    var timeSeries = timeSeriesFactory(db);

    var value = {
      assetId: '1',
      value: 'value'
    };

    timeSeries.add(value, function (err, returnValue) {
      var queryData = {
        assetId: '1'
      };
      timeSeries.getDataStream(queryData)
        .pipe(callbackStream({ objectMode: true }, function (err, data) {
        	assert.equal(data.length, 1);
	        done();
      }));
    });
  });

  it("should expose a writable stream", function (done) {
    var timeSeries = timeSeriesFactory(db);
    var counter = 0;
    var MAX = 2;
    var stream = from.obj(function(size, next){
    	if(counter > MAX){
    		return next(null,null);
		}

		counter++;

    	next(null,{
    		assetId: '1',
      		value: ''+counter+Math.random() * (100 - 0) + 0
    	});
    });

    stream.pipe(timeSeries.generateWriteStream())
    .on('error',function(err,data){
    	console.log("Error",err);
    	done();
    })
    .on('finish',function(){
      var queryData = {
        assetId: '1'
      };
      timeSeries.getDataStream(queryData)
        .pipe(callbackStream({ objectMode: true }, function (err, data) {
        	assert.equal(data.length, MAX);
	        done();
      }));
    })
    	
  });

  afterEach(function (done) {
    db.close(done);
  });
});