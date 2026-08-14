import axios from "axios";

const api = axios.create({
  baseURL: "https://closet-backend-hdr3.onrender.com/api",
});

export default api;