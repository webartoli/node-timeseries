var moment = require('moment');
var levelup = require('level');

module.exports = function build(dbPath) {

	var db = levelup(dbPath);

	var now;
	var count;

	return {

		add: function (assetId, value, date, cb) {
			var current = Date.now();

			if (current === now) {
				count++;
			} else {
				count = 0;
			}
			now = current;
			date = date || moment();

			var keyTs = "ts::" + now + ":" + count;
			var keyAs = "as::" + assetId + "--" + now + ":" + count;

			db.batch()
				.put(keyTs, value)
				.put(keyAs, value)
				.write(function (){
					cb(null);
				});
		},

		fetch: function (from, to, assetId, cb) {

			var gt;
			var lt;
			var prefix;
			var options;

			if (!assetId) {
				prefix = "ts::";
				assetId = "";
			}
			else {
				prefix = "as::";
				assetId = assetId + "--";
			}

			gt = prefix + assetId + from;
			lt = prefix + assetId + to;

			options = {
				lt: lt,
				gt: gt
			};
			
			var result = [];

			db.createReadStream(options)
				.on('data', function (data) {
					result.push(data.value);
					console.log(data.key, '=', data.value);
			})
				.on('error', function (err) {
					console.log('Oh my!', err);
					cb(err);
			})
				.on('close', function () {
					console.log('Stream closed');
			})
				.on('end', function () {
					console.log('Stream closed');
					cb(null,result);
			});
		}
	};
};