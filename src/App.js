import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HouseList from './pages/HouseList';
import HouseDetail from './pages/HouseDetail';
import HouseAnalysis from './pages/HouseAnalysis';
import HouseSearch from './pages/HouseSearch';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import './App.css';

// 路由守卫组件
const PrivateRoute = ({ children }) => {
  // const token = localStorage.getItem('token');
  //开发前端，先暂时注释掉
  // if (!token) {
  //   return <Navigate to="/user/login" replace />;
  // }
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/user/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/houses" element={
          <PrivateRoute>
            <HouseList />
          </PrivateRoute>
        } />
        
        <Route path="/houses/:id" element={
          <PrivateRoute>
            <HouseDetail />
          </PrivateRoute>
        } />
        
        <Route path="/search" element={
          <PrivateRoute>
            <HouseSearch />
          </PrivateRoute>
        } />
        
        <Route path="/analysis" element={
          <PrivateRoute>
            <HouseAnalysis />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        
        <Route path="/favorites" element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
