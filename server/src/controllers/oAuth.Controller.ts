import {Request, Response} from 'express';
import axios from "axios";
import { User } from '../models/user.model';
import { generateToken } from './user.controller';
import { logger } from "../index.js";



export const googleAuthRedirect = (req: Request, res: Response) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    const scope = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');
   const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true`;
    res.redirect(authUrl);
}

export const googleAuthCallback = async(req: Request, res: Response) => {
    const authCode = req.query.code as string;
     try {
            const tokenRes = await axios.post(
    "https://oauth2.googleapis.com/token",
    {
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
    },
    { headers: { "Content-Type": "application/json" } }
    );

    const { access_token, id_token } = tokenRes.data;

    const userInfoRes = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const userInfo = userInfoRes.data;
    const { user, accessToken, refreshToken,message } = await createOAuthUser(userInfo);
    const redirectUrl = `https://novadrive.space/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&message=${encodeURIComponent(message)}`;
    res.redirect(redirectUrl);
    } catch (error) {
        res.status(500).json({ message: "Error during Google OAuth callback", error });
    }
}


export const createOAuthUser = async (profile: any) => {
    try {
        let user = await User.findOne({ email: profile.email });
        let message = "Existing user logged in";
        if (!user) {
            user = new User({
                username: profile.name,
                email: profile.email,
                password: "", // No password for OAuth users
                authProvider: "google",
                googleID: profile.id,
                avatar: profile.picture,
            });
            await user.save();
            message = "New OAuth user created";
        }
        
        const { accessToken, refreshToken } = generateToken(user._id.toString());
        return { user, accessToken, refreshToken,message};
      }
     catch (error: any) {
        logger.error("oauth_user_creation_failed", {
            email: profile.email,
            provider: "google",
            error: error.message,
            stack: error.stack,
        });
        throw error;
    }
};

