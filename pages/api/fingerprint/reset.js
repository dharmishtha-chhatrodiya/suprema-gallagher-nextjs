import NextCors from "nextjs-cors";
const { getBsSessionId } = require("../../../helpers/bsSession");
const axios = require("axios");
const httpsAgent = require("../../../httpsagents");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");

export default async function scan(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const resetUserFingerprintbyId = async (
    uniqueId,
    visualfacesSerial,
    userId
  ) => {
    try {
      const sessionId = await getBsSessionId();
      console.log(
        visualfacesSerial,
        "Fingerprint from resetUserFingrprintbyId"
      );

      let valueforpush = [];
      for (let i = 0; i < visualfacesSerial; i++) {
        const paddedSerial = i.toString().padStart(2, "0");
        valueforpush.push(`${uniqueId}_${paddedSerial}`);
        const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
        if (checkfileexists) {
          console.log(valueforpush[i]);
          fs.unlinkSync(`${valueforpush[i]}.json`);
        } else {
          console.log("no File found for delete");
        }
      }
      const responsePutUser = await axios({
        method: "PUT",
        url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
        data: { User: { fingerprint_templates: [] } },
      });

      if (responsePutUser.status == 200) {
        return responsePutUser;
      }
    } catch (error) {
      console.log(error, "Error from ResetUserVisualFacebyId");
    }
  };
  const { uniqueId, reset, userId } = req.body.resetFingerprint;
  if (reset != undefined) {
    await resetUserFingerprintbyId(uniqueId, 10, userId);
    res.send({ message: "reset success", success: true });
  } else {
    console.log("reset for fingerprint is not called");
  }
}
