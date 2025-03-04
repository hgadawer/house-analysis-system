import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      // let formData = new FormData();
      const params={
        'username': values.username,
        'password': values.password
      }
      const response = await axios.post('http://localhost:8080/user/login', params);
      // console.log(response.data);
      if (response.data.code === 200) {
        localStorage.setItem('token', response.data.info);
        console.log('Token stored:', localStorage.getItem('token'));
        message.success('登录成功！');
        navigate('/houses');
      } else {
        message.error(response.data.msg || '登录失败');
      }
    } catch (error) {
      message.error('登录失败：' + (error.response?.data?.message || '服务器错误'));
    }
  };

  const [form] = Form.useForm();

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card title="房源信息分析系统" style={{ width: 400 }}>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button type="link" onClick={() => navigate('/register')} style={{ padding: 0 }}>
              还没有账号？立即注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 