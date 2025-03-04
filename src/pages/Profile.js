import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  message,
  List,
  Avatar,
  Space,
  Modal,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HeartOutlined,
  HistoryOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { userAPI, favoriteAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
    fetchFavorites();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.getUserInfo();
      if (response.data.code === 200) {
        setUserInfo(response.data.info);
        form.setFieldsValue(response.data.info);
      } else {
        message.error(response.data.msg || '获取用户信息失败');
      }
    } catch (error) {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      if (response.data.code === 200) {
        setFavorites(response.data.info); //  info 是收藏列表数据
      } else {
        message.error(response.data.msg || '获取收藏列表失败');
      }
    } catch (error) {
      message.error('获取收藏列表失败');
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      const response = await userAPI.updateUserInfo(values);
      if (response.data.code === 200) {
        message.success(response.data.msg || '个人信息更新成功');
        fetchUserInfo();
      } else {
        message.error(response.data.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleChangePassword = async (values) => {
    try {
      const response = await userAPI.changePassword(values);
      if (response.data.code === 200) {
        message.success(response.data.msg || '密码修改成功，请重新登录');
        localStorage.removeItem('token');
        navigate('/user/login');
      } else {
        message.error(response.data.msg || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败');
    }
  };

  const handleRemoveFavorite = async (houseId) => {
    Modal.confirm({
      title: '确认取消收藏？',
      content: '取消收藏后可以重新收藏',
      onOk: async () => {
        try {
          const response = await favoriteAPI.removeFavorite(houseId);
          if (response.data.code === 200) {
            message.success(response.data.msg || '取消收藏成功');
            fetchFavorites();
          } else {
            message.error(response.data.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  return (
    <Card>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              个人信息
            </span>
          }
          key="1"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateProfile}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                更新信息
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <LockOutlined />
              修改密码
            </span>
          }
          key="2"
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HeartOutlined />
              我的收藏
            </span>
          }
          key="3"
        >
          <List
            itemLayout="horizontal"
            dataSource={favorites}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    onClick={() => navigate(`/houses/${item.houseId}`)}
                  >
                    查看详情
                  </Button>,
                  <Button
                    type="link"
                    danger
                    onClick={() => handleRemoveFavorite(item.houseId)}
                  >
                    取消收藏
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<HomeOutlined />} />}
                  title={item.title}
                  description={
                    <Space>
                      <span>{item.area}㎡</span>
                      <span>|</span>
                      <span>¥{item.price.toLocaleString()}</span>
                      <span>|</span>
                      <span>{item.layout}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              浏览历史
            </span>
          }
          key="4"
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            浏览历史功能开发中...
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default Profile;