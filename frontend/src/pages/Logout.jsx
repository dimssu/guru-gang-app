import { useEffect } from "react";
import { useAuth } from "../context/Authcontext"
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";


const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/login");
  }, []);

  return null;
};

export default Logout;