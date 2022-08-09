const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
// const { Logging } = require("../utils/logger.utils");
const httpsAgent = require("../../../httpsagents");
const absents = require("../../../services/cronJob");
const fs = require("fs");

const GlobalUserRecord = require("../../../model/globalUserRecord.model");
// const { logg } = require("../constants");
const { getBsSessionId } = require("../../../helpers/bsSession");
const deleteUserbyID = async (userId) => {
  try {
    const sessionId = await getBsSessionId();
    await axios({
      method: "DELETE",
      url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
      headers: {
        "bs-session-id": `${sessionId}`,
        "Content-Type": "application/json",
      },
      httpsAgent,
    })
      .then(async (res) => {
        const deleteuserfromtable = await GlobalUserRecord.destroy({
          where: { userId },
        });
        console.log("userId deleted is==>", `${userId}`);
        // return res.send({
        //   deleteuserfromtable,
        //   statusCode: StatusCodes.OK,
        //   success: true,
        //   message: "Successfully deleted!",
        //   userId,
        // });
      })
      .catch((error) => {
        if (error.response.status === StatusCodes.UNAUTHORIZED) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            statusCode: StatusCodes.UNAUTHORIZED,
            success: false,
            message: "Login required!",
            data: null,
          });
        }
        return res.status(StatusCodes.NOT_FOUND).json({
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: "Data not found!",
          data: null,
        });
      });
  } catch (error) {
    // Logging(logg.error, error.message);
    console.log(error.message);
  }
};
module.exports = {
  deleteUserbyID,
};
