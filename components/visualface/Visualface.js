import styles from "./visualface.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

const Visualface = ({ setDeviceData, deviceId }) => {
  const [leftImg, setLeftImg] = useState("");
  const [rightImg, setRightImg] = useState("");
  const [leftImgDB, setLeftImgDB] = useState("");
  const [rightImgDB, setRightImgDB] = useState("");
  const [user, setUser] = useState({});
  const [dataReset, setDataReset] = useState(false);

  const router = useRouter();

  let uniqueId = 215;

  // handle search again
  const handleSearch = () => {
    router.push("/usersearch");
  };
  // covert image to base64 and upload data

  function encodeImageFileAsURL(element, no) {
    let file = element.target.files[0];
    let reader = new FileReader();
    let setname;

    reader.onloadend = function () {
      setname = reader.result;
      let data = setname.split(";base64,");
      if (no === "1") {
        let imagepath = data[1];
        let uploadforface = no;

        axios
          .post("http://192.168.1.247:3000/api/visualface/upload", {
            imagepath,
            uploadforface,
            uniqueId,
          })
          .then((res) => {
            if (res.data.uploadsuccess === true) {
              setLeftImg(res.data.success);
            }
            toast.error(res.data.message || res.data.error1);

            let localData = {
              visualfacesSerialforlocal: ["1", "2"],
              uniqueId: uniqueId,
            };

            axios
              .post("http://localhost:3000/api/visualface/getlocaldata", {
                localData,
              })
              .then((res) => {
                setLeftImg(res.data?.facedata1);
                setRightImg(res.data?.facedata2);
              });
          })
          .catch((err) => {
            console.log(err, "error of size");
          });
      } else if (no === "2") {
        let imagepath = data[1];
        let uploadforface = no;

        axios
          .post("http://192.168.1.247:3000/api/visualface/upload", {
            imagepath,
            uploadforface,
            uniqueId,
          })
          .then((res) => {
            if (res.data.uploadsuccess === true) {
              setRightImg(res.data.success);
            }

            toast.error(res.data.message || res.data.error2);

            let localData = {
              visualfacesSerialforlocal: ["1", "2"],
              uniqueId: uniqueId,
            };

            axios
              .post("http://localhost:3000/api/visualface/getlocaldata", {
                localData,
              })
              .then((res) => {
                setLeftImg(res.data?.facedata1);
                setRightImg(res.data?.facedata2);
              });
          })
          .catch((err) => {
            console.log(err, "error of size");
          });
      }
    };
    file ? reader.readAsDataURL(file) : null;
  }

  // for scan api

  const handleScan = (btnNum) => {
    let visualFaceBody = {
      visualfacesSerial: btnNum,
      deviceid: deviceId,
      pose_sensitivity: 0,
      nonBlock: true,
      uniqueId: uniqueId,
    };

    axios
      .post("http://localhost:3000/api/visualface/scan", { visualFaceBody })
      .then((res) => {
        if (res.data.message) {
          toast.error(res.data.message);
        } else {
          if (btnNum === "1") {
            setLeftImg(
              res.data.credentials.visualFaces[0].template_ex_normalized_image
            );
          } else if (btnNum === "2") {
            setRightImg(
              res.data.credentials.visualFaces[0].template_ex_normalized_image
            );
          }
        }
      });
  };

  // handle reset button

  const handleReset = () => {
    let visualFaceReset = {
      uniqueId: uniqueId,
      visualfacesSerial: ["1", "2"],
      userId: parseInt(user.user_id),
    };

    axios
      .post("http://192.168.1.247:3000/api/visualface/reset", {
        visualFaceReset,
      })
      .then((res) => {
        toast.success(res.data.message, {
          autoClose: 2000,
        });
        setDataReset(res.data.success);
        setLeftImg("");
        setLeftImgDB("");
        setRightImg("");
        setRightImgDB("");
      });

    // if (dataReset === true) {
    //   console.log("akshayjahweyvuwgbauvb");

    // }
  };

  // handle save visual face

  const handleSave = () => {
    let visualFaceSave = {
      uniqueId: uniqueId,
      enroll: ["1", "2"],
      authType: "face",
      userId: parseInt(user.user_id),
    };

    axios
      .post("http://192.168.1.247:3000/api/visualface/save", { visualFaceSave })
      .then((res) => {
        toast.success(res.data.message, {
          autoClose: 2000,
        });
        setLeftImg("");
        setRightImg("");
      });
  };

  // handle remove visual face

  const handleRemove = (btn) => {
    let removeVisualFace = {
      uniqueId: uniqueId,
      authType: "face",
      remove: btn,
      userId: user.user_id,
    };
    axios
      .post("http://192.168.1.247:3000/api/visualface/remove", {
        removeVisualFace,
      })
      .then((res) => {
        toast.success(res.data.message, {
          autoClose: 2000,
        });
        if (btn === "1" && res.data.message === "Data removed") {
          setLeftImg("");
          setLeftImgDB("");
        } else if (btn === "2" && res.data.message === "Data removed") {
          setRightImgDB("");
          setRightImg("");
        }
      });
  };

  // handle load data

  useEffect(() => {
    let localData = {
      visualfacesSerialforlocal: ["1", "2"],
      uniqueId: uniqueId,
    };

    axios
      .post("http://localhost:3000/api/visualface/getlocaldata", {
        localData,
      })
      .then((res) => {
        setLeftImg(res.data?.facedata1);
        setRightImg(res.data?.facedata2);
      });
  }, []);

  // api for initial module render

  useEffect(() => {
    let authType = "face";
    axios.post("http://localhost:3000/api/device", { authType }).then((res) => {
      setDeviceData(res.data.activeDevices);
    });

    let userId = router.asPath.split(":")[1];
    axios
      .post("http://localhost:3000/api/getuserbyid", { userId })
      .then((res) => {
        setUser(res.data.userData.User);
      });
  }, [rightImg, leftImg, leftImgDB, rightImgDB, dataReset]);

  useEffect(() => {
    if (user !== {} && user?.credentials?.visualFaces.length > 0) {
      setLeftImgDB(
        user?.credentials.visualFaces[0]?.template_ex_normalized_image ||
          user?.credentials.visualFaces[0]?.template_ex_picture
      );
      setRightImgDB(
        user?.credentials.visualFaces[1]?.template_ex_normalized_image ||
          user?.credentials.visualFaces[1]?.template_ex_picture
      );
    }
  }, [user]);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={false}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Card Section  */}
      <div className={styles.faceScanWrapper}>
        <div className={styles.faceScanItem}>
          {leftImg || leftImgDB ? (
            <img
              className={styles.mainImageWrapper}
              src={
                leftImg
                  ? `data:image/png;base64,${leftImg} `
                  : `data:image/png;base64,${leftImgDB}`
              }
              alt="user scanned face"
            />
          ) : (
            <img
              className={styles.mainImageWrapper}
              src="/userdetails/userdummy.svg"
              alt="user scanned face"
            />
          )}
          <div className={styles.faceScanActions}>
            {leftImg || leftImgDB ? (
              <div className={styles.actionBtns}>
                <img
                  src="/userdetails/remove.svg"
                  onClick={() => {
                    handleRemove("1");
                  }}
                />
              </div>
            ) : (
              <>
                <div className={styles.actionBtns}>
                  <img
                    src="/userdetails/scan.svg"
                    onClick={() => {
                      handleScan("1");
                    }}
                  />
                </div>
                <div className={styles.actionBtns}>
                  <label htmlFor="files">
                    <img src="/userdetails/upload-arrow-svg.svg" />
                  </label>
                  <input
                    id="files"
                    type="file"
                    name="upload"
                    accept="image/jpeg,image/jpg,image/png"
                    style={{ display: "none" }}
                    onChange={(e) => encodeImageFileAsURL(e, "1")}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.faceScanItem}>
          {rightImg || rightImgDB ? (
            <img
              className={styles.mainImageWrapper}
              src={
                rightImg
                  ? `data:image/png;base64,${rightImg} `
                  : `data:image/png;base64,${rightImgDB}`
              }
              alt="user scanned face"
            />
          ) : (
            <img
              className={styles.mainImageWrapper}
              src="/userdetails/userdummy.svg"
              alt="user scanned face"
            />
          )}

          <div className={styles.faceScanActions}>
            {rightImg || rightImgDB ? (
              <div className={styles.actionBtns}>
                <img
                  src="/userdetails/remove.svg"
                  onClick={() => {
                    handleRemove("2");
                  }}
                />
              </div>
            ) : (
              <>
                <div className={styles.actionBtns}>
                  <img
                    src="/userdetails/scan.svg"
                    onClick={() => {
                      handleScan("2");
                    }}
                  />
                </div>
                <div className={styles.actionBtns}>
                  <label htmlFor="files2">
                    <img src="/userdetails/upload-arrow-svg.svg" />
                  </label>
                  <input
                    id="files2"
                    type="file"
                    name="upload"
                    accept="image/jpeg,image/jpg,image/png"
                    style={{ display: "none" }}
                    onChange={(e) => encodeImageFileAsURL(e, "2")}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.footerWrapper}>
        <div className={styles.exitSearchLink}>
          <img src="/userdetails/arrow-left.svg" alt="arrow back" />
          <span onClick={handleSearch}>Exit & Search again</span>
        </div>
        <div className={styles.footerButtonWrapper}>
          <button className={styles.btnOrange} onClick={handleReset}>
            Reset
          </button>
          <button className={styles.btnGreen} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default Visualface;
