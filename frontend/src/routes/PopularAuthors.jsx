import { Link } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import BannerContainer from "../components/BannerContainer";
import { useAuth } from "../context/AuthContext";

function PopularAuthors() {
  return (
    <div className="popular-authors">
      <ContainerRow type = "page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Popular Authors🔥</h1>
        </div>
      </ContainerRow>
    </div>
  );
}

export default PopularAuthors;

