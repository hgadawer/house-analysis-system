import React, { useState, useEffect } from 'react';
import { Cascader, Spin, message } from 'antd';
import axios from 'axios';

const AreaCascader = ({ value, onChange, ...props }) => {
  const [areaOptions, setAreaOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 将高德地图返回的数据递归格式化为 Cascader 需要的格式
  const formatData = (data) => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      value: item.name, // 使用名称作为值
      label: item.name,
      children: formatData(item.districts)
    }));
  };

  useEffect(() => {
    const fetchAreaOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://restapi.amap.com/v3/config/district', {
          params: {
            keywords: '中国',
            subdistrict: 3,
            key: 'c3c778795daa853cef6f001a9585ce68'
          }
        });
        if (response.data.status === '1'&& response.data.districts.length > 0) {
          const provinces = response.data.districts[0].districts || [];
          const formatted = formatData(provinces);
          setAreaOptions(formatted);
        } else {
          message.error('获取行政区划数据失败');
        }
      } catch (error) {
        message.error('请求行政区划数据失败');
      }
      setLoading(false);
    };

    fetchAreaOptions();
  }, []);

  if (loading) return <Spin />;

  return (
    <Cascader
      options={areaOptions}
      placeholder="请选择省份、城市和区域"
      value={value}
      onChange={(selectedValue, selectedOptions) => {
        if (onChange) {
          onChange(selectedValue);
        }
      }}
      {...props}
    />
  );
};

export default AreaCascader;
