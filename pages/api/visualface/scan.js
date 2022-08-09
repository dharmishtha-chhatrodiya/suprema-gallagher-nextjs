const axios = require("axios");
const httpsAgent = require("../../../httpsagents");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../../helpers/bsSession";

export default async function scan(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const sessionId = await getBsSessionId();
  try {
    const {
      visualfacesSerial,
      uniqueId,
      deviceid,
      pose_sensitivity,
      nonBlock,
    } = req.body.visualFaceBody;

    if (deviceid == "" || deviceid == "SelectDevice") {
      console.log("Device is not selected");
      res.send({ message: "device is not selected" });
    }
    const paddedSerial = visualfacesSerial.padStart(2, "0");
    const responseFromScanVisualFaces = await axios({
      method: "GET",
      url: `${process.env.SUPREMA_BASE_URL}/devices/${parseInt(
        deviceid
      )}/credentials/face?pose_sensitivity=${pose_sensitivity}&nonBlock=${nonBlock}`,
      headers: {
        "bs-session-id": `${sessionId}`,
      },
      httpsAgent,
    });

    if (
      responseFromScanVisualFaces.data.Response.code === "0" &&
      responseFromScanVisualFaces.data.Response.message === "Success"
    ) {
      if (!(+visualfacesSerial <= 2)) {
        throw {
          message: "No more than 2 faces allowed for scan",
          code: StatusCodes.BAD_REQUEST,
        };
      } else {
        const templateJson = fs.existsSync(
          `./${parseInt(uniqueId)}_${paddedSerial}.json`
        );
        if (templateJson === false) {
          fs.writeFileSync(
            `./${parseInt(uniqueId)}_${paddedSerial}.json`,
            JSON.stringify({
              credentials: {
                visualFaces: responseFromScanVisualFaces.data.credentials.faces,
              },
            })
          );

          return res.send({
            credentials: {
              visualFaces: responseFromScanVisualFaces.data.credentials.faces,
            },
          });
        } else {
          fs.writeFileSync(
            `./${uniqueId}_${paddedSerial}.json`,
            JSON.stringify({
              credentials: {
                visualFaces: responseFromScanVisualFaces.data.credentials.faces,
              },
            })
          );
          return res.send({
            credentials: {
              visualFaces: responseFromScanVisualFaces.data.credentials.faces,
            },
          });
        }
      }
    }
  } catch (error) {
    console.log(error.response.data, "error");
    if (error.response.data.Response.code == "262163") {
      res.send({
        message:
          "Failed to scan a face.Please check the device mode and connection status, and whether a face was scanned within the specified timeperiod. (262163)",
      });
    } else if (error.response.data.Response.code == "1003") {
      res.send({
        message: "Device is not respond in timeout period",
      });
    }
  }
}
