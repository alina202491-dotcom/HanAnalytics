<template>
  <Card class="box-border flex flex-col w-full h-[600px] overflow-hidden">
    <CardHeader>
      <CardTitle>访客地理分布</CardTitle>
    </CardHeader>
    <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
      <div class="relative w-full h-full min-h-[500px]">
        <div ref="mapContainer" class="w-full h-full"></div>
        <!-- 地图控制按钮 -->
        <div class="absolute top-4 right-4 flex gap-2 z-10">
          <button 
            @click="resetView" 
            class="px-3 py-2 text-xs bg-slate-800/90 hover:bg-indigo-600/80 text-white border border-slate-600 rounded-md transition-all duration-200 backdrop-blur-sm"
            title="重置视图"
          >
            重置
          </button>
          <button 
            @click="toggleStyle" 
            class="px-3 py-2 text-xs bg-slate-800/90 hover:bg-indigo-600/80 text-white border border-slate-600 rounded-md transition-all duration-200 backdrop-blur-sm"
            title="切换样式"
          >
            {{ isDarkStyle ? '明亮' : '深色' }}
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw, watch } from 'vue'
import * as echarts from 'echarts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStandardEnglishName } from '@/utils/countryMapping'

// Props
interface Props {
  data?: Array<{
    name: string
    value: number
    code?: string
  }>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false
})

// Refs
const mapContainer = ref<HTMLElement>()
let mapChart: echarts.ECharts | null = null
const isDarkStyle = ref(true)

// 世界地图数据
const worldMapData = {
  type: 'FeatureCollection',
  features: [
    // 这里会包含世界各国的地理数据
    // 为了简化，我们使用内置的world地图
  ]
}

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return

  // 销毁已存在的图表
  if (mapChart) {
    mapChart.dispose()
  }

  // 注册世界地图
  try {
    // 尝试获取世界地图数据
    const worldMapGeoJson = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .catch(async () => {
        // 备用地图数据源
        return await fetch('https://geojson.xyz/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
          .then(res => res.json())
          .catch(() => null)
      })
    
    if (worldMapGeoJson) {
      echarts.registerMap('world', worldMapGeoJson)
    }
  } catch (error) {
    console.warn('Failed to load world map data, using built-in map')
  }

  // 创建图表实例
  mapChart = markRaw(echarts.init(mapContainer.value, null, { 
    renderer: 'canvas',
    useDirtyRect: true 
  }))

  // 配置选项
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(99, 102, 241, 0.8)',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: {
        color: '#f8fafc',
        fontSize: 12
      },
      formatter: (params: any) => {
        if (params.data && params.data.value > 0) {
          const displayName = params.data.originalName || params.data.name || params.name
          return `<div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${displayName}</div>
            <div style="color: #a5b4fc;">访客数: <span style="color: #6366f1; font-weight: 600;">${params.data.value}</span></div>
          </div>`
        }
        return `<div style="padding: 4px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
          <div style="color: #a5b4fc;">访客数: <span style="color: #64748b; font-weight: 600;">0</span></div>
        </div>`
      }
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: Math.max(...(props.data?.map(item => item.value) || [100])),
      left: 20,
      bottom: 30,
      text: ['高', '低'],
      textStyle: {
        color: '#94a3b8',
        fontSize: 12
      },
      inRange: {
        color: [
          'rgba(99, 102, 241, 0.1)',
          'rgba(99, 102, 241, 0.3)', 
          'rgba(99, 102, 241, 0.5)', 
          'rgba(99, 102, 241, 0.7)', 
          'rgba(99, 102, 241, 0.9)', 
          'rgba(99, 102, 241, 1)'
        ]
      },
      calculable: true,
      orient: 'vertical',
      itemWidth: 20,
      itemHeight: 120,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderRadius: 6,
      padding: [10, 8]
    },
    geo: {
      map: 'world',
      roam: true, // 开启缩放和平移
      zoom: 1.2,
      center: [0, 10],
      label: {
        show: false,
        color: '#f8fafc',
        fontSize: 10
      },
      itemStyle: {
        areaColor: '#1e293b',
        borderColor: '#475569',
        borderWidth: 0.5,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10
      },
      emphasis: {
        label: {
          show: true,
          color: '#f8fafc',
          fontSize: 12,
          fontWeight: 'bold'
        },
        itemStyle: {
          areaColor: 'rgba(99, 102, 241, 0.3)',
          borderColor: '#6366f1',
          borderWidth: 1.5,
          shadowColor: 'rgba(99, 102, 241, 0.5)',
          shadowBlur: 15
        }
      },
      scaleLimit: {
        min: 0.8,
        max: 8
      }
    },
    series: [
      {
        name: '访客分布',
        type: 'map',
        geoIndex: 0,
        data: props.data?.map(item => ({
          name: getStandardEnglishName(item.name),
          value: item.value,
          code: item.code,
          originalName: item.name
        })) || [],
        tooltip: {
          show: true
        }
      }
    ],
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicInOut' as any
  }

  // 设置配置
  mapChart.setOption(option)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  if (mapChart) {
    mapChart.resize()
  }
}

// 更新地图数据
const updateMapData = () => {
  if (!mapChart || !props.data) return

  const option = mapChart.getOption() as any
  
  // 更新数据
  if (option.series && option.series[0]) {
    option.series[0].data = props.data.map(item => ({
      name: getStandardEnglishName(item.name),
      value: item.value,
      code: item.code,
      originalName: item.name
    }))
  }

  // 更新visualMap的最大值
  if (option.visualMap && option.visualMap[0]) {
    option.visualMap[0].max = Math.max(...props.data.map(item => item.value), 100)
  }

  mapChart.setOption(option)
}

// 重置视图
const resetView = () => {
  if (mapChart) {
    mapChart.dispatchAction({
      type: 'restore'
    })
    // 重置到初始视图
    const option = mapChart.getOption() as any
    if (option.geo && option.geo[0]) {
      option.geo[0].zoom = 1.2
      option.geo[0].center = [0, 10]
      mapChart.setOption(option)
    }
  }
}

// 切换样式
const toggleStyle = () => {
  isDarkStyle.value = !isDarkStyle.value
  if (mapChart) {
    const option = mapChart.getOption() as any
    if (option.geo && option.geo[0] && option.visualMap && option.visualMap[0]) {
      if (isDarkStyle.value) {
        // 深色主题
        option.geo[0].itemStyle.areaColor = '#1e293b'
        option.geo[0].itemStyle.borderColor = '#475569'
        option.visualMap[0].backgroundColor = 'rgba(15, 23, 42, 0.8)'
        option.visualMap[0].textStyle.color = '#94a3b8'
      } else {
        // 明亮主题
        option.geo[0].itemStyle.areaColor = '#f1f5f9'
        option.geo[0].itemStyle.borderColor = '#cbd5e1'
        option.visualMap[0].backgroundColor = 'rgba(248, 250, 252, 0.9)'
        option.visualMap[0].textStyle.color = '#475569'
      }
      mapChart.setOption(option)
    }
  }
}

// 监听数据变化
watch(() => props.data, updateMapData, { deep: true })
watch(() => props.loading, (loading) => {
  if (mapChart) {
    if (loading) {
      mapChart.showLoading({
        text: '加载中...',
        color: '#4F46E5',
        textColor: '#fff',
        maskColor: 'rgba(0, 0, 0, 0.8)',
        zlevel: 0
      })
    } else {
      mapChart.hideLoading()
    }
  }
})

// 生命周期
onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (mapChart) {
    window.removeEventListener('resize', handleResize)
    mapChart.dispose()
    mapChart = null
  }
})
</script>

<style scoped>
:deep(.card) {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

:deep(.card:hover) {
  border-color: #475569;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

:deep(.card-header) {
  border-bottom: 1px solid #334155;
  background: rgba(15, 23, 42, 0.5);
}

:deep(.card-title) {
  color: #f8fafc;
  font-weight: 600;
  font-size: 1.125rem;
}

:deep(.card-content) {
  background: rgba(30, 41, 59, 0.3);
  padding: 0;
}

/* 地图容器样式 */
.map-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

/* 添加地图控制按钮的样式 */
:deep(.map-controls) {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

:deep(.map-control-btn) {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #475569;
  color: #f8fafc;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.map-control-btn:hover) {
  background: rgba(99, 102, 241, 0.8);
  border-color: #6366f1;
}
</style>