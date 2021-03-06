// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tdcSchema = new Schema({
  name: { type: String , required: true },
  unit: { type: String},
  is_actuable: { type : Boolean, default: false },
  properties : { type: Schema.Types.Mixed },
  value: {type: String},
  timestamp: {type: String}
});

tdcSchema.pre('save', function(next) {
  var tdcName = this.name;
  tdcName = tdcName.toLowerCase().replace(/ /g, "_");
  this.name = tdcName;
  next();
});

module.exports = tdcSchema;
