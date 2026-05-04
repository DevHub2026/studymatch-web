import api from './axiosInstance'

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const register = (data) =>
  api.post('/auth/register', data)

export const logout = () =>
  api.post('/auth/logout')

export const getMe = () =>
  api.get('/auth/me')

export const verifyEmail = (otp) =>
  api.post('/auth/verify-email', { otp })

export const resendVerification = () =>
  api.post('/auth/resend-verification')

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

export const resetPassword = (data) =>
  api.post('/auth/reset-password', data)