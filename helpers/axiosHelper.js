const axios = require("axios");
const httpsAgent = require("../httpsagents");

class Axios {
  async supremaEndpoint(method, endpoint, payload, headers) {
    const object = {
      method,
      url: `${process.env.SUPREMA_BASE_URL}/${endpoint}`,
      httpsAgent,
    };
    if (headers !== undefined) {
      object.headers = headers;
    }
    if (payload !== undefined) {
      object.payload = payload;
    }

    return await axios({ ...object });
  }

  async supremaLogin(data) {
    // return await this.supremaEndpoint("POST", "login", data);

    const login = await axios({
      method: "POST",
      url: `${process.env.SUPREMA_BASE_URL}/login`,
      httpsAgent,
      data,
    });

    return login;
  }

  async gallagherEndpoint(method, endpoint, payload, headers) {
    const object = {
      method,
      url: `${process.env.GALLAGHER_BASE_URL}/${endpoint}`,
      httpsAgent,
    };

    if (headers !== undefined) {
      object.headers = headers;
    }
    if (payload !== undefined) {
      object.payload = payload;
    }
    return await axios({ ...object });
  }
}
module.exports = new Axios();
