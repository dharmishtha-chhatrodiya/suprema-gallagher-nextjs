import styles from "../styles/userDetails.module.css";
import React, { useEffect, useState } from "react";
import Header from "../components/header/Header";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Visualface from "../components/visualface/Visualface";
import Fingerprint from "../components/fingerprint/Fingerprint";
import { useRouter } from "next/router";

const userdetails = () => {
  const [deviceData, setDeviceData] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [user, setUser] = useState({});
  const [userId, setUserId] = useState("");
  const [module, setModule] = useState("");

  const router = useRouter();

  const path = router.asPath;

  const handleSearch = () => {
    router.push("/usersearch");
  };

  useEffect(() => {
    setModule(window.location.href.split(":")[4]);
    setUserId(path.split(":")[1]);

    let userId = router.asPath.split(":")[1];
    // console.log(path, "module ", userId);
    // console.log(typeof path);
    axios
      .post("http://localhost:3000/api/getuserbyid", { userId })
      .then((res) => {
        setUser(res.data.userData.User);
      });
  }, [module]);
  // console.log(path.split(":")[1], "module name");
  return (
    <>
      <Header />

      <div className={styles.scanDetailWithFilter}>
        <div className={styles.scanDetailUserName}>
          {user.name} ({user.user_id})
        </div>
        <div className={styles.scanFilter}>
          <div
            className={styles.scan}
            onClick={() => {
              router.push(`/userdetails?:${userId}:519`), setModule("519");
            }}
          >
            <img
              src="/userdetails/ic_round-fingerprint-black.svg"
              alt="finger"
            />
          </div>
          <div className={styles.scan}>
            <img
              src="/userdetails/happy-filled-face-svgrepo-com-black.svg"
              alt="finger"
            />
          </div>
          {/* //changes by akshay -- remove active  */}
          <div
            className={styles.scan}
            onClick={() => {
              router.push(`/userdetails?:${userId}:215`), setModule("215");
            }}
          >
            <img src="/userdetails/user.svg" alt="finger" />
          </div>
          <div className={styles.scan}>
            <img
              src="/userdetails/ic_round-fingerprint-black.svg"
              alt="finger"
            />
          </div>
          <div className={styles.scanbyDropdown}>
            <select
              className={styles.searchList}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              <option value="SelectDevice" selected>
                Select device
              </option>
              {deviceData?.length > 0 &&
                deviceData.map((ele, ky) => (
                  <option key={ky} value={ele.id}>
                    {ele.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
      {/* visual face module  */}
      {module === "215" ? (
        <Visualface
          setDeviceData={setDeviceData}
          deviceData={deviceData}
          deviceId={deviceId}
        />
      ) : null}

      {/* for fingure module  */}
      {module === "519" ? (
        <Fingerprint
          setDeviceData={setDeviceData}
          deviceData={deviceData}
          deviceId={deviceId}
        />
      ) : null}

      {/* border bottom for  */}
    </>
  );
};

export default userdetails;
