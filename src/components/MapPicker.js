// src/components/MapPicker.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, message } from 'antd';
import AMapLoader from '@amap/amap-jsapi-loader';

const MapPicker = ({ 
  visible,           
  onClose,           
  onPick,            
  defaultPosition,   
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // 在 Modal 打开后初始化地图
  const initializeMap = () => {
    if (!mapRef.current) {
      console.error('Map container is not ready yet');
      return;
    }
    window._AMapSecurityConfig = {
      securityJsCode: '1fe28e7d966cede3327b6df714d9181d',
    };

    AMapLoader.load({
      key: 'f698b513de16a7c5663084a015dc10f3',
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Geocoder'],
    })
      .then((AMap) => {
        if (defaultPosition && defaultPosition.province) {
          const geocoder = new AMap.Geocoder({ city: '全国' });
          const addressStr = defaultPosition.province + defaultPosition.city + defaultPosition.district;
          geocoder.getLocation(addressStr, (status, result) => {
            if (status === 'complete' && result.geocodes.length) {
              const { location } = result.geocodes[0];
              console.log('Geocode result:', result);
              initMap(AMap, location.lng, location.lat);
            } else {
              message.warning('根据省市区无法定位到具体位置，使用默认位置。');
              initMap(AMap, 116.397428, 39.90923);
            }
          });
        } else {
          const center = Array.isArray(defaultPosition) && defaultPosition.length === 2 
            ? defaultPosition 
            : [116.397428, 39.90923];
          initMap(AMap, center[0], center[1]);
        }
      })
      .catch((e) => {
        message.error('地图初始化失败：' + e.message);
      });
  };

  useEffect(() => {
    console.log('visible:', visible);

    if (!visible && map) {
      map.destroy(); // 销毁地图实例
      setMap(null);
      setMarker(null);
    }

    // 注意：这里不再直接初始化地图，而是交给 Modal 的 afterOpenChange
  }, [visible, defaultPosition]);

  function initMap(AMap, lng, lat) {
    if (!mapRef.current) {
      console.error('Map container is not available during initMap');
      return;
    }

    const mapInstance = new AMap.Map(mapRef.current, {
      resizeEnable: true,
      center: [lng, lat],
      zoom: 11,
    });
    setMap(mapInstance);

    const markerInstance = new AMap.Marker({
      position: [lng, lat],
      draggable: true,
      map: mapInstance,
    });
    setMarker(markerInstance);

    mapInstance.on('click', (e) => {
      const newPosition = [e.lnglat.lng, e.lnglat.lat];
      markerInstance.setPosition(newPosition);
      console.log('New position:', newPosition);
    });
  }

  const handleOk = () => {
    if (marker) {
      const position = marker.getPosition();
      onPick({
        longitude: position.lng,
        latitude: position.lat,
      });
    }
    onClose();
  };

  // 处理 Modal 的打开和关闭
  const handleAfterOpenChange = (open) => {
    if (open) {
      initializeMap(); // Modal 完全打开后初始化地图
    }
  };

  return (
    <Modal
      visible={visible}
      title="请选择房源位置"
      onOk={handleOk}
      onCancel={onClose}
      // destroyOnClose // 关闭时销毁 Modal 内容
      afterOpenChange={handleAfterOpenChange} // 在 Modal 打开/关闭后触发
      width={800}
    >
      <div
        ref={mapRef}
        style={{ width: '100%', height: '600px' }}
      />
    </Modal>
  );
};

export default MapPicker;