const axios = require("axios");
const httpsAgent = require("../../../httpsagents");
const fs = require("fs");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../../helpers/bsSession";

export default async function reset(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const sessionId = await getBsSessionId();
  try {
    console.log("111111");
    const { uniqueId, visualfacesSerial, userId } = req.body.visualFaceReset;
    console.log(
      visualfacesSerial,
      "visualfacesSerial from resetUserVisualFacebyId"
    );
    let valueforpush = [];
    for (let i = 0; i < visualfacesSerial.length; i++) {
      const paddedSerial = visualfacesSerial[i].padStart(2, "0");
      valueforpush.push(`${uniqueId}_${paddedSerial}`);
      const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
      if (checkfileexists) {
        fs.unlinkSync(`${valueforpush[i]}.json`);
      } else {
        console.log("no File found for delete");
        const responsePutUser = await axios({
          method: "PUT",
          url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
          headers: {
            "bs-session-id": `${sessionId}`,
          },
          httpsAgent,
          data: { User: { credentials: { visualFaces: [] } } },
        });
        console.log(responsePutUser);
        if (responsePutUser.status == 200) {
          res.send({
            message: "Data reset successfully",
            success: true,
          });
        }
      }
    }
  } catch (error) {
    console.log(error, "Error from ResetUserVisualFacebyId");
  }
}
