var SCD4x = require('scd4x-node').SCD4x;

var NODE_TYPE = 'scd4x-config';

module.exports = function (RED) {
  function SCD4xConfigNode(config) {
    RED.nodes.createNode(this, config);

    this.scd4x = SCD4x.connect(Number(config.busNumber));
  }
  RED.nodes.registerType(NODE_TYPE, SCD4xConfigNode);
};
