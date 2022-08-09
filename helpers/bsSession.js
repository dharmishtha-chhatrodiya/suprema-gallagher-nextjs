const loginUserRecord = require("../model/loginUserRecord.model");

exports.getBsSessionId = async () => {
  const result = await loginUserRecord.findOne({
    attributes: ["bs_session_id"],
  });

  return result.dataValues.bs_session_id;
};
