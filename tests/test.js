var assert = require("assert");
var level = require('level-test')();
var timeSeriesFactory = require("../index");

describe("timeSeries Module",function(){
	
	var db;
	
	beforeEach(function () {
		db = level('foo', { encoding: 'json' });
	});
	
	it("should work",function(){
		
		var timeSeries = timeSeriesFactory(db);

		var value = {
			assetId:'1',
			value:'value'
		};

		timeSeries.add(value,function(){
			console.log('Done');	
			assert.equal(1,1);
		});
	}); 
	
	afterEach(function() {
		db.close();
	});
});