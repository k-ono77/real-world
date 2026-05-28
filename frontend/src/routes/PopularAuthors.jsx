import { Link } from "react-router-dom";
import ContainerRow from "../components/ContainerRow";
import BannerContainer from "../components/BannerContainer";
import { useAuth } from "../context/AuthContext";
import { cache, useEffect, useState } from "react";
import getAuthors from "../services/getAuthors";

function PopularAuthors() {
  const [ authors, setAuthors ] = useState([]) 
  const fetchAuthors = async () => {
    try{
      const data = await getAuthors();
      console.log(data)
      setAuthors(data)
    }catch(e){
      console.log(e)
    }
  }
    useEffect(()=>{
      fetchAuthors();
    },[])
    
  return (
    <div className="popular-authors">
      <ContainerRow type = "page">
        <div className="col-md-6 offset-md-3 col-xs-12">
          <h1 className="text-xs-center">Popular Authors🔥</h1>
        </div>
      </ContainerRow>
      <ul className="list-group ">
          {authors.map((item, index) => (
            <li key={index} className="list-group-item text-xs-center">
              <h3>{index+1}.{item.users?.username}</h3> 
            </li>
          ))}
      </ul>
    </div>
  );
}
export default PopularAuthors;

