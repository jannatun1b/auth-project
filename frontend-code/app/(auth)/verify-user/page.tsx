'use client';

import { useResendOtpMutation, useVerifyOtpMutation } from '@/app/features/auth/authApi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaShieldAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

type VerificationFormData = {
  code: string;
};

const Verification = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>();

  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  const [postVerfiy] = useVerifyOtpMutation();
  const [postVerfiyResend] = useResendOtpMutation();
  // ✅ Access localStorage only on client
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    setEmail(storedEmail);
  }, []);
  const onSubmit = async (data: VerificationFormData) => {
    try {
      const payload = {
        code: data.code,
        email,
      };
      // ✅ unwrap() function call
      const res = await postVerfiy(payload).unwrap();
      // token save
      localStorage.setItem('authToken', res.token);
      console.log(res, 'response data');
      await Swal.fire({
        icon: 'success',
        title: 'Verify Successful!',
        text: 'A verification code has been sent to your email.',
        confirmButtonText: 'Verify Now',
        confirmButtonColor: '#6366f1', // Indigo-500
      });
      // ✅ Client-side redirect
      router.push('/');
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Verify Failed',
        text: error?.data?.message,
        confirmButtonColor: '#ef4444', // Red-500
      });
    }
  };
  const onSubmitResendOtp = async () => {
    try {
      const payload = {
        email,
      };
      // ✅ unwrap() function call
      const res = await postVerfiyResend(payload).unwrap();
      console.log(res, 'response data');
      await Swal.fire({
        icon: 'success',
        title: 'Resend Successful!',
        text: 'A verification code has been sent to your email.',
        confirmButtonText: 'Verify Now',
        confirmButtonColor: '#6366f1', // Indigo-500
      });
    } catch (error: any) {
      console.error('Registration error:', error?.data?.error || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-purple-600 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
            <FaShieldAlt size={28} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Verification</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">Enter the 6-digit code sent to your email</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Code Input */}
          <div>
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter verification code"
              {...register('code', {
                required: 'Verification code is required',
                minLength: { value: 6, message: 'Code must be 6 digits' },
              })}
              className="w-full text-center tracking-widest text-lg py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg">
            Verify
          </button>
        </form>

        {/* Resend */}
        <p className="text-sm text-gray-600 mt-6">
          Didn’t receive the code?{' '}
          <button
            type="button"
            onClick={onSubmitResendOtp}
            className="text-indigo-600 cursor-alias font-semibold hover:underline">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default Verification;
