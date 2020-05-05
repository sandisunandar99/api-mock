let jwt = require('jsonwebtoken')
const secret = '1234567890'


let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'] || req.headers['Access-Control-Allow-Origin: *']
  
  if (req.headers.authorization === undefined || req.headers.authorization === null || req.headers.authorization === '') {
    return res.json({
        status: 403,
        message: 'Unauthorized access'
      });
  }else{
    if (token.startsWith('Bearer')) {
        // Remove Bearer from string
        token = token.slice(7, token.length)
    }

    if (token) {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            return res.json({
              status: 403,
              message: 'Token is not valid'
            });
          } else {
            req.decoded = decoded;
            next();
          }
        });
      } else {
        return res.json({
          status: 403,
          message: 'Auth token is not supplied'
        });
    }

  }//end

};

module.exports = {
  checkToken: checkToken,
}
