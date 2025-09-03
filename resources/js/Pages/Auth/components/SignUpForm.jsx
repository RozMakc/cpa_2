import { useState } from "react";
import { Link, useForm } from '@inertiajs/react';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/icons'
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
  });

  const submit = (e) => {
      e.preventDefault();

      post(route('register'), {
          onFinish: () => reset('password', 'password_confirmation'),
      });
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={submit}>
              <div className="space-y-5">
                
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <InputLabel>
                      First Name<span className="text-error-500">*</span>
                    </InputLabel>
                    <TextInput
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                {/* <!-- Email --> */}
                <div>
                  <InputLabel>
                    Email<span className="text-error-500">*</span>
                  </InputLabel>
                  <TextInput
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    placeholder="Enter your email"
                    onChange={(e) => setData('email', e.target.value)}
                    required
                  />
                  {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                  <InputLabel>
                  Phone<span className="text-error-500">*</span>
                  </InputLabel>
                  <TextInput
                    type="text"
                    id="phone"
                    name="phone"
                    value={data.phone}
                    placeholder="Enter your phone"
                    onChange={(e) => setData('phone', e.target.value)}
                    required
                  />
                                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                </div>


                {/* <!-- Password --> */}
                <div>
                  <InputLabel>
                    Password<span className="text-error-500">*</span>
                  </InputLabel>
                  <div className="relative">
                    <TextInput
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                </div>

                <div>
                  <InputLabel>
                  Confirm Password<span className="text-error-500">*</span>
                  </InputLabel>
                  <div className="relative">
                    <TextInput
                      placeholder="Enter your password"
                      type={showPasswordConfirm ? "text" : "password"}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPasswordConfirm ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Sign Up
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  href={route('login')}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}