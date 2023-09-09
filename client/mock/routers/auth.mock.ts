import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/v1/auth/login',
  method: 'POST',
  body: {"access_token": 'access_token', "token_type": "bearer"}
})