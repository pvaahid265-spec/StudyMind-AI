import axios from "axios";


const api = axios.create({
baseURL: "https://studymind-ai-9fvx.onrender.com",

  headers: {
    Accept: "application/json",
  },

  timeout: 30000,
});


export default api;