import React, { useState, useEffect } from 'react';
import { List, Card, Button, Empty, message, Modal } from 'antd';
import { HeartFilled, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { favoriteAPI,houseAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      if (response.data.code === 200) {
        const houseIds = Array.isArray(response.data.info) ? response.data.info : [];
        const houseDetails = await Promise.all(
          houseIds.map(async (houseId) => {
            try {
              const detailResponse = await houseAPI.getHouseDetail(houseId);
              if (detailResponse.data.code === 200) {
                return detailResponse.data.info; // 单条房源详情对象
              }
              return null;
            } catch (error) {
              message.error(`获取房源 ${houseId} 详情失败`);
              return null;
            }
          })
        );
        setFavorites(houseDetails.filter(detail => detail !== null));
      } else {
        message.error(response.data.msg || '获取收藏列表失败');
        setFavorites([]);
      }
    } catch (error) {
      message.error('获取收藏列表失败');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (houseId) => {
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
    <div>
      <Card
        title={
          <div>
            <HeartFilled style={{ color: '#ff4d4f', marginRight: 8 }} />
            我的收藏
          </div>
        }
      >
        {favorites.length === 0 ? (
          <Empty description="暂无收藏的房源" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={favorites}
            loading={loading}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={item.title || '房源'}
                      src={item.imageUrl || 'https://via.placeholder.com/300x200'}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/houses/${item.id}`)} // 使用 id 而非 houseId
                    >
                      查看详情
                    </Button>,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFavorite(item.id)} // 使用 id
                    >
                      取消收藏
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={item.title || '未知房源'}
                    description={
                      <div>
                        <div style={{ color: '#f5222d', fontWeight: 'bold', marginBottom: 8 }}>
                          ¥{(item.price ?? 0).toLocaleString()}
                        </div>
                        <div style={{ color: '#666' }}>
                          {(item.area ?? 0)}㎡ | {item.layout || '未知户型'}
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {item.address || '未知地址'}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Favorites;