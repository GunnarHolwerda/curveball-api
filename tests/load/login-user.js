const axios = require('axios');

module.exports = {
  setAuthorizationHeader: setAuthorizationHeader
}

function randNum() {
  return (Math.random() * 9).toFixed();
}

function setAuthorizationHeader(requestParams, context, ee, next) {
  const phone = `${randNum()}${randNum()}${randNum()}-${randNum()}${randNum()}${randNum()}-${randNum()}${randNum()}${randNum()}${randNum()}`;
  axios.post('https://quiz.dev.curveball.tv/dev/users', { phone }).then((response) => {
    const { userId } = response.data;
    axios.post(`https://quiz.dev.curveball.tv/dev/users/${userId}/verify`, { code: '0000000' }).then((response) => {
      const { token: jwt } = response.data;
      requestParams.headers['Authorization'] = `Bearer ${jwt}`;
      return next();
    }).catch((err) => {
      console.error('User verification error', err);
    })
  }).catch((err) => {
    console.error('User creation error', err);
  });
}