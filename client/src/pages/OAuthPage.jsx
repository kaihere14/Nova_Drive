import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { useUser } from "../hooks/useUser";

const OAuthPage = () => {
  const { checkAuth, setOAuthUser } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setOAuthUser(true);

        // Wait for auth verification
        await checkAuth();

        // Now redirect to upload
        navigate("/upload");
      }
    };

    handleOAuth();
  }, [searchParams, navigate, checkAuth, setOAuthUser]);

  return <LoadingScreen message="Completing authentication..." />;
};

export default OAuthPage;
