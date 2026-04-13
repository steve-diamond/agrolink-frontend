import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const API = axios.create({
  baseURL,
  timeout: 12000,
});

export default API;
