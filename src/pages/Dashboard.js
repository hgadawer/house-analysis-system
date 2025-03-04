import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, List } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { houseAPI } from '../services/api';

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentHouses, setRecentHouses] = useState([]);
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await houseAPI.getHouseAnalysis();
      const { statistics, recentHouses, priceData } = response.data;
      setStatistics(statistics);
      setRecentHouses(recentHouses||[]);//防止undifind
      setPriceData(priceData||[]);//防止undifind
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    }
  };

  const priceChartOption = {
    title: {
      text: '房价走势分析'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: priceData.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '价格 (元/㎡)'
    },
    series: [{
      data: priceData.map(item => item.price),
      type: 'line',
      smooth: true
    }]
  };

  const recentColumns = [
    {
      title: '房源标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price.toLocaleString()}`
    },
    {
      title: '面积',
      dataIndex: 'area',
      key: 'area',
      render: (area) => `${area}㎡`
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总房源数"
              value={statistics?.totalHouses}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月新增"
              value={statistics?.monthlyNew}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={statistics?.averagePrice}
              precision={2}
              prefix="¥"
              suffix="/㎡"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="价格趋势"
              value={statistics?.priceChange}
              precision={2}
              valueStyle={{ color: statistics?.priceChange >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={statistics?.priceChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={16}>
          <Card title="房价走势">
            <ReactECharts option={priceChartOption} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最新房源">
            <List
              dataSource={recentHouses}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`${item.area}㎡ | ¥${item.price.toLocaleString()}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="最近发布">
            <Table
              columns={recentColumns}
              dataSource={recentHouses}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 