import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import AuthProvider, { useAuth } from "../../context/AuthContext";

function PopularAuth() {
  // const { isAuth, headers } = useAuth();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/popular-authors");
  }
  return (
    <div className="sidebar">
      <button className="btn btn-primary mb-3" onClick={handleClick}>
        PopularAuth
      </button>
    </div>
  );
}

export default PopularAuth;
