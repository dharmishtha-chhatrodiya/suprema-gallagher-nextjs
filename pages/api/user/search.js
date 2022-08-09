const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const httpsAgent = require("../../../httpsagents");
import NextCors from "nextjs-cors";
const { getBsSessionId } = require("../../../helpers/bsSession");
export default async function usersearch(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const sessionId = await getBsSessionId();
  // https://192.168.1.18/api/v2/users/search
  const { exactsearch, searchby, search } = req.body.usersearch;
  console.log(exactsearch, searchby, "akshay-seearcbskdvb");
  if (searchby === "") {
    res.send({
      message: "please select search by",
    });
  }
  if (searchby == "name") {
    try {
      const userName = search;
      let devicescheck = "";
      if (!userName) {
        const information = {
          status: 400,
          success: false,
          message: "No user name provided.",
          data: null,
        };
        res.send({ message: "No user name provided.", devicescheck });
      }
      await axios({
        method: "GET",
        url: `${process.env.GALLAGHER_BASE_URL}/cardholders?name=${userName}`,
        headers: {
          Authorization: process.env.GALLAGHER_API_KEY,
        },
        httpsAgent,
      })
        .then(async (response) => {
          // Get suprema data for user
          const data = response.data.results;

          await Promise.all(
            data.map(async (user, idx) => {
              // console.log(user, "user");
              await axios({
                method: "GET",
                url: `${process.env.SUPREMA_BASE_URL}/users/${user.id}`,
                headers: {
                  "bs-session-id": `${sessionId}`,
                },
                httpsAgent,
              })
                .then(async (res) => {
                  if (
                    res.data.User?.credentials?.visualFaces?.length == undefined
                  ) {
                    // let fingerprintdevicescheck = await devices("fingerprint");
                    // let facedevicescheck = await devices("face");
                    // if (
                    //   facedevicescheck.length == 0 &&
                    //   fingerprintdevicescheck.length == 0
                    // ) {
                    //   devicescheck = "Devices are disconnected";
                    // }

                    let temptimevar = new Date(res.data.User.expiry_datetime);
                    let timestemp = temptimevar.getTime();
                    let finaltimestamp = new Date(timestemp).toUTCString();

                    // console.log(
                    //   moment(finaltimestamp).format("YYYY-MM-DD HH:mm")
                    // );
                    // console.log(new Date(timestemp).getFullYear(), "Timestamp");
                    data[idx].visualFaces = 0;
                    data[idx].fingerprintCount =
                      res.data.User.fingerprint_template_count;
                    data[idx].faceCount = res.data.User.face_count;
                    data[idx].pin_exists = res.data.User.pin_exists;
                    data[idx].expiry_datetime = finaltimestamp;
                  } else {
                    // console.log(res.data.User, "123321");
                    let temptimevar = new Date(res.data.User.expiry_datetime);
                    let timestemp = temptimevar.getTime();
                    let finaltimestamp = new Date(timestemp).toUTCString();
                    data[idx].visualFaces =
                      res.data.User.credentials.visualFaces.length;
                    data[idx].fingerprintCount =
                      res.data.User.fingerprint_template_count;
                    data[idx].faceCount = res.data.User.face_count;
                    data[idx].pin_exists = res.data.User.pin_exists;
                    data[idx].expiry_datetime = finaltimestamp;
                  }
                })
                .catch((error) => {
                  console.log(error, " Failure");
                  // if (error.response.status === 401) {
                  //   res.status(401).json({
                  //     statusCode: 401,
                  //     success: false,
                  //     message: "Login required!",
                  //     data: null,
                  //   });
                  // }
                  // res.status(404).json({
                  //   statusCode: 404,
                  //   success: false,
                  //   message: "Data not found!",
                  //   data: null,
                  // });
                });
            })
          );
          const resultObj = {
            statusCode: 200,
            success: true,
            message: "Successfully fetched!",
            data,
          };

          const users = resultObj.data

            .filter((element) => {
              if (search == null) {
                return element;
              } else if (
                exactsearch == false &&
                element?.firstName
                  ?.toLowerCase?.()
                  .includes?.(search?.toLowerCase?.())
              ) {
                console.log(element, "element`");
                return element;
              } else {
                if (
                  element?.firstName?.toLowerCase?.() == search?.toLowerCase?.()
                )
                  return element;
              }
            })
            .map((values) => values);

          res.send({ list: users, devicescheck });
        })
        .catch((error) => {
          console.log(error);
          // return res.status(400).json({
          //   status: 400,
          //   success: false,
          //   message: "Bad request!",
          //   data: null
          // });
        });
    } catch (error) {
      console.log(error, "Error ----->>>>>");
    }
  } else {
    try {
      let devicescheck = "";
      let userId = search;
      if (!userId) {
        const information = {
          status: 400,
          success: false,
          message: "No user id provided.",
          data: null,
        };
        res.send({ message: "No user id provided.", devicescheck });
      }
      userId = search;
      //  console.log(userId,typeof userId);

      if (parseInt(userId) == NaN) {
        const information = {
          status: 400,
          success: false,
          message: "please enter ID in numbers.",
          data: null,
        };

        return res.send({
          message: "please enter ID in numbers.",
          devicescheck,
        });
      }

      const responseofgetuserbyid = await axios({
        method: "GET",
        url: `${process.env.SUPREMA_BASE_URL}/users/${userId}`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
      });
      if (responseofgetuserbyid.status == 200) {
        let users = [];
        let visualfacecount;
        if (
          responseofgetuserbyid.data.User?.credentials?.visualFaces?.length ==
          undefined
        ) {
          visualfacecount = 0;
        } else {
          // console.log(res.data.User, "123321");
          visualfacecount =
            responseofgetuserbyid.data.User.credentials.visualFaces.length;
        }
        let temptimevar = new Date(
          responseofgetuserbyid.data.User.expiry_datetime
        );
        let timestemp = temptimevar.getTime();
        let finaltimestamp = new Date(timestemp).toUTCString();
        let obj = {
          id: responseofgetuserbyid.data.User.user_id,
          firstName: responseofgetuserbyid.data.User.name,
          fingerprintCount:
            responseofgetuserbyid.data.User.fingerprint_template_count,
          faceCount: responseofgetuserbyid.data.User.face_count,
          visualFaces: visualfacecount,
          pin_exists: responseofgetuserbyid.data.User.pin_exists,
          expiry_datetime: finaltimestamp,
        };
        users.push(obj);
        console.log(users);
        res.send({ list: users, devicescheck });
      }
    } catch (error) {
      console.log(error);
      let devicescheck = "";
      if (
        error.response.data.Response.code == "201" ||
        error.response.status == 400
      ) {
        const information = {
          status: 400,
          success: false,
          message: "User can not be found with id",
          data: null,
        };
        res.send({ message: "User can not be found with id", devicescheck });
      }
      if (error.response.status == 400) {
        const information = {
          status: 400,
          success: false,
          message: "please enter ID in numbers.",
          data: null,
        };
        res.send({ message: "please enter ID in numbers.", devicescheck });
      }
    }
  }
}
