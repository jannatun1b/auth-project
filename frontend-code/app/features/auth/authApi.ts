import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5050/api/v1/user', // backend base url
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = Cookies.get('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Register
    registerUser: builder.mutation({
      query: (data) => ({
        url: '/registration',
        method: 'POST',
        body: data,
      }),
    }),

    // Verify OTP
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/verify-user',
        method: 'POST',
        body: data,
      }),
    }),
    // Verify OTP
    resendOtp: builder.mutation({
      query: (data) => ({
        url: '/reset-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // Login
    loginUser: builder.mutation({
      query: (data) => ({
        url: '/login',
        method: 'POST',
        body: data,
      }),
    }), // Login
    logInUser: builder.query({
      query: () => ({
        url: '/me',
        method: 'GET',
      }),
    }),
    // Login
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useLoginUserMutation,
  useResendOtpMutation,
  useLogoutMutation,
  useLogInUserQuery,
} = authApi;
