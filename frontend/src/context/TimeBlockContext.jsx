import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1/timeblocks';

const TimeBlockContext = createContext();

export const TimeBlockProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null); // 新增：选中的时间块

  const getToken = () => localStorage.getItem('access_token');

  const fetchBlocks = async (date) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: { date, token }
      });
      setBlocks(response.data);
    } catch (error) {
      console.error('获取时间块失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const dateStr = currentDate.toISOString().split('T')[0];
    fetchBlocks(dateStr);
  }, [currentDate]);

  const addBlock = async (newBlock) => {
    const token = getToken();
    try {
      const response = await axios.post(API_URL, newBlock, {
        params: { token }
      });
      setBlocks(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('添加失败:', error);
      throw error;
    }
  };

  const updateBlock = async (id, updates) => {
    const token = getToken();
    try {
      const response = await axios.put(`${API_URL}/${id}`, updates, {
        params: { token }
      });
      setBlocks(prev => prev.map(b => b.id === id ? response.data : b));
      // 如果选中的块被更新，同步更新选中状态
      if (selectedBlock && selectedBlock.id === id) {
        setSelectedBlock(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('更新失败:', error);
      throw error;
    }
  };

  const deleteBlock = async (id) => {
    const token = getToken();
    try {
      await axios.delete(`${API_URL}/${id}`, {
        params: { token }
      });
      setBlocks(prev => prev.filter(b => b.id !== id));
      if (selectedBlock && selectedBlock.id === id) {
        setSelectedBlock(null);
      }
    } catch (error) {
      console.error('删除失败:', error);
      throw error;
    }
  };

  const goToDate = (date) => {
    setCurrentDate(date);
    setSelectedBlock(null); // 切换日期时清空选中
  };

  const selectBlock = (block) => {
    setSelectedBlock(block);
  };

  // 唯一的 value 对象
  const value = {
    blocks,
    currentDate,
    loading,
    selectedBlock,
    fetchBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    goToDate,
    selectBlock,
  };

  return (
    <TimeBlockContext.Provider value={value}>
      {children}
    </TimeBlockContext.Provider>
  );
};

export const useTimeBlocks = () => useContext(TimeBlockContext);