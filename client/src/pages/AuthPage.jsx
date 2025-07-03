import { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";
import Type from "../components/Type";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [lastTypedKey, setLastTypedKey] = useState("");

  const handleTyping = (key) => {
    setLastTypedKey(key);
    setTimeout(() => setLastTypedKey(""), 100);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex justify-center items-center">
        <Type lastTypedKey={lastTypedKey} />
      </div>

      <div className="flex justify-center items-center bg-black/90">
        <div className="w-full max-w-md p-6">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsRegister(true)}
              className={`px-2 font-semibold text-2xl ${
                isRegister ? "text-white font-bold" : "text-gray-500 font-bold"
              }`}
            >
              REGISTRATION
            </button>
            <span className="flex items-center text-white">/</span>
            <button
              onClick={() => setIsRegister(false)}
              className={`px-2 font-semibold text-2xl ${
                !isRegister ? "text-white font-bold" : "text-gray-500 font-bold"
              }`}
            >
              LOGIN
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
          </div>

          {isRegister ? (
            <RegisterForm
              onSwitchMode={() => setIsRegister(false)}
              onTyping={handleTyping}
              setIsRegister={setIsRegister}
            />
          ) : (
            <LoginForm
              onSwitchMode={() => setIsRegister(true)}
              onTyping={handleTyping}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
