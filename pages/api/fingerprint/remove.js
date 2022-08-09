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
  const sessionId = await getBsSessionId();
  const { add, uniqueId, userId } = req.body.removeFingerprint;
  const userDetilsbyId = await axios({
    method: "GET",
    url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
    headers: {
      "bs-session-id": `${sessionId}`,
    },
    httpsAgent,
  });
  // console.log(userDetilsbyId, "user");
  let userData;
  if (userDetilsbyId.status === StatusCodes.OK) {
    userData = userDetilsbyId.data;
    // console.log(userData, "userData");
  }

  if (add != undefined && uniqueId != undefined) {
    let valueforpush = [];
    const paddedSerial = add.padStart(2, "0");
    valueforpush.push(`${uniqueId}_${paddedSerial}`);
    const checkfileexists = fs.existsSync(`./${valueforpush}.json`);
    if (checkfileexists) {
      console.log("here for deleteing file");
      fs.unlinkSync(`${valueforpush}.json`);
      res.send({ message: "file remove successfully", success: true });
    } else {
      let template0 = [];

      // console.log(userData.User.fingerprint_templates, "1234567890987654321");
      if (userData.User?.fingerprint_templates?.length != 0) {
        let afterminues = parseInt(add) - 1;
        console.log(afterminues);
        userData.User?.fingerprint_templates?.splice(afterminues, 1);
        let dataaftersplice = userData.User?.fingerprint_templates;
        // console.log(dataaftersplice.length);
        for (let i = 0; i < dataaftersplice?.length; i++) {
          template0.push({
            template0: userData.User?.fingerprint_templates[i]?.template0,
            template1: userData.User?.fingerprint_templates[i]?.template1,
          });
        }
        let fingerprint_templates = [];
        for (let i = 0; i < template0.length; i++) {
          const data = {
            template0: template0[i].template0,
            template1: template0[i].template1,
            finger_mask: false,
            isNew: true,
          };
          fingerprint_templates.push(data);
        }

        // console.log(template0,"template0");
        // console.log(fingerprint_templates, "123321");
        // //  console.log(fingerprint_templates,"123321");
        const responsePutUser = await axios({
          method: "PUT",
          url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
          headers: {
            "bs-session-id": `${sessionId}`,
          },
          httpsAgent,
          data: { User: { fingerprint_templates } },
        });
        if (responsePutUser.status == 200) {
          res.send({ message: "data removed", success: true });
        }
      } else {
        console.log("No data from DB");
      }
    }
  } else {
    console.log("remove for fingerprint is not called");
  }
}
