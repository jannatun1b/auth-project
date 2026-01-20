import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5050/api/v1/user', // backend base url
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
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useLoginUserMutation,
  useResendOtpMutation,
} = authApi;
