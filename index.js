var moment = require('moment');
var levelup = require('level');

module.exports = function build(dbPath) {
		
	var now;
	var count;
	
	return {
	
		add : function(assetId, value, date) {
			var current = Date.now();
			
			if (current === now) {
				count++;
			} else {
				count = 0;
			}
			now = current;
			date = date || moment();
			
			var keyTs = "ts::" + now + ":" + count;
			var keyAs = "as::" + assetId + "--"+ now + ":" + count;
			
			db.put(keyTs, value);
			db.put(keyAs + ":" + count,value);
			
		},
		
		fetch : function( from, to, assetId) {
			
			var prefix;
			
			if (!assetId) {
				assetId = assetId || "";
				prefix = "ts::";
			}
			else {
				prefix = "as::";
			}	
		}
	};
};