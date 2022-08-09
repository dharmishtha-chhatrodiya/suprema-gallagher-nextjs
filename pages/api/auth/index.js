const Axios = require("../../../helpers/axiosHelper");
const { StatusCodes } = require("http-status-codes");
const loginUserRecord = require("../../../model/loginUserRecord.model");
const { getBsSessionId } = require("../../../helpers/bsSession");

const supremaAPIEndpointTest = async () => {
  try {
    const sessionId = await getBsSessionId();
    const headers = { "bs-session-id": `${sessionId}` };
    await Axios.supremaEndpoint("GET", "users", undefined, headers);
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      throw {
        status: 200,
        success: true,
        message: "suprema server is not working",
      };
    } else if (error.response.status === StatusCodes.UNAUTHORIZED) {
      throw {
        status: StatusCodes.UNAUTHORIZED,
        success: true,
        message: "Suprema Login required!",
      };
    } else {
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Suprema api is working",
      };
    }
  }
};

const gallgherAPIEndpointTest = async () => {
  try {
    const headers = { Authorization: process.env.GALLAGHER_API_KEY };
    return await Axios.gallagherEndpoint("GET", "", undefined, headers);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw {
        status: StatusCodes.OK,
        success: true,
        message: "Gallagher server is not working",
      };
    } else if (error.response.status === StatusCodes.UNAUTHORIZED) {
      throw {
        status: StatusCodes.UNAUTHORIZED,
        host: error.request.host,
        success: false,
        message: "Unauthorized From Gallagher",
      };
    } else {
      return {
        status: StatusCodes.OK,
        success: true,
        message: "Gallagher api is working",
      };
    }
  }
};
const checkapi = async () => {
  try {
    await supremaAPIEndpointTest();
    await gallgherAPIEndpointTest();

    return {
      status: StatusCodes.OK,
      success: true,
      Message: "Both apis are working",
    };
  } catch (error) {
    return {
      status: error.status,
      success: error.success,
      message: error.message,
      host: error.host,
    };
  }
};

const autoLogin = async () => {
  try {
    const result = await loginUserRecord.findOne({
      attributes: ["login_id", "password"],
    });

    if (result == null) {
      return { autologin: "null" };
    }
    const data = {
      User: {
        login_id: result.dataValues.login_id,
        password: result.dataValues.password,
      },
    };
    const supremaLoginResponse = await Axios.supremaLogin(data);
    if (supremaLoginResponse.status === 200) {
      const loginUsersRecord = await loginUserRecord.findAll();
      if (!loginUsersRecord.some((e1) => e1.login_id)) {
        await loginUserRecord.create({
          login_id: data.User.login_id,
          password: data.User.password,
          bs_session_id: supremaLoginResponse.headers["bs-session-id"],
        });
        return { autologin: "success" };
      } else {
        await loginUserRecord.update(
          {
            bs_session_id: supremaLoginResponse.headers["bs-session-id"],
          },
          { where: { login_id: data.User.login_id } }
        );
        return { autologin: "success" };
      }
    } else {
      return {
        message: "Somthing went wrong",
      };
    }
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.log("DO MANUAL LOGIN");
    }
    // -- Logging("errorss", error.message);
    // return res.json({
    //   message: error.message,
    // });
  }
};

module.exports = {
  checkapi,
  autoLogin,
};
