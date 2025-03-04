import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, InputNumber, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined ,EnvironmentOutlined} from '@ant-design/icons';
import { houseAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AreaCascader from '../services/AreaCascader';
// 引入我们封装的MapPicker
import MapPicker from '../components/MapPicker';
const { Option } = Select;

const HouseList = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);        // 控制MapPicker可见性
  const [editingHouse, setEditingHouse] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // 用来给 MapPicker 传的默认中心点
  const [mapDefaultPosition, setMapDefaultPosition] = useState(null);
  useEffect(() => {
    fetchHouses();
  }, [currentPage, pageSize, searchText]);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const response = await houseAPI.getHouseList({
        page: currentPage,
        size: pageSize,
        search: searchText,
      });
      setHouses(response.data.content);
      setTotal(response.data.page.totalElements);
    } catch (error) {
      message.error('获取房源列表失败');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingHouse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingHouse(record);
    // 将数据库中的 province、city、district 拼成数组传给 Cascader
    form.setFieldsValue({
      ...record,
      location: [record.province, record.city, record.district],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await houseAPI.deleteHouse(id);
      message.success('删除成功');
      fetchHouses();
    } catch (error) {
      message.error('删除失败');
    }
  };

    // “新增房源” or “编辑房源”的Modal点击“确定”时
    const handleModalOk = async () => {
      try {
        const values = await form.validateFields();
        // 将 location(省市区) 拆分后替换
        if (values.location) {
          const [province, city, district] = values.location;
          values.province = province;
          values.city = city;
          values.district = district;
        }
        delete values.location;
  
        if (editingHouse) {
          // 编辑房源
          await houseAPI.updateHouse(editingHouse.id, values);
          message.success('更新成功');
        } else {
          // 新增房源
          await houseAPI.createHouse(values);
          message.success('创建成功');
        }
        setIsModalVisible(false);
        fetchHouses();
      } catch (error) {
        message.error('操作失败');
      }
    };
      // 点击“地图选点”按钮
  const handleOpenMap = () => {
    // 先从表单拿到当前填写的省市区或经纬度
    const values = form.getFieldsValue();

    if (values.longitude && values.latitude) {
      // 如果已有经纬度，直接用
      setMapDefaultPosition([values.longitude, values.latitude]);
    } else if (values.location && values.location.length === 3) {
      console.log(values.location[0])
      // 如果没经纬度，但有省市区，就把它当对象传过去
      // 让 MapPicker 里做地理编码
      setMapDefaultPosition({
        province: values.location[0],
        city: values.location[1],
        district: values.location[2],
      });
    } else {
      // 都没有，就给一个默认坐标（例如天安门）
      setMapDefaultPosition([116.397428, 39.90923]);
    }

    // 打开地图弹窗
    setShowMap(true);
  };
  // 当MapPicker用户选好了点后执行
  const handlePickLocation = ({ longitude, latitude }) => {
    // 把选中的经纬度回填进表单
    form.setFieldsValue({
      longitude,
      latitude,
    });
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/houses/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price.toLocaleString()}`,
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      render: (area) => `${area}㎡`,
    },
    {
      title: '户型',
      dataIndex: 'layout',
      key: 'layout',
    },
    {
      title: '所在区域',
      dataIndex: 'district',
      key: 'district',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Select value={status} style={{ width: 100 }} disabled>
          <Option value="available">可售</Option>
          <Option value="reserved">已预订</Option>
          <Option value="sold">已售出</Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加房源
          </Button>
          <Input
            placeholder="搜索房源"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={houses}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title={editingHouse ? '编辑房源' : '添加房源'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form}  layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\¥\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="area"
            label="面积"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}㎡`}
              parser={(value) => value.replace('㎡', '')}
            />
          </Form.Item>
          <Form.Item
            name="layout"
            label="户型"
            rules={[{ required: true, message: '请选择户型' }]}
          >
            <Select>
              <Option value="1室1厅">1室1厅</Option>
              <Option value="2室1厅">2室1厅</Option>
              <Option value="2室2厅">2室2厅</Option>
              <Option value="3室1厅">3室1厅</Option>
              <Option value="3室2厅">3室2厅</Option>
              <Option value="4室2厅">4室2厅</Option>
            </Select>
          </Form.Item>
          {/* 使用 AreaCascader 实现省市区联级选择 */}
          <Form.Item
            name="location"
            label="所在地区"
            rules={[{ required: true, message: '请选择所在地区' }]}
          >
            <AreaCascader />
          </Form.Item>
          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="latitude"
            label="纬度"
            rules={[{ required: true, message: '请输入纬度' }]}
          >
            <InputNumber style={{ width: '100%' }} step={0.000001} />
          </Form.Item>
          <Form.Item
            name="longitude"
            label="经度"
            rules={[{ required: true, message: '请输入经度' }]}
          >
            <InputNumber style={{ width: '100%' }} step={0.000001} />
          </Form.Item>
          {/* “地图选点”按钮 */}
          <Button 
            icon={<EnvironmentOutlined />}
            onClick={handleOpenMap}
          >
            地图选点
          </Button>


          <Form.Item name="image_url" label="房源图片URL">
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="available">可售</Option>
              <Option value="reserved">已预订</Option>
              <Option value="sold">已售出</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 地图选点组件弹窗 */}
      <MapPicker
        visible={showMap}
        onClose={() => setShowMap(false)}
        // 如果是编辑房源，就让地图初始在该房源的经纬度，否则默认天安门
        defaultPosition={mapDefaultPosition} // 这里会是 [lng, lat] 或 { province, city, district }
        onPick={handlePickLocation}
      />
    </div>
  );
};

export default HouseList;
