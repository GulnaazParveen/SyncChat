import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// ✅ Fixed function name
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate user input
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if the user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  console.log(avatarLocalPath);

  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarResponse) {
    throw new ApiError(400, "Failed to upload avatar");
  }
  console.log(avatarResponse);

  const avatarUrl = avatarResponse.secure_url; // Only store URL

  // Create new user
  const user = await User.create({
    name: name.toLowerCase(),
    email,
    password,
    avatar: avatarUrl,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, " email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
 const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);
  console.log("Body: ", req.body);
  console.log("RefreshToken in body: ", req.body.refreshToken);
  console.log("RefreshToken in cookies: ", req.cookies.refreshToken);

  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return next(new ApiError(400, "Unauthorized request"));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || refreshToken !== user.refreshToken) {
      return next(
        new ApiError(401, "Invalid refresh token, please log in again.")
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    return next(new ApiError(401, "Invalid refresh token."));
  }
});

//get all logged data
const getAllLoggedUser = asyncHandler(async (req, res) => {
  const allUserData = await User.find();
  if (!allUserData) {
    throw new ApiError(404, "something weng wrong");
  }
  return res.status(201).json(new ApiResponse(200, allUserData, ""));
});

// get userlogged data
const individualLoggedUser=asyncHandler(async(req,res)=>{
  const individualUser=await User.findById(req.user._id).select("-password");
  if(!individualUser){
    throw new ApiError(401,"user is not register");
  }
   return res
     .status(200)
     .json(
       new ApiResponse(
         200,
         { user: individualUser },
         "User fetched successfully"
       )
     );
})

export { registerUser, loginUser, logoutUser, refreshAccessToken,getAllLoggedUser,individualLoggedUser };

