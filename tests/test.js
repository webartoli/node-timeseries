var assert = require("assert");
var timeSeries = require("../index")('./myDb');

describe("timeSeries Module",function(){
	it("should work",function(){

		var value = {
			assetId:'1',
			value:'value'
		};

		timeSeries.add(value,function(){
			console.log('Done');	
			assert.equal(1,1);
		});
	})
});