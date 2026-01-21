import React from 'react';
import { useLogoutMutation } from '../features/auth/authApi';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

type ButtonProps = {
  onClick?: () => void;
};

const Button: React.FC<ButtonProps> = () => {
  const [logOut] = useLogoutMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  const onClick = async () => {
    try {
      await logOut({}).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'logOut Successful!',
        text: 'A verification code has been sent to your email.',
      });
      // ✅ Client-side redirect
      router.push('/login');
      // ✅ Force reload
      window.location.href = '/login'; // এটি auto reload করবে
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'LogOut Failed',
      });
    }
  };

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={onClick}
        className="
          px-6 py-2
          rounded-lg
          bg-red-600
          text-white
          font-semibold
          shadow-md
          transition
          duration-300
          hover:bg-red-700
          hover:scale-105
          active:scale-95
          focus:outline-none
          focus:ring-2
          focus:ring-red-400
        ">
        Log out
      </button>
    </div>
  );
};

export default Button;
