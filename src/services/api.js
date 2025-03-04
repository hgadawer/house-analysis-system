import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
}
});

// 请求拦截器
api.interceptors.request.use(
  (request) => {
      const token = localStorage.getItem('token');
      if(token){
      request.headers['Authorization'] = 'Bearer '+ token;
      }
      console.log(request.headers);
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log(error)
      localStorage.removeItem('token');
      window.location.href = '/user/login';
    }
    return Promise.reject(error);
  }
);

// 房源相关接口
export const houseAPI = {
  // 获取房源列表
  getHouseList: (params) => api.get('/houses', { params }),
  // 获取房源详情
  getHouseDetail: (id) => api.get(`/houses/${id}`),
  // 创建房源
  createHouse: (data) => api.post('/houses', data),
  // 更新房源
  updateHouse: (id, data) => api.put(`/houses/${id}`, data),
  // 删除房源
  deleteHouse: (id) => api.delete(`/houses/${id}`),
  // 获取房源分析数据
  getHouseAnalysis: () => api.get('/houses/analysis'),
};

// 用户相关接口
export const userAPI = {
  // 用户注册
  register: (data) => api.post('/users/register', data),
  // 获取用户信息
  getUserInfo: () => api.get('/users/profile'),
  // 更新用户信息
  updateUserInfo: (data) => api.put('/users/profile', data),
  // 修改密码
  changePassword: (data) => api.put('/users/password', data),
};

// 收藏相关接口
export const favoriteAPI = {
  // 获取收藏列表
  getFavorites: () => api.get('/favorites'),
  // 添加收藏
  addFavorite: (houseId) => api.post(`/favorites/${houseId}`),
  // 取消收藏
  removeFavorite: (houseId) => api.delete(`/favorites/${houseId}`),
};

// 评论相关接口
export const commentAPI = {
  // 获取房源评论
  getComments: (houseId) => api.get(`/houses/${houseId}/comments`),
  // 添加评论
  addComment: (houseId, data) => api.post(`/houses/${houseId}/comments`, data),
  // 删除评论
  //后续加权限，只有管理员能删除评论
  deleteComment: (houseId, commentId) => api.delete(`/houses/${houseId}/comments/${commentId}`),
};

export default api; 