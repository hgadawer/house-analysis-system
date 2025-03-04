import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  Form,
  Input,
  Rate,
  List,
  Avatar,
  message,
  Typography
} from 'antd';
import {
  DollarOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  ArrowLeftOutlined,
  UserOutlined
} from '@ant-design/icons';
import AMapLoader from '@amap/amap-jsapi-loader';  // 与 MapPicker 中相同
import { houseAPI, commentAPI, favoriteAPI } from '../services/api';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 小地图展示组件，只读显示一个Marker
 * @param {number} props.latitude  房源纬度
 * @param {number} props.longitude 房源经度
 */
function HouseLocationMap({ latitude, longitude }) {
  const mapRef = useRef(null); // div容器引用
  const [map, setMap] = useState(null);

  useEffect(() => {
    // 组件挂载后初始化地图
    if (!mapRef.current || latitude == null || longitude == null) {
      return;
    }

    // 设置高德安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: '1fe28e7d966cede3327b6df714d9181d',
    };

    // 加载高德地图
    AMapLoader.load({
      key: 'f698b513de16a7c5663084a015dc10f3', // 和项目中的 MapPicker 一致
      version: '2.0',
      plugins: ['AMap.Marker']
    })
      .then((AMap) => {
        // 初始化地图
        const mapInstance = new AMap.Map(mapRef.current, {
          resizeEnable: true,
          center: [longitude, latitude],
          zoom: 15, // 可以根据需要设置 zoom
        });
        setMap(mapInstance);

        // 放置一个 Marker
        new AMap.Marker({
          position: [longitude, latitude],
          map: mapInstance,
          draggable: false, // 只读，不允许拖动
        });
      })
      .catch((e) => {
        message.error('地图初始化失败：' + e.message);
      });

    // 卸载时，销毁地图实例
    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '300px' }}
    />
  );
}

const HouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchHouseDetail();
    fetchComments();
    checkFavoriteStatus();
  }, [id]);

  const fetchHouseDetail = async () => {
    try {
      const response = await houseAPI.getHouseDetail(id);
      setHouse(response.data.info);
    } catch (error) {
      message.error('获取房源详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getComments(id);
      setComments(response.data.info);
    } catch (error) {
      message.error('获取评论失败');
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      setIsFavorite(response.data.some(fav => fav.houseId === id));
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteAPI.removeFavorite(id);
        message.success('取消收藏成功');
      } else {
        await favoriteAPI.addFavorite(id);
        message.success('收藏成功');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleComment = async (values) => {
    try {
      await commentAPI.addComment(id, values);
      message.success('评论成功');
      form.resetFields();
      fetchComments();
    } catch (error) {
      message.error('评论失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!house) {
    return <div>房源不存在</div>;
  }

   // 删除评论
   const handleDeleteComment = async (commentId) => {
    try {
      // 调用你在 api.js 中写好的接口函数
      await commentAPI.deleteComment(id, commentId);
      message.success('删除成功');
      // 再次刷新评论列表
      fetchComments();
    } catch (error) {
      // 如果后端返回 403 或其他错误信息，你可以在这里给用户提示
      message.error(error.response?.data?.msg || '删除失败');
    }
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card
        title={house.title}
        extra={
          <Button
            type={isFavorite ? 'primary' : 'default'}
            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
            onClick={handleFavorite}
          >
            {isFavorite ? '已收藏' : '收藏'}
          </Button>
        }
      >
        {/* 房源图片展示 */}
        {house.image_url && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img
              src={`http://localhost:8080/${house.image_url}`}
              alt={house.title}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}

        <Descriptions bordered column={2}>
          <Descriptions.Item label="价格">
            <Tag color="red" icon={<DollarOutlined />}>
              ¥{Number(house.price).toLocaleString()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="面积">
            <Tag color="blue" icon={<HomeOutlined />}>
              {house.area}㎡
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="户型">{house.layout}</Descriptions.Item>
          <Descriptions.Item label="地址">
            <Space>
              <EnvironmentOutlined />
              {`${house.province} ${house.city} ${house.district} ${house.address}`}
            </Space>
          </Descriptions.Item>
          {/* 这里删除了显示经纬度的内容 */}
          <Descriptions.Item label="状态">
            <Tag
              color={
                house.status === 'available'
                  ? 'green'
                  : house.status === 'reserved'
                  ? 'orange'
                  : 'red'
              }
            >
              {house.status === 'available'
                ? '可售'
                : house.status === 'reserved'
                ? '已预订'
                : '已售出'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="描述">{house.description}</Descriptions.Item>
          <Descriptions.Item label="浏览次数">{house.views_count}</Descriptions.Item>
          <Descriptions.Item label="收藏次数">{house.favorites_count}</Descriptions.Item>
          <Descriptions.Item label="平均评分">
            {house.avg_rating ? house.avg_rating : '暂无'}
          </Descriptions.Item>
        </Descriptions>

        {/* 地图显示房源位置 */}
        <Divider orientation="left">房源位置</Divider>
        <HouseLocationMap
          latitude={house.latitude}
          longitude={house.longitude}
        />

        <Divider orientation="left">房源评价</Divider>

        <Form form={form} onFinish={handleComment}>
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="content"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea rows={4} placeholder="请输入您的评价" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交评价
            </Button>
          </Form.Item>
        </Form>

        <List
          className="comment-list"
          header={`${comments.length} 条评论`}
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={item => (
            <List.Item 
              key={item.id} 
              actions={[
              <Button danger onClick={() => handleDeleteComment(item.id)}>
                删除评论
              </Button>,
            ]}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text strong>{item.username}</Text>
                    <Rate disabled defaultValue={item.rating} />
                  </Space>
                }
                description={
                  <div>
                    <div>{item.content}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {item.createTime}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default HouseDetail;
