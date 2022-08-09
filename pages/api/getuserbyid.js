const axios = require("axios");
const httpsAgent = require("../../httpsagents");
const { StatusCodes } = require("http-status-codes");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../helpers/bsSession";

export default async function getuserbyid(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  try {
    const sessionId = await getBsSessionId();
    const { userId } = req.body;
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
    }
    return res.send({ userData });
  } catch (error) {
    console.log(error);
  }
}
