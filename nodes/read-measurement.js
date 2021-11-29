var NODE_TYPE = 'scd4x-read-measurement';

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric'
  });
}

module.exports = function (RED) {
  function ReadMeasurementNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    this.on('input', function (msg, send, done) {
      var scd4xPromise = RED.nodes.getNode(config.scd4xConfig).scd4x;

      scd4xPromise
        .then(function (scd4x) {
          return scd4x.readMeasurement();
        })
        .then(function (measurement) {
          send({
            topic: 'scd4x',
            payload: measurement
          });
          node.status({fill: 'green', shape: 'dot', text: `${Math.round(measurement.co2Concentration)} ppm at ${formatDate(new Date())}`});
          done();
        })
        .catch(function(err) {
          node.status({fill: 'red', shape: 'ring', text: 'Error'});
          done(err);
        });
    })
  }

  RED.nodes.registerType(NODE_TYPE, ReadMeasurementNode);
};
