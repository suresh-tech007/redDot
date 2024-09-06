const sendToken = (user, rememberMe = false, statusCode, res) => {
  const token = user.getJwtToken();

  // Calculate the cookie expiration time based on the rememberMe flag
  const cookieExpireTime = rememberMe
    ? 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    : 1 * 60 * 60 * 1000; // 1 hour in milliseconds

  // options for cookie
  const options = {
    expires: new Date(Date.now() + cookieExpireTime),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'PRODUCTION',
    sameSite: process.env.NODE_ENV === 'PRODUCTION' ? 'None' : 'Lax'
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({  
      success: true,
      user,
       
       
       
    });
};

export default sendToken;
