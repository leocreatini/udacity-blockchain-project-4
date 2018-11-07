// global imports
const level = require('level');

// Database class
class Database {
  constructor(location) {
    this.database = level(location);
  }

  static formatData(rawData) {
    return rawData.map(({ value }) => value);
  }

  getData() {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        let list = [];
        return self.database
          .createReadStream()
          .on('error', err => reject(err))
          .on('data', ({ key, value }) => list.push({ key, value: JSON.parse(value) }))
          .on('close', () => resolve(list));
      } catch (error) {
        return reject(error)
      }
    });
  }
  
  async getFormattedData() {
    const self = this;
    const data = await self.getData();
    return Database.formatData(data);
  }

  // Get data from levelDB with key
  async getValue(dirtyKey) {
    const self = this;
    const key = dirtyKey.toString(); // ensure it's a string
    try {
      const data = await self.getData();
      const filtered = data.filter(item => item.key === key)[0];
      if (!data || !filtered || filtered.length === 0) {
        throw new Error('No data found!');
      }
      return filtered.value;
    } catch (error) {
      console.log(`getValue -- error: key #${key} not found.`);
    }
  }

  // Add data to levelDB with key/value pair
  async addKeyValue(dirtyKey, value) {
    const self = this;
    const key = dirtyKey.toString(); // ensure it's a string
    try {
      await self.database.put(key, JSON.stringify(value));
    } catch (error) {
      console.log('addKeyValue -- error', error);
    }
  }


  // Add data to levelDB with value
  async push(value) {
    const self = this;
    try {
      const height = await self.getLength();
      await this.addKeyValue(height.toString(), value);
    } catch (error) {
      console.log('push -- error', value, error);
    }
  }

  async filterOut(value) {
    const self = this;
    try {
      const data = await self.getFormattedData();
      const key = data.reduce((acc, item, index) => {
        if (acc >= 0) { return acc; }
        if (item === value) { return index; }
        return acc;
      }, -1);
      await self.database.del(key);
    } catch (error) {
      console.log('push -- error', value, error);
    }
  }

  // Add data to levelDB with value
  async getLength() {
    const self = this;
    try {
      const data = await self.getData();
      return data.length;
    } catch (error) {
      console.log('getLength -- error', key, value, error);
    }
  }
}

module.exports = { Database };