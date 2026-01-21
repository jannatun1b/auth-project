'use client';

import { useLoginUserMutation } from '@/app/features/auth/authApi';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const router = useRouter();
  const [loginUser] = useLoginUserMutation();

  const token = Cookies.get('authToken');
  console.log(token, 'token');

  const onSubmit = async (data: LoginFormData) => {
    try {
      // ✅ Call API
      const res = await loginUser(data).unwrap();
      console.log(res, 'response data');

      // ✅ Set email in localStorage
      localStorage.setItem('email', data.email);

      // ✅ SweetAlert Success
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'User login successfully.',
      });

      // ✅ Redirect to verification page
      router.push('/');
    } catch (error: any) {
      // console.error('Registration error:', error?.data?.error || error.message);

      // ✅ SweetAlert Error
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error?.data?.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  from-indigo-600 via-blue-500 to-purple-600 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">Login to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="relative mt-1">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="example@gmail.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <a href="#" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg">
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{' '}
          <a href="/register" className="text-indigo-600 font-semibold hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
