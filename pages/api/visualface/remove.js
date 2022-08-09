const axios = require("axios");
const httpsAgent = require("../../../httpsagents");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../../helpers/bsSession";

export default async function remove(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const sessionId = await getBsSessionId();
  const { uniqueId, authType, remove, userId } = req.body.removeVisualFace;
  if (uniqueId != undefined && authType == "face" && remove != undefined) {
    if (uniqueId == "") {
      res.send({ message: "Device is not selected" });
    } else {
      if (remove == "1") {
        console.log("This method is called 222222", uniqueId, authType, remove);

        let valueforpush = [];
        const paddedSerial = remove.padStart(2, "0");
        valueforpush.push(`${uniqueId}_${paddedSerial}`);
        const checkfileexists = fs.existsSync(`./${valueforpush}.json`);
        if (checkfileexists) {
          console.log("here for deleteing file");
          fs.unlinkSync(`${valueforpush}.json`);
          res.send({
            message: "Data removed",
          });
        } else {
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
          let visualface_templatesdb = userData.User.credentials.visualFaces;
          try {
            console.log(visualface_templatesdb.length, remove);

            console.log(userData.User.credentials.visualFaces, "before splice");
            userData.User.credentials.visualFaces.splice(0, 1);

            const responsePutUser = await axios({
              method: "PUT",
              url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
              headers: {
                "bs-session-id": `${sessionId}`,
              },
              httpsAgent,
              data: {
                User: {
                  credentials: {
                    visualFaces: userData.User.credentials.visualFaces,
                  },
                },
              },
            });

            console.log(responsePutUser, "123321");

            if (responsePutUser.status === StatusCodes.OK) {
              res.send({
                message: "Data removed",
              });
            }
          } catch (error) {
            console.log(error, "Error form userPut API");
          }
        }
      } else if (remove == "2") {
        // console.log("This method is called 222222", uniqueId, authType, remove);
        let valueforpush = [];
        const paddedSerial = remove.padStart(2, "0");
        valueforpush.push(`${uniqueId}_${paddedSerial}`);
        const checkfileexists = fs.existsSync(`./${valueforpush}.json`);
        if (checkfileexists) {
          console.log("here for deleteing file");
          fs.unlinkSync(`${valueforpush}.json`);
          res.send({
            message: "Data removed",
          });
        } else {
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
          let visualface_templatesdb = userData.User.credentials.visualFaces;

          visualface_templatesdb = userData.User.credentials.visualFaces;
          try {
            console.log(visualface_templatesdb.length, remove);

            console.log(userData.User.credentials.visualFaces, "before splice");
            userData.User.credentials.visualFaces.splice(1, 1);

            const responsePutUser = await axios({
              method: "PUT",
              url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
              headers: {
                "bs-session-id": `${sessionId}`,
              },
              httpsAgent,
              data: {
                User: {
                  credentials: {
                    visualFaces: userData.User.credentials.visualFaces,
                  },
                },
              },
            });

            console.log(responsePutUser, "123321");

            if (responsePutUser.status === StatusCodes.OK) {
              res.send({
                message: "Data removed",
              });
            }
          } catch (error) {
            console.log(error, "Error form userPut API");
          }
        }
      }
    }
  }
}
