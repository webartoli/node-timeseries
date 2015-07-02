var assert = require("assert");
var level = require('level-test')();
var timeSeriesFactory = require("../index");
var callbackStream = require("callback-stream");

describe("timeSeries Module",function(){
	
	var db;
	var count = 0;
	
	beforeEach(function (done) {
		db = level('foo', {clean:true}, done);
	});
	
	it("should work",function(done){
		
		var timeSeries = timeSeriesFactory(db);

		var value = {
			assetId:'1',
			value:'value'
		};

		timeSeries.add(value,function(err,returnValue){
			assert.equal(returnValue.value,value.value);
			done();
		});
	}); 

	it("should store",function(done){
		var timeSeries = timeSeriesFactory(db);

		var value = {
			assetId:'1',
			value:'value'
		};

		timeSeries.add(value,function(err,returnValue){
			var queryData = {
				assetId:'1'
			};
			timeSeries.getDataStream({})
			.pipe(callbackStream({ objectMode: true }, function(err,data){
				assert.equal(data.length,1);	
				done();
			}));
		});
	});
	
	afterEach(function(done) {
		db.close(done);
	});
});