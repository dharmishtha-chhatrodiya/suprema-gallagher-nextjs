import styles from "../styles/userSearch.module.css";
import Header from "../components/header/Header";
import { useState } from "react";
import axios from "axios";
import moment from "moment";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

export default function usersearch() {
  const [searchBy, setSearchBy] = useState("");
  const [searchData, setSearchData] = useState("");
  const [userSearch, setUserSearch] = useState(false);
  const [userData, setUserData] = useState([]);

  const handleSubmit = () => {
    let usersearch = {
      exactsearch: userSearch,
      searchby: searchBy,
      search: searchData,
    };
    axios
      .post("http://localhost:3000/api/user/search", { usersearch })
      .then((res) => {
        console.log(res.data.list);
        toast.error(res.data.message);
        setUserData(res.data.list);
        // toast.error(res.data.list.message);
        if (res.data?.list?.length === 0) {
          toast.error("No user found !!!");
        }
      });
  };

  return (
    <div className={styles.container}>
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
      <main className={styles.main}>
        <div className={styles.userlistfilterWrapper}>
          <div className={styles.searchbyDropdown}>
            <select
              name="serchBy"
              id="serchBy"
              onChange={(e) => setSearchBy(e.target.value)}
              className={styles.searchList}
            >
              <option value="searchby" selected>
                Search by
              </option>
              <option value="name">User Name</option>
              <option value="id">User Id</option>
              <option value="Cardno">Card No</option>
            </select>
          </div>
          <div className={styles.searchtextBox}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Enter user details to search"
                name="search"
                title="Enter user details to search"
                onChange={(e) => setSearchData(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.exactsearchWrapper}>
            <div class="form-group">
              <label className={styles.controlCheckbox}>
                Exact Search
                <input
                  id="exact"
                  value="checked"
                  name="exactSearch"
                  type="checkbox"
                  onChange={(e) => {
                    setUserSearch(e.target.checked);
                  }}
                />
                <div className={styles.controlIndicator}></div>
              </label>
            </div>
          </div>

          <div class={styles.searchBtn}>
            <button type="submit" onClick={handleSubmit}>
              <img src="./usersearch/searchzoomout.svg" alt="search-btn" />
            </button>
          </div>
        </div>

        <div className={styles.userlistWrapper}>
          <table className={styles.userlistTabel}>
            <thead>
              <tr>
                <th>user id</th>
                <th>name</th>
                <th>
                  <img src="./usersearch/user.svg" />
                </th>
                <th>
                  <img src="./usersearch/icroundfingerprint.svg" />
                </th>
                <th>
                  <img src="./usersearch/happyfilledfacesvgrepocom.svg" />
                </th>
                <th>
                  <img src="./usersearch/key.svg" />
                </th>
                <th>EXPIRY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {userData?.length > 0
                ? userData.map((data, ky) => (
                    <tr key={ky}>
                      <td>{data.id}</td>
                      <td>{data.firstName}</td>
                      <td>{data.visualFaces}</td>
                      <td>{data.fingerprintCount}</td>
                      <td>{data.faceCount}</td> <td>{data.pin_exists}</td>
                      <td>
                        {moment
                          .utc(data.expiry_datetime)
                          .format("DD/MM/YYYY hh:mm:ss")}
                      </td>
                      <td className={styles.editLink}>
                        <Link href={`/userdetails?:${data.id}:519`}>
                          <img
                            className={styles.editIcon}
                            src="./usersearch/edit2.svg"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
