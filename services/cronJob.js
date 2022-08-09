const { CronJob } = require("cron");
const axios = require("axios");
// const Axios = require("../helpers/axiosHelper");
const { StatusCodes } = require("http-status-codes");
const GlobalUserRecord = require("../model/globalUserRecord.model");
const httpsAgent = require("../httpsagents");
const { deleteUserbyID } = require("../pages/api/user/delete");
const { autoLogin, checkapi } = require("../pages/api/auth/index");
// const { logg } = require("../constants");
// const { Logging } = require("../utils/logger.utils");
const { getBsSessionId } = require("../helpers/bsSession");

const addUserToSuprema = async (gallagherUsers) => {
  try {
    const sessionId = await getBsSessionId();
    const statusfromchcekapi = await checkapi();
    // console.log(statusfromchcekapi);
    if (statusfromchcekapi.status === StatusCodes.UNAUTHORIZED) {
      await autoLogin();
    } else if (
      statusfromchcekapi.host === "127.0.0.1" &&
      statusfromchcekapi.status === StatusCodes.UNAUTHORIZED
    ) {
      console.log("error from gallagher login");
      // Logging("error", statusfromchcekapi.message);
    } else {
      console.log("You Dont need to login");
    }
    const globalUsersRecord = await GlobalUserRecord.findAll();
    // CRON JOB ADDED USER
    for (let i = 0; i < gallagherUsers.length; i++) {
      if (
        !globalUsersRecord.some(
          (el) => el.dataValues.userId == gallagherUsers[i].id
        )
      ) {
        console.log("11111");
        const data = {
          User: {
            name: `${gallagherUsers[i].firstName}`,
            user_id: gallagherUsers[i].id,
            //  email: gallagherUsers[i].email,
            user_group_id: {
              id: 1,
              name: "All Users",
            },
            disabled: "false",
            start_datetime: "2001-01-01T00:00:00.00Z",
            expiry_datetime: "2030-12-31T23:59:00.00Z",
          },
        };
        console.log("data before insert", data);
        // const headers = { "Content-Type": "application/json", "bs-session-id": `d0c1754310e9408f8fbda9a73605ea6a` };
        // await Axios.supremaEndpoint("POST", "users", data, headers);
        await axios({
          method: "POST",
          url: `${process.env.SUPREMA_BASE_URL}/users`,
          headers: {
            "bs-session-id": `${sessionId}`,
            "Content-Type": "application/json",
          },
          httpsAgent,
          data,
        })
          .then(async (res) => {
            console.log(res.data.UserCollection, " Success");
            console.log(gallagherUsers[i].id);
            const newRecord = await GlobalUserRecord.create({
              userId: gallagherUsers[i].id,
            });
          })
          .catch((error) => {
            console.log(error.message, " Failuressssss");
          });
      } else {
        // let gallagheruserresponse = gallagherUsers[i].href;
        // let responseuser = await axios({
        //   method: "get",
        //   url: `${gallagheruserresponse}`,
        //   headers: {
        //     Authorization: process.env.GALLAGHER_API_KEY,
        //   },
        //   httpsAgent,
        // });
        // console.log(responseuser.data["@email"], "testttttttttt");
        // // console.log(responseuser.data,"123321");
        //  if(responseuser.data['@email'] != undefined  ||  responseuser.data['@Department'] != undefined || responseuser.data['@expiry_datetime'] != undefined || responseuser.data['@start_datetime'] != undefined  || responseuser.data['@Title'] != undefined  ){
        //   console.log(responseuser.data,"123321");

        //     const data = {
        //     User: {
        //       department:responseuser.data['@Department'],
        //       expiry_datetime: responseuser.data['@expiry_datetime'] ,
        //       start_datetime:responseuser.data['@start_datetime'],
        //       user_title:responseuser.data['@Title']
        //     }
        //   };

        //   console.log(data);
        //   const responsePutUser = await axios({
        //     method: "PUT",
        //     url: `${process.env.SUPREMA_BASE_URL}/users/${gallagherUsers[i].id}`,
        //     headers: {
        //       "bs-session-id": `${sessionId}`
        //     },
        //     httpsAgent,
        //     data: data
        //   });
        //   console.log(responseuser);
        //  }
        //  else{
        //   console.log("email nahi hai");
        //  }
        console.log(
          "User register => ",
          gallagherUsers[i].id,
          " == ",
          gallagherUsers[i].firstName
        );
      }
    }

    // CRONJOB ADDED USER

    // CRONJOB DELETING USER
    // FOR-GETTING-PARTICULAR_ID#GALAGHERUSER
    const getIdGallagherUSer = gallagherUsers.map((a) => Number(a.id));

    // FOR-GETTING-PARTICULAR_ID#LOCALDATA
    const getidGlobalUserRecord = globalUsersRecord.map((a) => a.userId);
    if (
      JSON.stringify(getIdGallagherUSer.sort()) ===
      JSON.stringify(getidGlobalUserRecord.sort())
    ) {
      console.log("No Deleted User Found");
    } else {
      const absent = getidGlobalUserRecord
        .sort()
        .filter((e) => !getIdGallagherUSer.includes(e));

      for (let i = 0; i < absent.length; i++) {
        deleteUserbyID(absent[i]);
      }
    }
    //CRONJOB DELETING USER
  } catch (error) {
    console.log(error.message);
    // Logging(logg.error, error.message);
  }
};

const job = new CronJob(
  "*/20 * * * * *",
  () => {
    axios({
      method: "get",
      url: `${process.env.GALLAGHER_BASE_URL}/cardholders`,
      headers: {
        Authorization: process.env.GALLAGHER_API_KEY,
      },
      httpsAgent,
    })
      .then(async (res) => {
        console.log(
          "================================================================\n"
        );
        await addUserToSuprema(res.data.results);
        console.log(
          "================================================================\n"
        );
      })
      .catch((error) => {
        console.log(error, " Failure");
      });
  },
  null,
  true,
  "America/Los_Angeles"
);

const runCronJob = () => {
  job.start();
};

module.exports = runCronJob;
