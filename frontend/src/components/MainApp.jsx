import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import TimeLineView from './TimeLineView';
import TimeBlockTab from './tabs/TimeBlockTab';
import { TimeBlockProvider } from '../context/TimeBlockContext';


const API_URL = 'http://127.0.0.1:8000/api/v1/research';

const SUGGESTIONS = [
  "什么是 LangGraph？",
  "2026年AI Agent的主要落地场景有哪些？",
  "帮我对比一下Tavily和Google搜索API的优劣",
];

function MainApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleStreamSubmit = async (userQuery) => {
    const userMessage = { role: 'user', content: userQuery };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const response = await axios.post(API_URL, { query: userQuery });
      const fullContent = response.data.data;
      const duration = response.data.duration_seconds;

      let displayed = '';
      const words = fullContent.split(' ');
      const totalWords = words.length;
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < totalWords) {
          displayed += (index === 0 ? '' : ' ') + words[index];
          index++;
          setMessages(prev => {
            const newMessages = [...prev];
            const last = newMessages.length - 1;
            if (newMessages[last]?.isStreaming) {
              newMessages[last].content = displayed;
            }
            return newMessages;
          });
        } else {
          clearInterval(typeInterval);
          setMessages(prev => {
            const newMessages = [...prev];
            const last = newMessages.length - 1;
            if (newMessages[last]?.isStreaming) {
              newMessages[last] = { role: 'assistant', content: displayed, duration: duration };
            }
            return newMessages;
          });
          setIsLoading(false);
          setRefreshTrigger(prev => prev + 1);
        }
      }, 30);
    } catch (error) {
      console.error('请求失败:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const last = newMessages.length - 1;
        if (newMessages[last]?.isStreaming) {
          newMessages[last] = { role: 'assistant', content: '❌ 请求失败，请重试。' };
        }
        return newMessages;
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    handleStreamSubmit(query);
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-gray-200 flex-col p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">AI</div>
            <span className="font-semibold text-gray-800">时间规划助手</span>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            退出
          </button>
        </div>

        {/* Tab 导航 */}
        <div className="flex space-x-1 mb-4 border-b border-gray-200 pb-2">
          {[
            { id: 'chat', icon: '💬', label: '对话' },
            { id: 'timegrid', icon: '📅', label: '时间块' },
            { id: 'memo', icon: '📝', label: '备忘录' },
            { id: 'timer', icon: '⏱️', label: '计时器' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1 text-xs font-medium rounded transition ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <TimeLineView refreshTrigger={refreshTrigger} />
        </div>
        <div className="text-xs text-gray-400 border-t border-gray-200 pt-3">
          深度研究 · v1.0
        </div>
      </div>

      {/* 右侧主区域 */}
      <div className="flex-1 flex flex-col max-w-full">
        {activeTab === 'chat' && (
          <>
            {/* 顶部导航 */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="md:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">AI</div>
                <h1 className="font-semibold text-gray-800">深度研究助手</h1>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">在线</span>
              </div>
              <div className="text-xs text-gray-400 hidden sm:block">
                基于 DeepAgents + Tavily
              </div>
              <button
                onClick={onLogout}
                className="md:hidden text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                退出
              </button>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🔬</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700">开始你的研究</h3>
                  <p className="text-gray-400 max-w-sm mt-1">
                    我可以帮你搜索互联网、整理资料、撰写研究报告。
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${msg.role === 'user' ? 'bg-gray-400' : 'bg-blue-600'}`}>
                        {msg.role === 'user' ? '我' : 'AI'}
                      </div>
                      <div
                        className={`px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-1"></span>
                        )}
                        {msg.duration && !msg.isStreaming && (
                          <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                            耗时 {msg.duration} 秒
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 shadow-inner">
              <div className="flex space-x-2 max-w-3xl mx-auto">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="输入你的研究问题..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-xl text-white font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isLoading ? '思考中' : '发送 →'}
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === 'timegrid' && (
          <TimeBlockProvider>
            <div className="flex-1 overflow-hidden">
              <TimeBlockTab />
            </div>
          </TimeBlockProvider>
        )}

        {activeTab === 'memo' && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            📝 备忘录功能开发中...
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            ⏱️ 计时器功能开发中...
          </div>
        )}
      </div>
    </div>
  );
}

export default MainApp;