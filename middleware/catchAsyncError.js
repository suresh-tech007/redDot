const theFunc = (ErrorHandler) => {
    return (req, res, next) => {
      Promise.resolve(ErrorHandler(req, res, next)).catch((err) => next(err));
    };
  };
  
export default theFunc;
