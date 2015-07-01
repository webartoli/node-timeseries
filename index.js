var moment = require('moment');

module.exports = function build(db) {

	var now;
	var count;

	var incCounter = function(){
		var current = Date.now();

			if (current === now) {
				count++;
			} else {
				count = 0;
			}
			now = current;

			return now;

	};

	return {

		add: function (value, cb) {

			//TODO: validazione
			value.date = value.date || moment().toDate();

			incCounter();

			var keyTs = "ts::" + now + ":" + count;
			var keyAs = "as::" + value.assetId + "--" + now + ":" + count;

			db.batch()
				.put(keyTs, value)
				.put(keyAs, value)
				.write(function (){
					cb(null,value);
				});
		},

		getDataStream: function (queryValues, cb) {

			//TODO: Validazione

			var gt;
			var lt;
			var prefix;
			var options;
			var assetId;

			if (!queryValues.assetId) {
				prefix = "ts::";
				assetId = "";
			}
			else {
				prefix = "as::";
				assetId = queryValues.assetId + "--";
			}

			gt = prefix + assetId + queryValues.from;
			lt = prefix + assetId + queryValues.to;

			options = {
				lt: lt,
				gt: gt
			};

			return db.createReadStream(options);
		}
	};
};