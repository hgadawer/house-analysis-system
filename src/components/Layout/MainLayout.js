import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BarChartOutlined,
  UserOutlined,
  HeartOutlined,
  SearchOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/houses',
      icon: <BarChartOutlined />,
      label: '房源列表',
    },
    {
      key: '/analysis',
      icon: <BarChartOutlined />,
      label: '房源分析',
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: '房源搜索',
    },
    {
      key: '/favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/user/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Menu mode="horizontal" selectedKeys={[]}>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出登录
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 