import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { houseAPI } from '../services/api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const HouseAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([moment().subtract(6, 'months'), moment()]);
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedLayout, setSelectedLayout] = useState('all');
  const [analysisData, setAnalysisData] = useState({
    priceData: [],
    areaData: [],
    districtData: [],
    layoutData: [],
    trendData: {
      dates: [],
      prices: [],
      counts: []
    }
  });

  useEffect(() => {
    fetchAnalysisData();
  }, [dateRange, selectedDistrict, selectedLayout]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const response = await houseAPI.getHouseAnalysis({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        district: selectedDistrict,
        layout: selectedLayout
      });
      setAnalysisData(response.data);
    } catch (error) {
      console.error('获取分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 价格趋势图配置
  const priceTrendOption = {
    title: {
      text: '房价走势分析'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['平均价格', '房源数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: analysisData.trendData.dates,
        axisLabel: {
          rotate: 30
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '价格（元/㎡）',
        position: 'left'
      },
      {
        type: 'value',
        name: '数量（套）',
        position: 'right'
      }
    ],
    series: [
      {
        name: '平均价格',
        type: 'line',
        smooth: true,
        data: analysisData.trendData.prices,
        itemStyle: {
          color: '#ff4d4f'
        }
      },
      {
        name: '房源数量',
        type: 'bar',
        yAxisIndex: 1,
        data: analysisData.trendData.counts,
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  };

  // 区域分布图配置
  const districtDistributionOption = {
    title: {
      text: '区域房源分布'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}套 ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}套\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        data: analysisData.districtData
      }
    ]
  };

  // 户型分布图配置
  const layoutDistributionOption = {
    title: {
      text: '户型分布分析'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: analysisData.layoutData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '数量（套）'
    },
    series: [
      {
        type: 'bar',
        data: analysisData.layoutData.map(item => ({
          value: item.value,
          itemStyle: {
            color: '#2f54eb'
          }
        })),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  };

  // 面积分布图配置
  const areaDistributionOption = {
    title: {
      text: '面积分布分析'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['0-50㎡', '50-80㎡', '80-120㎡', '120-160㎡', '160-200㎡', '200㎡以上'],
      axisLabel: {
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '数量（套）'
    },
    series: [
      {
        type: 'bar',
        data: analysisData.areaData,
        itemStyle: {
          color: '#13c2c2'
        },
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  };

  return (
    <div>
      <Card title="分析条件" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Select
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              style={{ width: '100%' }}
              placeholder="选择区域"
            >
              <Option value="all">全部区域</Option>
              {analysisData.districtData.map(item => (
                <Option key={item.name} value={item.name}>{item.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              value={selectedLayout}
              onChange={setSelectedLayout}
              style={{ width: '100%' }}
              placeholder="选择户型"
            >
              <Option value="all">全部户型</Option>
              {analysisData.layoutData.map(item => (
                <Option key={item.name} value={item.name}>{item.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <ReactECharts option={priceTrendOption} style={{ height: '400px' }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <ReactECharts option={districtDistributionOption} style={{ height: '400px' }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <ReactECharts option={layoutDistributionOption} style={{ height: '400px' }} />
            </Card>
          </Col>
          <Col span={24}>
            <Card>
              <ReactECharts option={areaDistributionOption} style={{ height: '400px' }} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default HouseAnalysis; 