// import jwt from "jsonwebtoken";
// import ApiError from "../utils/ApiError.js";

// const authMiddleware = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     throw new ApiError(400, "Unauthorized: No token provided");
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     throw new ApiError(400, "Invalid token");
//   }
// };

// export default authMiddleware;
