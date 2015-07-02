var moment = require('moment');
var through2 = require('through2');
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

  var addValueSchema = Joi.object().keys({
    assetId: Joi.string().required(),
    date: Joi.date(),
    value: Joi.any().required()
  });

  function add(value, cb) {

    var validationResult = Joi.validate(value, addValueSchema);

    if (validationResult.error !== null) {

      console.error("add validation error is", validationResult.error);
      cb(validationResult.error);
      return;
    }

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
  }

  var getQueryValuesSchema = Joi.object().keys({
    assetId: Joi.string().required(),
    from: Joi.date(),
    to: Joi.date()
  });

  function getDataStream(queryValues) {
    
    var validationResult = Joi.validate(queryValues, getQueryValuesSchema);

    if (validationResult.error !== null) {

      console.error("getDataStream error is", validationResult.error);
      
      var stream = through2.obj()
      
      process.nextTick(function () {
        stream.emit('error', validationResult.error)
      })
      
      return stream;
    }

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

  return {
    addSchema: function () { return addValueSchema; },
    add: add,
    getQuerySchema: function () { return getQueryValuesSchema; },
    getDataStream: getDataStream
  };
};