const sendToken = (user, rememberMe = false, statusCode, res) => {
  const token = user.getJwtToken();

  // Calculate the cookie expiration time based on the rememberMe flag
  const cookieExpireTime = rememberMe
    ? 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    : 1 * 60 * 60 * 1000; // 1 hour in milliseconds

  // Options for cookie
  const options = {
    expires: new Date(Date.now() + cookieExpireTime), // Expiration time
    httpOnly: true, // Prevent client-side access to the cookie
    secure: process.env.NODE_ENV === 'PRODUCTION', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'PRODUCTION' ? 'None' : 'Lax', // SameSite policy
    path: '/', // Cookie available on all routes
    domain: process.env.NODE_ENV === 'PRODUCTION' ? 'reddot-1geh.onrender.com' : undefined, // Domain for production
  };

  res
    .status(statusCode)
    .cookie("token", token, options) // Set the cookie
    .json({  
      success: true,
      user,
    });
};

export default sendToken;
