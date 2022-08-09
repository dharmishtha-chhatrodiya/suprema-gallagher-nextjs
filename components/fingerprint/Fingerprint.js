import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./Fingerprint.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

const Fingerprint = ({ setDeviceData, deviceData, deviceId }) => {
  const [quality, setQuality] = useState("20");
  const [rawImage, setRawImage] = useState(false);
  const [fingerNumber, setFingerNumber] = useState("1");
  const [leftFingerImg, setLeftFingerImg] = useState("");
  const [rightFingerImg, setRightFingerImg] = useState("");
  const [leftFingerImgDB, setLeftFingerImgDB] = useState("");
  const [rightFingerImgDB, setRightFingerImgDB] = useState("");
  const [leftRawImg, setLeftRawImg] = useState("");
  const [rightRawImg, setRightRawImg] = useState("");
  const [activeFingerImage, setActiveFingerImage] = useState([]);
  const [hadnValue, setHandValue] = useState("left");
  const [clickFinger, setClickFinger] = useState(false);
  const router = useRouter();
  const userId = router.asPath.split(":")[1];
  console.log("hadnValue******", hadnValue);
  // handle scan fingerprint
  const handleScan = () => {
    let fingerprintScan = {
      uniqueId: 519,
      deviceid: deviceId,
      fingerprintSerial: fingerNumber,
      enroll_quality: quality,
      raw_image: rawImage,
    };
    axios
      .post("http://localhost:3000/api/fingerprint/scan", { fingerprintScan })
      .then((res) => {
        console.log(res.data);
        toast.error(res.data.message);
        if (res.data.firstscan === "success") {
          axios
            .post("http://localhost:3000/api/fingerprint/scan", {
              fingerprintScan,
            })
            .then((res) => {
              setLeftFingerImg(res.data.template_image0);
              setRightFingerImg(res.data.template_image1);
              if (
                res.data.responseofrawimage &&
                res.data.responseofrawimage?.Raw_image !==
                  "false from raw image"
              ) {
                setLeftRawImg(res.data.responseofrawimage.Raw_image.raw_image1);
                setRightRawImg(
                  res.data.responseofrawimage.Raw_image.raw_image2
                );
              }
              toast.error(res.data.message);
            });
        }
      });
  };

  const getRerender = () => {
    axios
      .post("http://localhost:3000/api/getuserbyid", { userId })
      .then((res) => {
        console.log(
          "response.dataaaaaa",
          res.data.userData.User.fingerprint_templates
        );
        setActiveFingerImage(res?.data?.userData?.User?.fingerprint_templates); // set if image already in data
        if (
          parseInt(fingerNumber) <=
          parseInt(res.data.userData.User?.fingerprint_template_count)
        ) {
          setLeftFingerImgDB(
            res.data.userData.User?.fingerprint_templates[fingerNumber - 1]
              .template_image0
          );
          setRightFingerImgDB(
            res.data.userData.User?.fingerprint_templates[fingerNumber - 1]
              .template_image1
          );
        } else {
          setLeftFingerImgDB("");
          setRightFingerImgDB("");
        }
      });
  };

  // handle save

  const handleEnroll = () => {
    let fingerprintSave = {
      uniqueId: 519,
      deviceid: deviceId,
      userId: parseInt(userId),
      enroll: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    };
    axios
      .post("http://localhost:3000/api/fingerprint/save", { fingerprintSave })
      .then((res) => {
        if (res.data.success === true) {
          toast.success(res.data.message, {
            autoClose: 2000,
          });
          setLeftFingerImg("");
          setRightFingerImg("");
          setLeftRawImg("");
          setRightRawImg("");
          getRerender();
        } else {
          toast.error(res.data.message);
        }
      });
  };
  // handle search again
  const handleSearch = () => {
    router.push("/usersearch");
  };

  // handle remove

  const handleRemove = () => {
    let removeFingerprint = {
      uniqueId: 519,
      add: fingerNumber,
      deviceid: deviceId,
      userId: parseInt(userId),
    };

    axios
      .post("http://localhost:3000/api/fingerprint/remove", {
        removeFingerprint,
      })
      .then((res) => {
        if (res.data.success === true) {
          setLeftFingerImg("");
          setRightFingerImg("");
          setLeftFingerImgDB("");
          setRightFingerImgDB("");
          setLeftRawImg("");
          setRightRawImg("");
          toast.success(res.data.message, {
            autoClose: 2000,
          });
        } else {
          toast.error(res.data.message);
        }
      });
  };

  // for handle reset

  const handleReset = () => {
    let resetFingerprint = {
      uniqueId: 519,
      deviceid: deviceId,
      reset: true,
      userId: parseInt(userId),
    };

    axios
      .post("http://localhost:3000/api/fingerprint/reset", {
        resetFingerprint,
      })
      .then((res) => {
        toast.success(res.data.message, {
          autoClose: 2000,
        });
        setLeftFingerImg("");
        setRightFingerImg("");
        setLeftFingerImgDB("");
        setRightFingerImgDB("");
        setLeftRawImg("");
        setRightRawImg("");
        getRerender();
      });
  };

  // get local data

  const handleLocalData = (number) => {
    setFingerNumber(number);
    let localData = {
      uniqueId: 519,
      deviceid: deviceId,
      fingerserial: number,
    };

    setLeftRawImg("");
    setRightRawImg("");

    axios
      .post("http://localhost:3000/api/fingerprint/getlocaldata", { localData })
      .then((res) => {
        // console.log(res.data.FingerprintTemplatedata.template_image0, "form local data");
        setLeftFingerImg(res.data?.FingerprintTemplatedata?.template_image0);
        setRightFingerImg(res.data?.FingerprintTemplatedata?.template_image0);
      });
  };

  // initial api calls

  console.log(deviceId, "deviceData");
  useEffect(() => {
    let authType = "fingerprint";
    axios.post("http://localhost:3000/api/device", { authType }).then((res) => {
      setDeviceData(res.data.activeDevices);
    });
    getRerender();
  }, [
    leftFingerImg,
    leftFingerImgDB,
    rightFingerImg,
    rightFingerImgDB,
    fingerNumber,
  ]);

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
      <div className={styles.fignerScanWrapper}>
        <div className={styles.fingerScanLeft}>
          <div className={styles.fingerScanFilters}>
            <div className={styles.fingerScanFiltersDropdownFirst}>
              <select
                className={styles.searchList}
                onChange={(e) => setHandValue(e.target.value)}
              >
                <option value="left" selected>
                  Left
                </option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className={styles.fingerScanFiltersDropdownSecond}>
              <select
                onChange={(e) => setQuality(e.target.value)}
                className={styles.searchList}
              >
                <option value="SelectDevice" selected>
                  20
                </option>
                <option value="40">40</option>
                <option value="60">60</option>
                <option value="80">80</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className={styles.rawImageWrapper}>
              <div className={styles.formgroup}>
                <label className={styles.controlCheckbox}>
                  Raw Image
                  <input
                    type="checkbox"
                    id="rawImage"
                    onChange={(e) => setRawImage(e.target.checked)}
                  />
                  <div className={styles.controlIndicator}></div>
                </label>
              </div>
            </div>
          </div>
          {hadnValue === "left" ? (
            <div className={styles.fingerScannedDisplay}>
              <img
                className={styles.fullHand}
                src="./fingerprint/fullhand.svg"
                alt="scanned fingers display"
              />
              <div
                className={`${styles.fingerOne} ${
                  clickFinger === true ? styles.clickActiveFinger : ""
                }`}
              >
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[0]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => {
                    handleLocalData("1");
                    console.log("clickkc");
                    setClickFinger(!clickActiveFinger);
                  }}
                />
              </div>
              <div className={styles.fingerTwo}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[1]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("2")}
                />
              </div>
              <div className={styles.fingerThree}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[2]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("3")}
                />
              </div>
              <div className={styles.fingerFour}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[3]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("4")}
                />
              </div>
              {/* <!-- Add active class for active finger  --> */}
              <div className={styles.fingerFive}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[4]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("5")}
                />
              </div>
            </div>
          ) : (
            <div className={styles.fingerScannedDisplayright}>
              <img
                className={styles.fullHand}
                src="./fingerprint/fullhand.svg"
                alt="scanned fingers display"
              />
              <div className={styles.fingerOne}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[5]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("6")}
                />
              </div>
              <div className={styles.fingerTwo}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[6]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("7")}
                />
              </div>
              <div className={styles.fingerThree}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[7]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("8")}
                />
              </div>
              <div className={styles.fingerFour}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[8]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("9")}
                />
              </div>
              {/* <!-- Add active class for active finger  --> */}
              <div className={styles.fingerFive}>
                <img
                  src={
                    activeFingerImage?.length >= 1 && activeFingerImage[9]
                      ? `./fingerprint/fingerthree_active.svg`
                      : `./fingerprint/fingerthree.svg`
                  }
                  onClick={() => handleLocalData("10")}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.fingerScanRight}>
          <div type="submit" onClick={handleRemove}>
            <div className={styles.removeActionBtns}>
              <img src="./userdetails/remove.svg" />
            </div>
          </div>

          <div
            type="submit"
            onClick={handleScan}
            className={styles.fingerScanFlotBtn}
          >
            <div className={styles.actionBtns}>
              <img src="./fingerprint/scan.svg" />
            </div>
          </div>

          <div className={styles.finerScanItemWrapper}>
            <div className={styles.fingerScanItem}>
              {/* <img src="./fingerprint/fingerprint_full_one.svg" />  */}
              {leftFingerImg || leftFingerImgDB ? (
                <img
                  src={
                    leftFingerImg
                      ? `data:image/png;base64,${leftFingerImg} `
                      : `data:image/png;base64,${leftFingerImgDB}`
                  }
                  alt="face"
                />
              ) : (
                <img src="./fingerprint/fingerprint_null.svg" />
              )}
            </div>
            <div className={styles.fingerScanItem}>
              {rightFingerImg || rightFingerImgDB ? (
                <img
                  src={
                    rightFingerImg
                      ? `data:image/png;base64,${rightFingerImg} `
                      : `data:image/png;base64,${rightFingerImgDB}`
                  }
                  alt="finger"
                />
              ) : (
                <img src="./fingerprint/fingerprint_null.svg" />
              )}
            </div>
            {rawImage === true ? (
              <>
                <div className={styles.fingerScanItem}>
                  {leftRawImg ? (
                    <img
                      src={`data:image/png;base64,${leftRawImg}`}
                      alt="face"
                    />
                  ) : null}
                </div>
                <div className={styles.fingerScanItem}>
                  {rightRawImg ? (
                    <img
                      src={`data:image/png;base64,${rightRawImg}`}
                      alt="face"
                    />
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.footerWrapper}>
        <div className={styles.exitSearchLink}>
          <img src="./arrowleft.svg" alt="arrow back" />
          <span onClick={handleSearch}>Exit & Search again</span>
        </div>
        <div className={styles.footerButtonWrapper}>
          <button
            type="submit"
            onClick={handleReset}
            className={styles.btnOrange}
          >
            Reset
          </button>
          <button
            type="submit"
            onClick={handleEnroll}
            className={styles.btnGreen}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default Fingerprint;
