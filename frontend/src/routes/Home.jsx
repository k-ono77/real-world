import React from "react";
import { Outlet } from "react-router-dom";
import BannerContainer from "../components/BannerContainer";
import ContainerRow from "../components/ContainerRow";
import FeedToggler from "../components/FeedToggler";
import { useAuth } from "../context/AuthContext";
import FeedProvider from "../context/FeedContext";
import PopularTags from "./../components/PopularTags";
import PopularAuth from "./../components/PopularAuth";
import { useNavigate } from "react-router-dom"

function Home() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/popular-authors");
  }

  return (
    <div className="home-page">
      {!isAuth && (
        <BannerContainer>
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </BannerContainer>
      )}
      <ContainerRow type="page">
        <FeedProvider>
          <div className="col-md-9">
            <FeedToggler />
            <Outlet />
          </div>
          <aside className="col-md-3">
            <PopularTags />
            <PopularAuth />
          </aside>
        </FeedProvider>
      </ContainerRow>
    </div>
  );
}

export default Home;
