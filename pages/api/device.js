const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../helpers/bsSession";
const httpsAgent = require("../../httpsagents");

export default async function device(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  try {
    const { authType } = req.body;
    const sessionId = await getBsSessionId();
    const devices = await axios({
      method: "GET",
      url: `${process.env.SUPREMA_BASE_URL}/devices`,
      headers: {
        "bs-session-id": `${sessionId}`,
      },
      httpsAgent,
    });

    if (devices.status === StatusCodes.OK) {
      const totaldevices = devices.data.DeviceCollection.total;
      const { rows } = devices.data.DeviceCollection;
      let activeDevices = [];
      let deviceInformation = [];
      for (let i = 0; i < totaldevices; i++) {
        deviceInformation = {
          id: rows[i].id,
          name: rows[i].name,
          device_type_id: rows[i].device_type_id.id,
          status: rows[i].status,
          fingerprint: rows[i].fingerprint,
          face: rows[i].face,
          card: rows[i].card,
          system: rows[i].system,
        };
        if (deviceInformation.status == "1") {
          activeDevices.push(deviceInformation);
        }
      }

      const device_types = await devicetypes(authType);
      activeDevices = activeDevices.filter((device) =>
        device_types.includes(device.device_type_id)
      );

      return res.send({ activeDevices });
    }
  } catch (error) {
    console.log(error.message);
  }
}

const devicetypes = async (authType) => {
  try {
    const sessionId = await getBsSessionId();
    const responseFromDevice_types = await axios({
      method: "GET",
      url: `${process.env.SUPREMA_BASE_URL}/device_types`,
      headers: {
        "bs-session-id": `${sessionId}`,
      },
      httpsAgent,
    });

    const { rows } = responseFromDevice_types.data.DeviceTypeCollection;
    let deviceByType = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][authType] == "true") {
        deviceByType.push(rows[i].id);
      }
    }
    return deviceByType;
  } catch (error) {
    console.log(error.message, "error from /api/device_types");
  }
};
