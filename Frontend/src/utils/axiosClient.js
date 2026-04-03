import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials :true,      //this means , send cookie with request
  headers: {
        "Content-Type" : "application/json"      //this means json will be sent
  }
});

export default axiosClient;