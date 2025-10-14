import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@shared/api'; // ← تأكد أن الدالة موجودة في shared/api.ts

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 🔹 استدعاء الـ API الحقيقي في Django
      const data = await loginUser(username, password);

      if (data && data.access) {
        // حفظ التوكن في localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);

        console.log('✅ Logged in successfully');
        navigate('/'); // الانتقال للصفحة الرئيسية
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <div className="flex justify-center mb-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F38ef883953564d1a82331b4c525de032%2Fe861ade0635241c398abb23cc1b3fee3?format=webp&width=800"
            alt="Smart Learning Academy Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
