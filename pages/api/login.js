import NextCors from "nextjs-cors";
const axios = require("axios");
const httpsAgent = require("../../httpsagents");
const { StatusCodes } = require("http-status-codes");
const loginUserRecord = require("../../model/loginUserRecord.model");
const { autoLogin } = require("../api/auth/index");
export default async function login(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  console.log(req.method);
  if (req.method == "GET") {
    let responseofauotloign = await autoLogin();
    console.log(responseofauotloign, "responseofauotloign");
    return res.send({ responseofauotloign });
  } else {
    try {
      const { login_id, password } = req.body.User;

      const data = {
        User: {
          login_id: login_id,
          password: password,
        },
      };
      console.log(data);

      const supremaLoginResponse = await axios({
        method: "POST",
        url: `${process.env.SUPREMA_BASE_URL}/login`,
        httpsAgent,
        data: data,
      });

      if (supremaLoginResponse.status === 200) {
        const loginUsersRecord = await loginUserRecord.findAll();
        if (!loginUsersRecord.some((e1) => e1.login_id)) {
          console.log("123321");
          await loginUserRecord.create({
            login_id: data.User.login_id,
            password: data.User.password,
            bs_session_id: supremaLoginResponse.headers["bs-session-id"],
          });
          res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "authorized",
            "bs-session-id": supremaLoginResponse.headers["bs-session-id"],
          });
        } else {
          await loginUserRecord.update(
            {
              bs_session_id: supremaLoginResponse.headers["bs-session-id"],
            },
            { where: { login_id: data.User.login_id } }
          );
          return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "authorized",
            "bs-session-id": supremaLoginResponse.headers["bs-session-id"],
          });
        }
      }
    } catch (error) {
      console.log(error.message, error.response.status, "Error");
      if (error.response.status === StatusCodes.BAD_REQUEST) {
        const information = {
          status: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Incorrect username or password",
        };
        res.send(information);
      }
    }
  }
}
