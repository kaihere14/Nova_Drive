import { NextFunction,Request,Response } from "express";
import jwt from "jsonwebtoken"
import { Secret } from "jsonwebtoken"
const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const verifyJwt = (req:Request,res:Response,next:NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return Promise.reject({ status: 401, message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(" ")[1];
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if(err){
                return Promise.reject({ status: 401, message: "Unauthorized: Invalid token" });
            }
            // decoded can be string or JwtPayload; cast to JwtPayload to access userId
            const payload = decoded as import("jsonwebtoken").JwtPayload;
            (req as any).userId = payload.userId;
            next();
        });
    }
    catch(error){
        return Promise.reject({ status: 500, message: "Internal Server Error" });
    }
};