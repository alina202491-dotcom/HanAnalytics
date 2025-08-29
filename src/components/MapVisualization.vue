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
            🔄 重置
          </button>
          <button 
            @click="zoomIn" 
            class="px-3 py-2 text-xs bg-slate-800/90 hover:bg-indigo-600/80 text-white border border-slate-600 rounded-md transition-all duration-200 backdrop-blur-sm"
            title="放大"
          >
            ➕
          </button>
          <button 
            @click="zoomOut" 
            class="px-3 py-2 text-xs bg-slate-800/90 hover:bg-indigo-600/80 text-white border border-slate-600 rounded-md transition-all duration-200 backdrop-blur-sm"
            title="缩小"
          >
            ➖
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

// 国家名称映射 - 更完整的映射表
const countryNameMap = {
  // 中文到英文
  '中国': 'China',
  '美国': 'United States of America',
  '日本': 'Japan',
  '德国': 'Germany',
  '英国': 'United Kingdom',
  '法国': 'France',
  '意大利': 'Italy',
  '巴西': 'Brazil',
  '加拿大': 'Canada',
  '澳大利亚': 'Australia',
  '印度': 'India',
  '俄罗斯': 'Russia',
  '韩国': 'South Korea',
  '墨西哥': 'Mexico',
  '西班牙': 'Spain',
  '荷兰': 'Netherlands',
  '瑞士': 'Switzerland',
  '新加坡': 'Singapore',
  '泰国': 'Thailand',
  '印度尼西亚': 'Indonesia',
  '马来西亚': 'Malaysia',
  '菲律宾': 'Philippines',
  '越南': 'Vietnam',
  '土耳其': 'Turkey',
  '阿联酋': 'United Arab Emirates',
  '沙特阿拉伯': 'Saudi Arabia',
  '南非': 'South Africa',
  '埃及': 'Egypt',
  '尼日利亚': 'Nigeria',
  '阿根廷': 'Argentina',
  '智利': 'Chile',
  '哥伦比亚': 'Colombia',
  '秘鲁': 'Peru',
  '波兰': 'Poland',
  '瑞典': 'Sweden',
  '挪威': 'Norway',
  '丹麦': 'Denmark',
  '芬兰': 'Finland',
  '奥地利': 'Austria',
  '比利时': 'Belgium',
  '葡萄牙': 'Portugal',
  '希腊': 'Greece',
  '捷克': 'Czech Republic',
  '匈牙利': 'Hungary',
  '罗马尼亚': 'Romania',
  '以色列': 'Israel',
  '新西兰': 'New Zealand',
  '爱尔兰': 'Ireland',
  '香港': 'Hong Kong',
  '台湾': 'Taiwan',
  '澳门': 'Macao',
  
  // 英文别名处理
  'US': 'United States of America',
  'USA': 'United States of America',
  'UK': 'United Kingdom',
  'UAE': 'United Arab Emirates',
  'South Korea': 'South Korea',
  'Korea': 'South Korea',
  'Republic of Korea': 'South Korea'
}

// 标准化国家名称
const normalizeCountryName = (name: string): string => {
  if (!name) return ''
  
  // 直接匹配
  if (countryNameMap[name as keyof typeof countryNameMap]) {
    return countryNameMap[name as keyof typeof countryNameMap]
  }
  
  // 处理一些特殊情况
  const normalizedName = name.trim()
  
  // 常见的英文名称直接返回
  const commonEnglishNames = [
    'China', 'United States of America', 'Japan', 'Germany', 'United Kingdom',
    'France', 'Italy', 'Brazil', 'Canada', 'Australia', 'India', 'Russia',
    'Spain', 'Netherlands', 'Switzerland', 'Singapore', 'Thailand'
  ]
  
  if (commonEnglishNames.includes(normalizedName)) {
    return normalizedName
  }
  
  return normalizedName
}

// 获取高质量地图数据
const loadWorldMap = async () => {
  try {
    // 使用 Natural Earth 的高质量地图数据
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    if (!response.ok) {
      throw new Error('Failed to load primary map data')
    }
    const mapData = await response.json()
    return mapData
  } catch (error) {
    console.warn('Primary map data failed, trying backup...', error)
    try {
      // 备用数据源
      const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@3/countries-110m.json')
      if (!response.ok) throw new Error('Backup also failed')
      const topology = await response.json()
      
      // 如果是 TopoJSON 格式，需要转换
      // 这里简化处理，直接使用 GeoJSON
      return topology
    } catch (backupError) {
      console.warn('All map data sources failed', backupError)
      return null
    }
  }
}

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return

  // 销毁已存在的图表
  if (mapChart) {
    mapChart.dispose()
  }

  // 加载地图数据
  const mapData = await loadWorldMap()
  if (mapData) {
    echarts.registerMap('world', mapData)
  }

  // 创建图表实例
  mapChart = markRaw(echarts.init(mapContainer.value, null, { 
    renderer: 'canvas',
    useDirtyRect: true,
    width: mapContainer.value.offsetWidth,
    height: mapContainer.value.offsetHeight
  }))

  console.log('Map chart initialized with container size:', {
    width: mapContainer.value.offsetWidth,
    height: mapContainer.value.offsetHeight
  })

  // 获取当前数据的最大值
  const maxValue = Math.max(...(props.data?.map(item => item.value) || [100]))

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
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      formatter: (params: any) => {
        const countryName = params.name
        const dataItem = props.data?.find(item => 
          normalizeCountryName(item.name) === countryName ||
          item.name === countryName
        )
        
        if (dataItem && dataItem.value > 0) {
          return `
            <div style="padding: 6px; font-family: system-ui;">
              <div style="font-weight: 600; margin-bottom: 4px; color: #f8fafc;">${dataItem.name}</div>
              <div style="color: #a5b4fc; font-size: 11px;">
                访客数: <span style="color: #6366f1; font-weight: 600;">${dataItem.value.toLocaleString()}</span>
              </div>
            </div>
          `
        }
        return `
          <div style="padding: 6px; font-family: system-ui;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #f8fafc;">${countryName}</div>
            <div style="color: #64748b; font-size: 11px;">访客数: 0</div>
          </div>
        `
      }
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: maxValue,
      left: 15,
      bottom: 20,
      text: ['高', '低'],
      textStyle: {
        color: '#94a3b8',
        fontSize: 11
      },
      inRange: {
        color: [
          '#0f172a',      // 最低值 - 深色
          '#1e293b',      
          '#334155',      
          '#475569',      
          '#64748b',      
          '#94a3b8',      
          '#cbd5e1',      
          '#e2e8f0',      
          '#f1f5f9',      
          '#6366f1'       // 最高值 - 主题色
        ]
      },
      calculable: true,
      orient: 'vertical',
      itemWidth: 18,
      itemHeight: 100,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderRadius: 6,
      padding: [8, 6],
      textGap: 10
    },
    geo: {
      map: 'world',
      roam: true,  // 启用所有交互：拖拽和滚轮缩放
      zoom: 1.1,
      center: [0, 20],
      scaleLimit: {
        min: 0.5,
        max: 10
      },
      label: {
        show: false,
        color: '#f8fafc',
        fontSize: 9
      },
      itemStyle: {
        areaColor: '#1e293b',
        borderColor: '#475569',
        borderWidth: 0.8,
        borderType: 'solid',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 3,
        shadowOffsetX: 1,
        shadowOffsetY: 1
      },
      emphasis: {
        label: {
          show: true,
          color: '#f8fafc',
          fontSize: 10,
          fontWeight: '600'
        },
        itemStyle: {
          areaColor: '#6366f1',
          borderColor: '#8b5cf6',
          borderWidth: 1.5,
          shadowColor: 'rgba(99, 102, 241, 0.6)',
          shadowBlur: 10
        }
      }
    },
    series: [
      {
        name: '访客分布',
        type: 'map',
        geoIndex: 0,  // 关联到geo组件
        data: props.data?.map(item => ({
          name: normalizeCountryName(item.name),
          value: item.value,
          itemStyle: {
            areaColor: getColorByValue(item.value, maxValue)
          }
        })) || []
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut' as any
  }

  // 设置配置
  mapChart.setOption(option, true)

  // 确保鼠标事件正常工作
  mapChart.getZr().configLayer(0, {
    motionBlur: false,
    lastFrameAlpha: 0.7
  })

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 添加鼠标事件监听来确保交互正常
  mapChart.on('georoam', function (params) {
    // 地图漫游事件，确保交互正常
    console.log('Map roam event:', params)
  })
}

// 根据数值获取颜色
const getColorByValue = (value: number, maxValue: number): string => {
  if (value === 0) return '#1e293b'
  
  const ratio = value / maxValue
  const colors = [
    '#1e293b',  // 0%
    '#334155',  // 20%
    '#475569',  // 40%
    '#64748b',  // 60%
    '#94a3b8',  // 80%
    '#6366f1'   // 100%
  ]
  
  const index = Math.floor(ratio * (colors.length - 1))
  return colors[Math.min(index, colors.length - 1)]
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

  const maxValue = Math.max(...props.data.map(item => item.value), 100)
  
  const option = {
    visualMap: {
      max: maxValue
    },
    series: [{
      data: props.data.map(item => ({
        name: normalizeCountryName(item.name),
        value: item.value,
        itemStyle: {
          areaColor: getColorByValue(item.value, maxValue)
        }
      }))
    }]
  }

  mapChart.setOption(option, { replaceMerge: ['series'] })
}

// 重置视图
const resetView = () => {
  if (mapChart) {
    mapChart.setOption({
      geo: {
        zoom: 1.1,
        center: [0, 20]
      }
    })
  }
}

// 放大
const zoomIn = () => {
  if (mapChart) {
    mapChart.dispatchAction({
      type: 'geoZoom',
      zoom: 1.5,
      originX: mapContainer.value?.offsetWidth ? mapContainer.value.offsetWidth / 2 : 0,
      originY: mapContainer.value?.offsetHeight ? mapContainer.value.offsetHeight / 2 : 0
    })
  }
}

// 缩小
const zoomOut = () => {
  if (mapChart) {
    mapChart.dispatchAction({
      type: 'geoZoom',
      zoom: 0.7,
      originX: mapContainer.value?.offsetWidth ? mapContainer.value.offsetWidth / 2 : 0,
      originY: mapContainer.value?.offsetHeight ? mapContainer.value.offsetHeight / 2 : 0
    })
  }
}

// 监听数据变化
watch(() => props.data, updateMapData, { deep: true })
watch(() => props.loading, (loading) => {
  if (mapChart) {
    if (loading) {
      mapChart.showLoading({
        text: '加载地图数据...',
        color: '#6366f1',
        textColor: '#f8fafc',
        maskColor: 'rgba(15, 23, 42, 0.8)',
        zlevel: 0,
        fontSize: 12,
        showSpinner: true,
        spinnerRadius: 12,
        lineWidth: 2
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.card:hover) {
  border-color: #475569;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

:deep(.card-header) {
  border-bottom: 1px solid #334155;
  background: rgba(15, 23, 42, 0.5);
  padding: 1rem;
}

:deep(.card-title) {
  color: #f8fafc;
  font-weight: 600;
  font-size: 1.125rem;
  margin: 0;
}

:deep(.card-content) {
  background: rgba(30, 41, 59, 0.3);
  padding: 0;
  position: relative;
}

/* 地图容器优化 */
div[ref="mapContainer"] {
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

div[ref="mapContainer"]:active {
  cursor: grabbing;
}

/* 确保ECharts容器可以接收鼠标事件 */
:deep(.echarts-container) {
  position: relative !important;
  pointer-events: auto !important;
}

/* 控制按钮样式优化 */
button {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #f8fafc;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: rgba(99, 102, 241, 0.9);
  border-color: rgba(99, 102, 241, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

button:active {
  transform: translateY(0);
}

/* 控制按钮容器 */
.absolute.top-4.right-4 {
  z-index: 100;
  pointer-events: auto;
}

/* 确保按钮不干扰地图交互 */
button {
  pointer-events: auto;
  z-index: 101;
}

/* 加载状态优化 */
:deep(.echarts-loading-wrap) {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(8px);
}

/* 地图工具提示优化 */
:deep(.echarts-tooltip) {
  backdrop-filter: blur(12px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .absolute.top-4.right-4 {
    top: 8px;
    right: 8px;
    gap: 4px;
  }
  
  button {
    padding: 4px 6px;
    font-size: 10px;
  }
  
  :deep(.card-header) {
    padding: 0.75rem;
  }
  
  :deep(.card-title) {
    font-size: 1rem;
  }
}

/* 增强地图交互视觉反馈 */
:deep(.echarts-tooltip-trigger) {
  cursor: pointer;
}

/* 优化滚动条样式（如果需要） */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.6);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>