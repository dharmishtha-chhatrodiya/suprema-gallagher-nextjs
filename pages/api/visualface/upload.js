const axios = require("axios");
const httpsAgent = require("../../../httpsagents");
const fs = require("fs");
import NextCors from "nextjs-cors";
import { getBsSessionId } from "../../../helpers/bsSession";

export default async function upload(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const sessionId = await getBsSessionId();

  const UploadImage = async (imagepath) => {
    try {
      const responsePutUser = await axios({
        method: "PUT",
        url: `${process.env.SUPREMA_BASE_URL}/users/check/upload_picture`,
        headers: {
          "bs-session-id": `${sessionId}`,
        },
        httpsAgent,
        data: { template_ex_picture: imagepath },
      });
      return { successMessageFromUploadImg: responsePutUser.data.image };
    } catch (error) {
      console.log(error.response.data);
      if (error.response.data.Response.code == "30000") {
        return {
          errorMessageFromUploadImg:
            "The image resoultion is too low.please use an image with higher resoultion.(30000)",
        };
      } else if (error.response.data.Response.code == "30012") {
        return {
          errorMessageFromUploadImg:
            "The eyes are not focused towards the center. Please use an image with the face looking straight.(30012)",
        };
      } else if (error.response.data.Response.code == "30010") {
        return {
          errorMessageFromUploadImg:
            "The size of the face is too small to extract. Please use an image that shows the face closer.(30010)",
        };
      } else if (error.response.data.Response.code == "30008") {
        return {
          errorMessageFromUploadImg:
            "Failed to detact face from image.Please try with another image.(30008)",
        };
      } else if ((error.response.data.Response.code = "30011")) {
        return {
          errorMessageFromUploadImg:
            "The face is not posed straight.Please use an image having the face straight and still.(30011)",
        };
      }
    }
  };
  const { imagepath } = req.body;
  const UploadImages = await UploadImage(imagepath);
  let responsefromuploadimage = {
    errorMessageFromUploadImgs: UploadImages.errorMessageFromUploadImg,
    successMessageFromUploadImgs: UploadImages.successMessageFromUploadImg,
  };

  if (UploadImages.successMessageFromUploadImg != undefined) {
    let valueforpush = [];
    const { uniqueId } = req.body;
    const paddedSerial = req.body.uploadforface.padStart(2, "0");

    valueforpush.push(`${uniqueId}_${paddedSerial}`);

    console.log(valueforpush, "valueforpushforuploadimage");

    fs.writeFileSync(
      `./${uniqueId}_${paddedSerial}.json`,
      JSON.stringify({
        credentials: {
          visualFaces: [
            { template_ex_picture: UploadImages.successMessageFromUploadImg },
          ],
        },
      })
    );
    res.send({
      success: responsefromuploadimage.successMessageFromUploadImgs,
      uploadsuccess: true,
    });
  } else if (UploadImages.errorMessageFromUploadImg != undefined) {
    if (req.body.uploadforface == "1") {
      res.send({
        error1: responsefromuploadimage.errorMessageFromUploadImgs,
      });
    } else {
      res.send({
        error2: responsefromuploadimage.errorMessageFromUploadImgs,
      });
    }
  }
}
