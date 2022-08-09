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
  const putUserFingerperintsbyId = async (
    uniqueId,
    userId,
    fingerprintSerial,
    fingerprint_templatesdb
  ) => {
    try {
      const sessionId = await getBsSessionId();
      let valueforpush = [];
      let template0 = [];
      if (fingerprint_templatesdb?.length != undefined) {
        for (let i = 0; i < fingerprintSerial.length; i++) {
          const paddedSerial = fingerprintSerial[i].padStart(2, "0");
          valueforpush.push(`${uniqueId}_${paddedSerial}`);
        }
        for (let i = 0; i < valueforpush.length; i++) {
          const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
          if (checkfileexists) {
            const jsonString = fs.readFileSync(`./${valueforpush[i]}.json`);

            const file = i;
            console.log(file, "this file is available,");

            template0[i] = {
              template0: JSON.parse(jsonString).fingerPrintsObj.template0,
              template1: JSON.parse(jsonString).fingerPrintsObj.template1,
            };
          } else if (fingerprint_templatesdb[i]?.template0 != undefined) {
            //  let fingerprint_templatesdb_template0= (fingerprint_templatesdb[i].template0)
            // let fingerprint_templatesdb_template1=(fingerprint_templatesdb[i].template1)
            // template0={fingerprint_templatesdb_template0,fingerprint_templatesdb_template1}
            template0[i] = {
              template0: fingerprint_templatesdb[i].template0,
              template1: fingerprint_templatesdb[i].template1,
            };
            // console.log(template0,"123321");
          }
          // console.log(visualface_templatesdb,"-=-=-=-=-=-=-=-=");
          // template0.push(visualface_templatesdb)
        }
      } else {
        console.log("no data found from database");

        for (let i = 0; i < fingerprintSerial.length; i++) {
          const paddedSerial = fingerprintSerial[i].padStart(2, "0");
          valueforpush.push(`${uniqueId}_${paddedSerial}`);
          const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
          if (checkfileexists) {
            const jsonString = fs.readFileSync(`./${valueforpush[i]}.json`);
            console.log(valueforpush);

            template0.push({
              template0: JSON.parse(jsonString).fingerPrintsObj.template0,
              template1: JSON.parse(jsonString).fingerPrintsObj.template1,
            });
          } else {
            console.log(
              "No fingerperints found please Enroll fingerperints first"
            );
          }
        }
      }
      //  console.log(template0.sort(),"123321");
      template0.sort();
      let template0temp = [];
      for (let i = 0; i < template0.length; i++) {
        if (template0[i]?.template0 != undefined) {
          template0temp[i] = template0[i];
        }
      }
      let fingerprint_templates = [];
      for (let i = 0; i < template0temp.length; i++) {
        const data = {
          template0: template0temp[i].template0,
          template1: template0temp[i].template1,
          finger_mask: false,
          isNew: true,
        };
        fingerprint_templates.push(data);
      }
      console.log(fingerprint_templates, "123321");
      //  console.log(fingerprint_templates,"123321");
      const responsePutUser = await axios({
        method: "PUT",
        url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
        data: { User: { fingerprint_templates } },
      });
      if (responsePutUser.status === StatusCodes.OK) {
        for (let i = 0; i < fingerprintSerial.length; i++) {
          const paddedSerial = fingerprintSerial[i].padStart(2, "0");
          valueforpush.push(`${uniqueId}_${paddedSerial}`);
          const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
          if (checkfileexists) {
            fs.unlinkSync(`${valueforpush[i]}.json`);
          } else {
            console.log({
              message: "No File founds after add fingerprints",
            });
          }
        }
        res.send({
          message: "data added sucuessfully",
          success: true,
          render: true,
        });
      }
    } catch (error) {
      console.log(error, "Error form userPut API");
      // return res.send({
      //   message: error.response.data
      // });
    }
  };

  const sessionId = await getBsSessionId();
  const { uniqueId, userId, enroll } = req.body.fingerprintSave;
  let fingerprint_templatesdb;
  if (enroll != undefined) {
    console.log("you are here");
    let valueforpush = [];
    let flag = false;
    for (let i = 0; i < enroll.length; i++) {
      const paddedSerial = enroll[i].padStart(2, "0");
      valueforpush.push(`${uniqueId}_${paddedSerial}`);

      const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);

      if (checkfileexists) {
        flag = true;
        // break;
        // const jsonString = fs.readFileSync(`./${valueforpush[i]}.json`);
        // // console.log(JSON.parse(jsonString));
        // template0.push(JSON.parse(jsonString));
      }
    }
    if (flag == true) {
      const userDetilsbyId = await axios({
        method: "GET",
        url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
      });
      console.log(userDetilsbyId);
      if (userDetilsbyId.status === StatusCodes.OK) {
        let userData = userDetilsbyId.data;
        console.log(userData, "userData");
        fingerprint_templatesdb = userData.User.fingerprint_templates;
      }

      console.log();
      let tempfingerprintdata = await putUserFingerperintsbyId(
        uniqueId,
        userId,
        enroll,
        fingerprint_templatesdb
      );
      console.log(tempfingerprintdata, "tempfingerprintdata");
    } else {
      res.send({
        message: "please scan Fingerprint, before enrolling!!",
      });
    }
    // console.log(tempfacedata);
    // facedata = tempfacedata.credentials.visualFaces[0].template_ex_normalized_image
    // console.log( typeof scanmessage.credentials.visualFaces[0].template_ex_normalized_image,"==--==--==--==--==--==--");
  } else {
    console.log("Data not found for face enrollment");
  }
}
