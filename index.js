var moment = require('moment');
var Joi = require('joi');

module.exports = function build(db) {
  var now;
  var count;

  var incCounter = function () {
    var current = Date.now();

    if (current === now) {
      count++;
    } else {
      count = 0;
    }
    now = current;

    return now;

  };

  var valueSchema = Joi.object().keys({
    assetId: Joi.string().required(),
    date: Joi.date(),
    value: Joi.any().required()
  });

  return {

    add: function (value, cb) {

      Joi.validate(value, valueSchema, function (err, value) {
        if (err === null) return;
        console.error(err);
      });

      value.date = value.date || moment().toDate();

      incCounter();

      var formattedDate = Math.floor(value.date / 1000)

      var keyTs = "ts::" + formattedDate + ":" + count;
      var keyAs = "as::" + value.assetId + "--" + formattedDate + ":" + count;

      db.batch()
        .put(keyTs, value, { valueEncoding: 'json' })
        .put(keyAs, value, { valueEncoding: 'json' })
        .write(function () {
        cb(null, value);
      });
    },

    getDataStream: function (queryValues, cb) {

      // validation

      var gt;
      var lt;
      var prefix;
      var options;
      var assetId;

      queryValues.from = queryValues.from || "";
      queryValues.to = queryValues.to || '\xff';

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
        valueEncoding: 'json',
        lte: lt,
        gte: gt
      };

      return db.createReadStream(options);
    }
  };
};