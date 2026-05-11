import { useEffect, useState } from "react";
import PopularAuthButton from "./PopularAuthButton";
import { useNavigate } from "react-router-dom"

function PopularAuth() {
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
