import request from 'supertest';
import { app } from '../../app';

it('responds with detail about current user', async () => {
  const cookie= await global.signup()
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentuser.email).toEqual('test@test.com')
});

it('responds with null if not signed in ', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(400);
  expect(response.body.currentUser).toEqual(null)
});