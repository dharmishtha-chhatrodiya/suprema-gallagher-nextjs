const axios = require("axios");
const httpsAgent = require("../../../httpsagents");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../../helpers/bsSession";

export default async function save(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const sessionId = await getBsSessionId();
  const putUserVisualFacebyId = async (
    uniqueId,
    visualfacesSerial,
    userId,
    visualface_templatesdb
  ) => {
    try {
      let template0 = [];
      let valueforpush = [];

      console.log(visualface_templatesdb.length);
      if (visualface_templatesdb.length != 0) {
        if (visualface_templatesdb.length == 1) {
          console.log("==1 length console print");
          template0.push(visualface_templatesdb[0]);
          for (let i = 0; i < visualfacesSerial.length; i++) {
            const paddedSerial = visualfacesSerial[i].padStart(2, "0");
            valueforpush.push(`${uniqueId}_${paddedSerial}`);
            console.log(valueforpush[i], "valueforpush");
            const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);

            if (checkfileexists) {
              const jsonString = fs.readFileSync(`./${valueforpush[i]}.json`);
              template0[i] = JSON.parse(jsonString).credentials.visualFaces[0];
            } else {
              console.log("No visualface found please Enroll visualface first");
            }
          }
        } else if (visualface_templatesdb.length > 1) {
          console.log("11111");
          console.log(visualface_templatesdb);
          for (let i = 0; i < visualfacesSerial.length; i++) {
            const paddedSerial = visualfacesSerial[i].padStart(2, "0");
            valueforpush.push(`${uniqueId}_${paddedSerial}`);
          }
          for (let i = 0; i < valueforpush.length; i++) {
            const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
            if (checkfileexists) {
              const jsonString = fs.readFileSync(`./${valueforpush[i]}.json`);
              const file = i;
              console.log(file, "this file is available,");
              template0[i] = JSON.parse(jsonString).credentials.visualFaces[0];
            } else {
              template0[i] = visualface_templatesdb[i];
            }
          }
        }
      } else {
        console.log("no data from database");
        for (let i = 0; i < visualfacesSerial.length; i++) {
          const paddedSerial = visualfacesSerial[i].padStart(2, "0");
          valueforpush.push(`${uniqueId}_${paddedSerial}`);
          console.log(valueforpush[i], "valueforpush");
          const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
          if (checkfileexists) {
            const jsonString = fs.readFileSync(`./${valueforpush[i]}.json`);
            template0.push(JSON.parse(jsonString).credentials.visualFaces[0]);
          } else {
            console.log("No visualface found please Enroll visualface first");
          }
        }
      }

      console.log(template0, "\\\\\\\\\\1111111111");
      const responsePutUser = await axios({
        method: "PUT",
        url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
        data: { User: { credentials: { visualFaces: template0 } } },
      });
      if (responsePutUser.status === StatusCodes.OK) {
        for (let i = 0; i < visualfacesSerial.length; i++) {
          const paddedSerial = visualfacesSerial[i].padStart(2, "0");
          valueforpush.push(`${uniqueId}_${paddedSerial}`);
          const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
          if (checkfileexists) {
            fs.unlinkSync(`${valueforpush[i]}.json`);

            res.send({
              message: "data added successfully",
            });
          } else {
            console.log("No File founds after add fingerprints");
          }
        }
      }
    } catch (error) {
      console.log(error, "Error form userPut API");
    }
  };
  try {
    const { uniqueId, enroll, authType, userId } = req.body.visualFaceSave;
    if (uniqueId != undefined && enroll != undefined && authType == "face") {
      let tempfacedata;
      const userDetilsbyId = await axios({
        method: "GET",
        url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
      });
      let userData;
      if (userDetilsbyId.status === StatusCodes.OK) {
        userData = userDetilsbyId.data;
        if (userData.User?.credentials?.visualFaces?.length == undefined) {
          userData.User["credentials"] = { visualFaces: [] };
        }
      }
      let visualface_templatesdb;

      let valueforpush = [];
      let flag = false;

      for (let i = 0; i < enroll.length; i++) {
        const paddedSerial = enroll[i].padStart(2, "0");
        valueforpush.push(`${uniqueId}_${paddedSerial}`);

        const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);

        if (checkfileexists) {
          flag = true;
        }
      }
      if (flag == true) {
        visualface_templatesdb = userData.User.credentials.visualFaces;
        tempfacedata = await putUserVisualFacebyId(
          uniqueId,
          enroll,
          userId,
          visualface_templatesdb
        );
      } else {
        faceFileNotFoundMsg = "please scan face, before enrolling!!";
      }
    } else {
      console.log("Data not found for face enrollment");
    }
  } catch (error) {
    console.log(error);
  }
}
