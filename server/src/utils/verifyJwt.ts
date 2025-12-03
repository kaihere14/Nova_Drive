import { NextFunction,Request,Response } from "express";
import jwt from "jsonwebtoken"
import { Secret } from "jsonwebtoken"
const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const verifyJwt = (req:Request,res:Response,next:NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if(err){
                return res.status(401).json({ message: "Unauthorized: Invalid token" });
            }
            // decoded can be string or JwtPayload; cast to JwtPayload to access userId
            const payload = decoded as import("jsonwebtoken").JwtPayload;
            (req as any).userId = payload.userId;
            next();
        });
    }
    catch(error){
        return res.status(500).json({ message: "Internal Server Error" });
    }
};