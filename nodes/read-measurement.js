const SCD4x = require("scd4x-node").SCD4x;

const NODE_TYPE = "scd4x-read-measurement";

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour12: false,
    hour: "numeric",
    minute: "numeric",
  });
};

const sleep = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const ReadMeasurementInitializer = function (RED) {
  function ReadMeasurementNode(config) {
    this.scd4x = null;

    const stopPeriodic = async (scd4x) => {
      try {
        await scd4x.stopPeriodicMeasurement();
        await sleep(500);
      } catch (e) {
        this.log("Periodic measurement already stopped");
      }
    };

    const startPeriodic = async (scd4x, config) => {
      switch (config.mode) {
        case "periodic":
          try {
            await scd4x.startPeriodicMeasurement();
          } catch (e) {
            this.warn("Periodic measurement already on");
          }
          break;
        case "periodic-lowpower":
          try {
            await scd4x.startLowPowerPeriodicMeasurement();
          } catch (e) {
            this.warn("Periodic measurement already on");
          }
          break;
      }
    };

    const setTempOffset = async (scd4x, offset) => {
      try {
        await scd4x.setTemperatureOffset(offset);
        await sleep(1);
      } catch (e) {
        this.error("Got an error while setting temperature offset");
      }
    };

    const setAsc = async (scd4x, ascEnabled) => {
      try {
        await scd4x.setAutomaticSelfCalibrationEnabled(ascEnabled);
        await sleep(1);
      } catch (e) {
        this.error("Got an error while setting automatic self-calibration");
      }
    };

    const getConnection = async () => {
      if (!this.scd4x) {
        this.scd4x = await SCD4x.connect(Number(config.busNumber));
        await stopPeriodic(this.scd4x);
        await setTempOffset(this.scd4x, config.tempOffset);
        await setAsc(this.scd4x, config.asc);
        await startPeriodic(this.scd4x, config);
      }
      return this.scd4x;
    };

    RED.nodes.createNode(this, config);

    this.on("input", async (msg, send, done) => {
      try {
        const scd4x = await getConnection();

        const isDataReady = await scd4x.isDataReady();
        if (!isDataReady) {
          done();
          return;
        }

        const measurement = await scd4x.readMeasurement();

        send({ topic: "scd4x", payload: measurement });

        this.status({
          fill: "green",
          shape: "dot",
          text: `${Math.round(
            measurement.co2Concentration,
          )} ppm at ${formatDate(new Date())}`,
        });
        done();
      } catch (e) {
        this.error("Caught error");
        this.error(e);
        this.status({ fill: "red", shape: "ring", text: "Error" });
        done(e);
      }
    });
  }

  RED.nodes.registerType(NODE_TYPE, ReadMeasurementNode);
};

module.exports = ReadMeasurementInitializer;
