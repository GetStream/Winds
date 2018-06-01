import { request } from 'chai';

exports.withLogin = async (api, req, user) => {
  let response = await request(api).post('/auth/login').send(user);
  const authToken = response.body.jwt
  return req.set('Authorization', `Bearer ${authToken}`)
};
