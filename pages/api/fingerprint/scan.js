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

  try {
    const verifyFingerprints = async (template0, template1, deviceid) => {
      const sessionId = await getBsSessionId();
      const data = {
        FingerprintTemplate: {
          template0,
          template1,
        },
        VerifyFingerprintOption: {
          security_level: "0",
        },
      };

      return await axios({
        method: "POST",
        url: `${process.env.SUPREMA_BASE_URL}/devices/${deviceid}/verify_fingerprint`,
        headers: {
          "bs-session-id": `${sessionId}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
        data,
      });
    };

    const { uniqueId, deviceid, fingerprintSerial, enroll_quality, raw_image } =
      req.body.fingerprintScan;

    if (deviceid == "" || deviceid == "none") {
      res.send({ message: "Device is not selected" });
    } else {
      let deviceid = parseInt(req.body.fingerprintScan.deviceid);
      const sessionId = await getBsSessionId();

      let responseofrawimage;
      const paddedSerial = fingerprintSerial.padStart(2, "0");

      const data = {
        ScanFingerprintOption: {
          enroll_quality: enroll_quality,
          raw_image: raw_image.toString(),
        },
      };
      const responseFromScanFingerperint = await axios({
        method: "POST",
        url: `${process.env.SUPREMA_BASE_URL}/devices/${deviceid}/scan_fingerprint`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
        data: data,
      });
      // console.log( responseFromScanFingerperint.data.FingerprintTemplate.enroll_quality);
      if (
        responseFromScanFingerperint?.data?.FingerprintTemplate
          ?.enroll_quality != undefined
      ) {
        if (responseFromScanFingerperint.data.DeviceResponse.result == "true") {
          if (!(+fingerprintSerial <= 10)) {
            throw {
              message: "No more than 10 fingers allowed for scan",
              code: StatusCodes.BAD_REQUEST,
            };
          } else {
            const templateJson = fs.existsSync(
              `./${uniqueId}_${paddedSerial}.json`
            );
            if (templateJson === false) {
              if (raw_image.toString() == "true") {
                fs.writeFileSync(
                  `./${uniqueId}_${paddedSerial}.json`,
                  JSON.stringify({
                    template0:
                      responseFromScanFingerperint.data.FingerprintTemplate
                        .template0,
                    template_image0:
                      responseFromScanFingerperint.data.FingerprintTemplate
                        .template_image0,
                    raw_image0:
                      responseFromScanFingerperint.data.FingerprintTemplate
                        .raw_image0,
                  })
                );
              } else {
                fs.writeFileSync(
                  `./${uniqueId}_${paddedSerial}.json`,
                  JSON.stringify({
                    template0:
                      responseFromScanFingerperint.data.FingerprintTemplate
                        .template0,
                    template_image0:
                      responseFromScanFingerperint.data.FingerprintTemplate
                        .template_image0,
                  })
                );
              }
              return res.send({ firstscan: "success" });
            } else {
              const templateJson = fs.readFileSync(
                `./${uniqueId}_${paddedSerial}.json`
              );
              if (typeof templateJson === "object") {
                const template0 = JSON.parse(templateJson).template0;
                const template1 =
                  responseFromScanFingerperint.data.FingerprintTemplate
                    .template0;
                const template_image0 =
                  JSON.parse(templateJson).template_image0;
                const template_image1 =
                  responseFromScanFingerperint.data.FingerprintTemplate
                    .template_image0;
                const resultofVErifyapi = await verifyFingerprints(
                  template0,
                  template1,
                  deviceid
                );
                if (resultofVErifyapi.status == 200) {
                  const filesize = fs.writeFileSync(
                    `./${uniqueId}_${paddedSerial}.json`,
                    JSON.stringify({
                      fingerPrintsObj: {
                        template0: JSON.parse(templateJson).template0,
                        template_image0:
                          JSON.parse(templateJson).template_image0,
                        template1:
                          responseFromScanFingerperint.data.FingerprintTemplate
                            .template0,
                        template_image1:
                          responseFromScanFingerperint.data.FingerprintTemplate
                            .template_image0,
                      },
                    })
                  );
                  if (raw_image.toString() == "true") {
                    let raw_image1 = JSON.parse(templateJson).raw_image0;
                    let raw_image2 =
                      responseFromScanFingerperint.data.FingerprintTemplate
                        .raw_image0;
                    // console.log(responseFromScanFingerperint.data.FingerprintTemplate.raw_image0,);
                    responseofrawimage = {
                      Raw_image: {
                        raw_image1: raw_image1,
                        raw_image2: raw_image2,
                      },
                    };
                  } else {
                    responseofrawimage = { Raw_image: "false from raw image" };
                  }
                  return res.send({
                    template_image0,
                    template_image1,
                    responseofrawimage,
                  });
                  // const templateJsonsize = fs.readFileSync(`./${deviceid}_${paddedSerial}.json`);
                  // if (typeof templateJsonsize === "object"){
                  //   let imgInfo = fs.statSync(`./${deviceid}_${paddedSerial}.json`)
                  //   let fileSize = imgInfo.size
                  //   let fileSizeMB = imgInfo.size / (1024 * 1024)
                  //   console.log('File size in kb:' + fileSize)
                  //   console.log('File size in mb:' + fileSizeMB)
                  // }
                }
                // .then((output) => {
                //   const responseAfterVerifyApi = output.data.DeviceResponse.result;
                //   console.log("-------------------------------");
                //   if (responseAfterVerifyApi == "true") {
                //     //fs.unlinkSync(`./${deviceid}{}.json`);
                //     fs.writeFileSync(
                //       `./${deviceid}_${paddedSerial}.json`,
                //       JSON.stringify({
                //         template0: responseFromScanFingerperint.data.FingerprintTemplate.template0,
                //         template_image0: responseFromScanFingerperint.data.FingerprintTemplate.template_image0
                //       })
                //     );
                //     return res.send({
                //       Response: {
                //         code: "0",
                //         message: "Success"
                //       }
                //     });
                //   }
                // })
                // .catch((error) => {
                //   const responseAfterVerifyApi = error.response.data.DeviceResponse.result;
                //   if (responseAfterVerifyApi == "false") {
                //     //   fs.unlinkSync(`./${deviceid}.json`);
                //     return res.send({
                //       Response: {
                //         code: "1015",
                //         message: "Failed to verify fingerprint"
                //       }
                //     });
                //   }
                // });
              }
            }
          }
        }
      } else {
        let valueforpush = [];
        const paddedSerial = fingerprintSerial.padStart(2, "0");
        valueforpush.push(`${uniqueId}_${paddedSerial}`);
        console.log(valueforpush);
        for (let i = 0; i < valueforpush.length; i++) {
          const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
          if (checkfileexists) {
            fs.unlinkSync(`${valueforpush[i]}.json`);
          } else {
            console.log({
              message: "No File founds after add fingerprints",
            });
          }
        }
        res.send({ message: "Enrollment quality is Low" });
      }
    }
  } catch (error) {
    const { uniqueId, fingerprintSerial } = req.body.fingerprintScan;
    if (error.response.data.Response.code === "1003") {
      let valueforpush = [];
      const paddedSerial = fingerprintSerial.padStart(2, "0");
      valueforpush.push(`${uniqueId}_${paddedSerial}`);
      console.log(valueforpush);
      for (let i = 0; i < valueforpush.length; i++) {
        const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
        if (checkfileexists) {
          fs.unlinkSync(`${valueforpush[i]}.json`);
        } else {
          console.log({
            message: "No File founds after add fingerprints",
          });
        }
      }
      res.send({ message: "Device is not respond in timeout period" });
    } else if (
      error.response.data.DeviceResponse.result === "false" &&
      error.response.data.Response.code === "1015"
    ) {
      let valueforpush = [];
      const paddedSerial = fingerprintSerial.padStart(2, "0");
      valueforpush.push(`${uniqueId}_${paddedSerial}`);
      console.log(valueforpush);
      for (let i = 0; i < valueforpush.length; i++) {
        const checkfileexists = fs.existsSync(`./${valueforpush[i]}.json`);
        if (checkfileexists) {
          fs.unlinkSync(`${valueforpush[i]}.json`);
        } else {
          console.log({
            message: "No File founds after add fingerprints",
          });
        }
      }
      res.send({ message: "Failed to verify fingerprint" });
    }

    // if (error.isAxiosError === "true" && error.response.data.DeviceResponse.result === "false") {
    //   return next({
    //     message: "Failed to verify fingerprint",
    //     code: StatusCodes.BAD_REQUEST
    //   });
    // }
    // return next(error);
  }
}
