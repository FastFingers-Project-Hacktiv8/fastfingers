import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import baseUrl from "../api/baseUrl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const LoginForm = ({ onSwitchMode, onTyping }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${baseUrl}/login`, formData);

      localStorage.setItem("access_token", data.access_token);
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
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
            placeholder="Your Username"
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
        Sign In
      </button>

      {/* Switch to Register */}
      <div className="text-center text-sm text-white">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
