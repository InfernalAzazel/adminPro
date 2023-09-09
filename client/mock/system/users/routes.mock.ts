import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/v1/users/routes',
  body: {a: 1}
})