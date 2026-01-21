'use client';

import { useRegisterUserMutation } from '@/app/features/auth/authApi';
import { redirect, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaUser, FaEnvelope, FaLock, FaCode, FaBirthdayCake } from 'react-icons/fa';
import Swal from 'sweetalert2';

type RegisterFormData = {
  name: string;
  skill: string;
  age: number;
  email: string;
  password: string;
};

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const router = useRouter();

  const [postRegister] = useRegisterUserMutation();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // ✅ Call API
      const res = await postRegister(data).unwrap();
      console.log(res, 'response data');

      // ✅ Set email in localStorage
      localStorage.setItem('email', data.email);

      // ✅ SweetAlert Success
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'A verification code has been sent to your email.',
        confirmButtonText: 'Verify Now',
        confirmButtonColor: '#6366f1', // Indigo-500
      });

      // ✅ Redirect to verification page
      router.push('/verify-user');
    } catch (error: any) {
      // console.error('Registration error:', error?.data?.error || error.message);

      // ✅ SweetAlert Error
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error?.data?.message,
        confirmButtonColor: '#ef4444', // Red-500
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  from-indigo-600 via-blue-500 to-purple-600 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          Student Registration
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <div className="relative mt-1">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('name', { required: 'Name is required' })}
                placeholder="Mst Afsana Akter"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Skill */}
          <div>
            <label className="text-sm font-medium text-gray-600">Skill</label>
            <div className="relative mt-1">
              <FaCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('skill', { required: 'Skill is required' })}
                placeholder="JavaScript"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {errors.skill && <p className="text-red-500 text-xs mt-1">{errors.skill.message}</p>}
          </div>

          {/* Age + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Age</label>
              <div className="relative mt-1">
                <FaBirthdayCake className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  {...register('age', {
                    required: 'Age is required',
                    valueAsNumber: true,
                    min: { value: 5, message: 'Minimum age is 5' },
                  })}
                  className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="relative mt-1">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg">
            Register
          </button>
        </form>
        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 font-semibold hover:underline transition">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
