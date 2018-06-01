import { request } from 'chai';

export async function withLogin(api, req, user) {
  let response = await request(api).post('/auth/login').send(user);
  const authToken = response.body.jwt
  return req.set('Authorization', `Bearer ${authToken}`)
}
