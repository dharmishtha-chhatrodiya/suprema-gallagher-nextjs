import React from "react";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <div className={styles.headerLogoWrapper}>
      <div className={styles.logoSection}>
        <img src="./Group2.svg" alt="logo" />
      </div>
    </div>
  );
};

export default Header;
