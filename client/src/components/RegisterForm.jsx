"use client";

import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const RegisterForm = ({ onSwitchMode, onTyping }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value.length > 0) {
      const lastChar = value[value.length - 1];
      onTyping?.(lastChar);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration data:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-white mb-1"
        >
          Username
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md placeholder-white text-white bg-black/20"
            placeholder="Your username"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-white mb-1"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md placeholder-white text-white bg-black/20"
            placeholder="Your email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white mb-1"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-white text-white bg-black/20"
            placeholder="Your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Create Account
      </button>

      {/* Switch to Login */}
      <div className="text-center text-sm text-white">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
