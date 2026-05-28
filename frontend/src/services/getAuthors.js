import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function getAuthors() {
  try {
    const { data } = await axios({ url:"api/popular-authors"});
    return data
  } catch (error) {
    errorHandler(error);
  }
}

export default getAuthors;
