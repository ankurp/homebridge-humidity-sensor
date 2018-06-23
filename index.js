const sensor = require('node-dht-sensor');

let Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-humidity-sensor', 'Humidity Sensor', Sensor);
};

class Sensor {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.pin = config.pin;
    this.currentRelativeHumidity = 50;
  }

  identify(callback) {
    this.log('Identify requested!');
    callback(null);
  }

  startReading() {
    const callback = () => {
      setTimeout(() => this.getReading(callback), 5000);
    };

    this.getReading(callback);
  }

  getReading(callback) {
    sensor.read(22, this.pin, (err, _, humidity) => {
      callback();
      if (err) {
        console.error(err); // eslint-disable-line no-console
        return;
      }

      this.currentRelativeHumidity = humidity;
      this.humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.currentRelativeHumidity);
    });
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Encore Dev Labs')
      .setCharacteristic(Characteristic.Model, 'Pi Humidity Sensor')
      .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi');

    this.humidityService = new Service.HumiditySensor(this.name);
    this.humidityService
      .getCharacteristic(Characteristic.CurrentRelativeHumidity)
      .on('get', (callback) => {
        callback(null, this.currentRelativeHumidity);
      });
    this.humidityService
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    this.startReading();

    return [informationService, this.humidityService];
  }
}
