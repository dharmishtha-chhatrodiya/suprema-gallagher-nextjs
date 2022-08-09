import NextCors from "nextjs-cors";
const fs = require("fs");

export default async function getlocaldata(req, res) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  const { uniqueId, fingerserial } = req.body.localData;

  if (
    fingerserial != undefined &&
    req.body.scan == undefined &&
    req.body.enroll == undefined &&
    req.body.cancel == undefined &&
    req.body.reset == undefined
  ) {
    let FingerprintTemplatedata;
    let valueforpushforfingerreturn = [];
    const paddedSerial = fingerserial.padStart(2, "0");
    valueforpushforfingerreturn.push(`${uniqueId}_${paddedSerial}`);
    for (let i = 0; i < valueforpushforfingerreturn.length; i++) {
      const checkfileexists = fs.existsSync(
        `./${valueforpushforfingerreturn[i]}.json`
      );
      if (checkfileexists) {
        const templateJsonforread = fs.readFileSync(
          `./${uniqueId}_${paddedSerial}.json`
        );
        FingerprintTemplatedata = {
          template_image0:
            JSON.parse(templateJsonforread).fingerPrintsObj.template_image0,
          template_image1:
            JSON.parse(templateJsonforread).fingerPrintsObj.template_image1,
        };
        res.send({ FingerprintTemplatedata });
      } else {
        console.log("NO FILE FOUND");
        res.send({ message: [] });
      }
    }
  } else {
    console.log("Not clicked for file check");
  }
}
