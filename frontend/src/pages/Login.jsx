import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 发送验证码
  const sendOTP = async () => {
    if (!email) {
      setMessage('请输入邮箱地址');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      if (response.status === 200) {
        setMessage('✅ 验证码已发送，请查看邮箱');
        setStep('otp');
      }
    } catch (error) {
      setMessage('❌ 发送失败，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 验证登录
  const handleLogin = async () => {
    if (!otp) {
      setMessage('请输入验证码');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/login`, { email, otp });
      if (response.status === 200) {
        const { access_token } = response.data;
        // 保存 Token 到 localStorage
        localStorage.setItem('access_token', access_token);
        // 通知父组件登录成功
        onLogin(access_token);
        setMessage('✅ 登录成功！');
      }
    } catch (error) {
      setMessage('❌ 验证码错误或已过期');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏰</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">AI 时间助手</h1>
          <p className="text-gray-500 text-sm mt-1">用你的邮箱登录，开始时间管理</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={step === 'otp'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {step === 'otp' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="请输入6位验证码"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          <button
            onClick={step === 'email' ? sendOTP : handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? '处理中...' : step === 'email' ? '发送验证码' : '登录'}
          </button>

          {step === 'otp' && (
            <button
              onClick={() => { setStep('email'); setMessage(''); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 返回修改邮箱
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;