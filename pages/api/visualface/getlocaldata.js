import NextCors from "nextjs-cors";
const fs = require("fs");

export default async function getlocaldata(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const { uniqueId, visualfacesSerialforlocal } = req.body.localData;
  if (
    visualfacesSerialforlocal != undefined &&
    req.body.scan == undefined &&
    req.body.enroll == undefined &&
    req.body.cancel == undefined &&
    req.body.searchArrow == undefined
  ) {
    let facedata1, facedata2, error;
    for (let i = 0; i < visualfacesSerialforlocal.length; i++) {
      const paddedSerial = visualfacesSerialforlocal[i].padStart(2, "0");
      console.log(paddedSerial);
      const templateJson = fs.existsSync(`./${uniqueId}_${paddedSerial}.json`);
      console.log(templateJson);
      if (templateJson == true) {
        const templateJsonforread = fs.readFileSync(
          `./${uniqueId}_${paddedSerial}.json`
        );
        console.log("111111");
        if (typeof templateJsonforread == "object") {
          // facedata= JSON.parse(templateJsonforread).credentials.visualFaces[0].template_ex_normalized_image;
          if (i == 0) {
            console.log("222222");
            if (
              JSON.parse(templateJsonforread).credentials.visualFaces[0]
                .template_ex_picture != undefined
            ) {
              facedata1 =
                JSON.parse(templateJsonforread).credentials.visualFaces[0]
                  .template_ex_picture;
            } else {
              facedata1 =
                JSON.parse(templateJsonforread).credentials.visualFaces[0]
                  .template_ex_normalized_image;
            }
          } else {
            console.log("33333");
            if (
              JSON.parse(templateJsonforread).credentials.visualFaces[0]
                .template_ex_picture != undefined
            ) {
              facedata2 =
                JSON.parse(templateJsonforread).credentials.visualFaces[0]
                  .template_ex_picture;
            } else {
              facedata2 =
                JSON.parse(templateJsonforread).credentials.visualFaces[0]
                  .template_ex_normalized_image;
            }
          }
        }
      } else {
        // continue;
        error = "";
      }
    }
    res.send({ facedata1: facedata1, facedata2: facedata2, error: error });
  }
}
