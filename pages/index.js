import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../components/header/Header";
import styles from "../styles/login.module.css";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // const [message, setMessage] = useState("");

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    let User = {
      login_id: userId,
      password: password,
    };

    axios.post("http://localhost:3000/api/login", { User }).then((res) => {
      // setMessage(res.data.message);
      if (res.data.message === "authorized") {
        router.push("/usersearch");
        localStorage.setItem("token", res.data["bs-session-id"]);
        localStorage.setItem("login_id", userId);
        localStorage.setItem("password", password);
      } else {
        toast.error(res.data.message);
      }
    });
  };

  useEffect(() => {
    axios.get("http://localhost:3000/api/login").then((res) => {
      if (res.data.responseofauotloign.autologin === "success") {
        router.push("/usersearch");
      }
    }, []);
  });
  return (
    <>
      <Header />
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
      <div className={styles.container}>
        <div className={styles.loginFromWrapper}>
          <h2 className={styles.loginTitle}>Admin Login</h2>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Username"
                title="uername"
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="password"
                placeholder="Password"
                title="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              className={styles.btnOrange}
              class="btn-orange btn-submit"
              value="LOGIN"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
