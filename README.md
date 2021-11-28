# node-red-contrib-scd4x

Node-RED node for reading measurements from Sensirion SCD40 and SCD41, the CO2, temperature, and humidity sensors.

Uses [scd4x-node](https://github.com/rsmeral/scd4x-node).

## Usage

Find the `scd4x` node in the `sensor` category in the palette, and use in your flow.

The node replaces the message payload with an object containing the measured values:
```typescript
{
  co2Concentration: <number>,
  temperature: <number>,
  relativeHumidity: <number>
}
```

### Requirements

The SCD4x must be in periodic measurement mode and a measurement must be available when triggering this node.

The permission to read the I2C bus device (e.g. `/dev/i2c-1`) is required.

## Usage in Docker on Raspberry Pi

When starting the Node-RED container, use these options:
* `--device /dev/i2c-1` – point to the I2C device to which the SCD4x is connected
* `--group-add <id of i2c group>` – make the container process run as a member of the `i2c` group

For example:
```
docker run -d \
  -p 1880:1880 \
  -v /home/pi/.node-red:/data \
  --device /dev/i2c-1 \
  --group-add 998 \
  --name nodered \
  nodered/node-red
```
