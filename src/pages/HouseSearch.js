import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Row,
  Col,
  List,
  Space,
  Tag,
  Slider,
  Divider,
  Empty,
  message,
} from 'antd';
import {
  SearchOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { houseAPI, favoriteAPI } from '../services/api';
import AreaCascader from '../services/AreaCascader';  // 引入高德地图行政区划组件

const { Option } = Select;

const HouseSearch = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [favorites, setFavorites] = useState(new Set());

  // 获取收藏列表
  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      setFavorites(new Set(response.data.map(item => item.houseId)));
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // 搜索房源
  const handleSearch = async (values) => {
    setLoading(true);
    try {
      const params = {
        ...values,
        page: currentPage,
        size: pageSize,
        minPrice: values.priceRange?.[0],
        maxPrice: values.priceRange?.[1],
        minArea: values.areaRange?.[0],
        maxArea: values.areaRange?.[1],
      };

      // 如果选择了区域，则将三级行政区划全部传递给后端
      if (values.location && values.location.length === 3) {
        params.province = values.location[0];
        params.city = values.location[1];
        params.district = values.location[2];
      }

      const response = await houseAPI.getHouseList(params);
      setHouses(response.data.content);
      setTotal(response.data.total);
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理收藏/取消收藏
  const handleFavorite = async (houseId) => {
    try {
      if (favorites.has(houseId)) {
        await favoriteAPI.removeFavorite(houseId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(houseId);
          return next;
        });
        message.success('取消收藏成功');
      } else {
        await favoriteAPI.addFavorite(houseId);
        setFavorites(prev => new Set(prev).add(houseId));
        message.success('收藏成功');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 重置表单
  const handleReset = () => {
    
    form.resetFields();
    handleSearch({});
  };

  return (
    <div>
      <Card>
        <Form
          form={form}
          onFinish={handleSearch}
          initialValues={{
            priceRange: [0, 1000000],
            areaRange: [0, 500],
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="keyword">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="输入关键词搜索"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              {/* 使用高德地图API获取的行政区划组件 */}
              <Form.Item name="location" label="选择区域">
                <AreaCascader allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="layout">
                <Select placeholder="选择户型" allowClear>
                  <Option value="1室1厅">1室1厅</Option>
                  <Option value="2室1厅">2室1厅</Option>
                  <Option value="2室2厅">2室2厅</Option>
                  <Option value="3室1厅">3室1厅</Option>
                  <Option value="3室2厅">3室2厅</Option>
                  <Option value="4室2厅">4室2厅</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="价格范围" name="priceRange">
                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={1000}
                  tipFormatter={value => `¥${value.toLocaleString()}`}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="面积范围" name="areaRange">
                <Slider
                  range
                  min={0}
                  max={500}
                  step={5}
                  tipFormatter={value => `${value}㎡`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={houses}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              handleSearch(form.getFieldsValue());
            },
          }}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.title}
                    src={item.imageUrl || 'https://via.placeholder.com/300x200'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Button
                    type="text"
                    icon={
                      favorites.has(item.id) ? (
                        <HeartFilled style={{ color: '#ff4d4f' }} />
                      ) : (
                        <HeartOutlined />
                      )
                    }
                    onClick={() => handleFavorite(item.id)}
                  >
                    {favorites.has(item.id) ? '已收藏' : '收藏'}
                  </Button>,
                  <Button type="text" onClick={() => navigate(`/houses/${item.id}`)}>
                    查看详情
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <Space>
                      {item.title}
                      <Tag color={
                        item.status === 'available' ? 'green' :
                        item.status === 'reserved' ? 'orange' : 'red'
                      }>
                        {item.status === 'available' ? '可售' :
                         item.status === 'reserved' ? '已预订' : '已售出'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Space>
                        <DollarOutlined style={{ color: '#ff4d4f' }} />
                        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                          ¥{item.price.toLocaleString()}
                        </span>
                      </Space>
                      <Space>
                        <HomeOutlined />
                        <span>{item.layout} | {item.area}㎡</span>
                      </Space>
                      <Space>
                        <EnvironmentOutlined />
                        <span>{item.address}</span>
                      </Space>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="暂无符合条件的房源" />
          }}
        />
      </Card>
    </div>
  );
};

export default HouseSearch;
