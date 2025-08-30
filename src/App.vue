<template>
  <section class="han_analytics">
    <header>
      <div class="main">
        <div class="logo">
          <img src="./assets/favicon.ico">
          <span>Han Analytics</span>
        </div>
        <h2>IKUN的Web分析</h2>
      </div>
    </header>
    <main>
      <header>
        <Alert>
          <AlertDescription>
            <p>· Han Analytics 是一个简单的网络分析跟踪器和仪表板，托管在被称为赛博菩萨的 Cloudflare 上,无成本稳定运行,每天可达10万次免费统计。</p>
            <p>· 域名、服务器、数据库 通通都不用! 托管在 Cloudflare Pages 上即可快速部署网站分析仪表板。</p>
          </AlertDescription>
        </Alert>
      </header>

      <section class="main">
        <div class="pb-5 grid md:grid-cols-2 sm:grid-cols-1 items-start">
          <div class="flex gap-[16px] pb-6">
            <div class="w-3/6">
              <Select :disabled="siteList.length < 1 || getDatasStatus" v-model="siteValue"
                @update:model-value="getDatas">
                <SelectTrigger class="w-[218px] bg-white/80 text-gray-900 border border-white/60 backdrop-blur-md shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                  <SelectValue placeholder="选择站点" />
                </SelectTrigger>
                <SelectContent class="bg-white/95 text-gray-900 border border-gray-200 backdrop-blur-md shadow-xl">
                  <SelectGroup>
                    <SelectLabel>Web Site</SelectLabel>
                    <SelectItem :value="i" v-for="i in siteList" :key="i">{{ i }}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div class="w-3/6">
              <Select :disabled="siteList.length < 1 || getDatasStatus" v-model="timeValue"
                @update:model-value="getDatas">
                <SelectTrigger class="w-[218px] bg-white/80 text-gray-900 border border-white/60 backdrop-blur-md shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                  <SelectValue placeholder="选择周期" />
                </SelectTrigger>
                <SelectContent class="bg-white/95 text-gray-900 border border-gray-200 backdrop-blur-md shadow-xl">
                  <SelectGroup>
                    <SelectLabel>Cycle Time</SelectLabel>
                    <SelectItem :value="i.value" v-for="i in timeList" :key="i.name">{{ i.name }}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div
            class="flex justify-end text-center md:text-right line-clamp-1 [&>.views-item]:flex [&>.views-item]:flex-col [&>.views-item]:items-center md:[&>.views-item]:items-end [&>.views-item]:gap-4 [&>.views-item>span]:text-sm [&>.views-item>p]:text-3xl [&>.views-item>p]:line-clamp-1 [&>.views-item>p]:w-full bg-white/80 text-gray-900 border border-white/60 rounded-lg px-3 py-2 backdrop-blur-md shadow-sm">
            <div class="views-item w-full overflow-hidden">
              <span>Views</span>
              <div class="space-y-2 w-[50%]" v-if="resData.visit.views === undefined">
                <Skeleton class="h-4  w-[50%] ml-auto" />
                <Skeleton class="h-4" />
              </div>
              <p v-else>{{ resData.visit.views }}</p>
            </div>
            <div class="views-item w-full overflow-hidden">
              <span>Visitors</span>
              <div class="space-y-2 w-[50%]" v-if="resData.visit.visitor === undefined">
                <Skeleton class="h-4  w-[50%] ml-auto" />
                <Skeleton class="h-4" />
              </div>
              <p v-else>{{ resData.visit.visitor }}</p>
            </div>
            <div class="views-item w-full overflow-hidden">
              <span>Visits</span>
              <div class="space-y-2 w-[50%]" v-if="resData.visit.visit === undefined">
                <Skeleton class="h-4  w-[50%] ml-auto" />
                <Skeleton class="h-4" />
              </div>
              <p v-else>{{ resData.visit.visit }}</p>
            </div>
          </div>
        </div>

        <div ref="echartsDOM" class="data-view"></div>

        <div class="pt-20 grid md:grid-cols-2 sm:grid-cols-1 gap-[16px]">
          <Card class="box-border flex flex-col w-full h-[460px] overflow-hidden">
            <CardHeader>
              <CardTitle>Pages</CardTitle>
            </CardHeader>
            <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
              <ScrollArea class="box-border p-2 pt-0 h-full w-full pages-list" v-if="resData.path != undefined">
                <p class="page-item" v-for="(i, idx) in resData.path" :key="idx">
                  <span class="line-clamp-1">{{ i.name }}</span>
                  <span class="line-clamp-1">{{ i.value }}</span>
                  <em>{{ i.per }}<i :style="{ width: i.per }"></i></em>
                </p>
              </ScrollArea>
              <div class="space-y-4 pt-8 w-full" v-else>
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card class="box-border flex flex-col w-full h-[460px] overflow-hidden">
            <CardHeader>
              <CardTitle>Referrers</CardTitle>
            </CardHeader>
            <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
              <ScrollArea class="box-border p-2 pt-0 h-full w-full pages-list" v-if="resData.referrer != undefined">
                <p class="page-item" v-for="(i, idx) in resData.referrer" :key="idx">
                  <img v-if="i.name" :src="getIconUrl(i.name)">
                  <a :href="i.name" target="_blank" rel="noopener noreferrer" class="line-clamp-1 cursor-pointer">
                    {{ i.name || '(None)' }}
                  </a>
                  <span class="line-clamp-1">{{ i.value }}</span>
                  <em>{{ i.per }}<i :style="{ width: i.per }"></i></em>
                </p>
              </ScrollArea>
              <div class="space-y-4 pt-8 w-full" v-else>
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="pt-6 grid xl:grid-cols-2 gap-[16px] md:grid-cols-2 sm:grid-cols-1">
          <Card class="box-border flex flex-col w-full h-[460px] overflow-hidden">
            <CardHeader>
              <CardTitle>Browsers</CardTitle>
            </CardHeader>
            <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
              <ScrollArea class="box-border p-2 pt-0 h-full w-full pages-list" v-if="resData.soft != undefined">
                <p class="page-item" v-for="(i, idx) in resData.soft" :key="idx">
                  <span class="line-clamp-1">{{ i.name }}</span>
                  <span class="line-clamp-1">{{ i.value }}</span>
                  <em>{{ i.per }}<i :style="{ width: i.per }"></i></em>
                </p>
              </ScrollArea>
              <div class="space-y-4 pt-8 w-full" v-else>
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card class="box-border flex flex-col w-full h-[460px] overflow-hidden">
            <CardHeader>
              <CardTitle>OS</CardTitle>
            </CardHeader>
            <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
              <ScrollArea class="box-border p-2 pt-0 h-full w-full pages-list" v-if="resData.os != undefined">
                <p class="page-item" v-for="(i, idx) in resData.os" :key="idx">
                  <img class="os" :src="getIcon(i.name)">
                  <span class="line-clamp-1">{{ i.name }}</span>
                  <span class="line-clamp-1">{{ i.value }}</span>
                  <em>{{ i.per }}<i :style="{ width: i.per }"></i></em>
                </p>
              </ScrollArea>
              <div class="space-y-4 pt-8 w-full" v-else>
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-full" />
              </div>
            </CardContent>
          </Card>


          <Card class="box-border flex flex-col w-full h-[460px] overflow-hidden">
            <CardHeader>
              <CardTitle>IP Addresses</CardTitle>
            </CardHeader>
            <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
              <ScrollArea class="box-border p-2 pt-0 h-full w-full pages-list" v-if="resData.ip != undefined">
                <p class="page-item" v-for="(i, idx) in resData.ip" :key="idx">
                  <span class="line-clamp-1">{{ i.name || '(Unknown IP)' }}</span>
                  <span class="line-clamp-1">{{ i.value }}</span>
                  <em>{{ i.per }}<i :style="{ width: i.per }"></i></em>
                </p>
              </ScrollArea>
              <div class="space-y-4 pt-8 w-full" v-else>
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card class="box-border flex flex-col w-full h-[460px] overflow-hidden">
            <CardHeader>
              <CardTitle>Areas</CardTitle>
            </CardHeader>
            <CardContent class="box-border pt-0 w-full h-full overflow-hidden">
              <ScrollArea class="box-border p-2 pt-0 h-full w-full pages-list" v-if="resData.area != undefined">
                <p class="page-item" v-for="(i, idx) in resData.area" :key="idx">
                  <img :src="getIcon(i.name)">
                  <span class="line-clamp-1">{{ i.code }}</span>
                  <span class="line-clamp-1">{{ i.value }}</span>
                  <em>{{ i.per }}<i :style="{ width: i.per }"></i></em>
                </p>
              </ScrollArea>
              <div class="space-y-4 pt-8 w-full" v-else>
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-60" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-100" />
                <Skeleton class="h-6 w-80" />
                <Skeleton class="h-6 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      <div ref="mapDOM" class="map-view"></div>
      </section>
    </main>
    <footer>
      <p><img src="./assets/svg/ing.svg"></p>
      <p>
        <a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer"><img
            src="./assets/svg/framework.svg"></a>
        <a href="https://www.cloudflare.com/zh-cn/application-services/products/cdn/" target="_blank"
          rel="noopener noreferrer"><img src="./assets/svg/cdn.svg"></a>
        <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer"><img src="./assets/svg/web.svg"></a>
      </p>
    </footer>
  </section>
  <div class="z-[999999999]">
    <Toaster />
  </div>
  <AlertDialog :open="authStatus">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>请输入登录密码</AlertDialogTitle>
        <AlertDialogDescription>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <Input type="text" placeholder="Password" v-model="loginPassword" />
      <AlertDialogFooter>
        <Button :disabled="loginStatus" @click="loginFn">
          <Loader2 v-show="loginStatus" class="w-4 h-4 mr-2 animate-spin" />登录
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>


<script setup lang="ts">
import { ref, markRaw, onMounted } from 'vue'
import * as echarts from "echarts";
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import vh from 'vh-plugin'
import { Toaster } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast();
// 弹窗
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

// 登录
const authStatus = ref<boolean>(false)
const session = ref<string>(localStorage.getItem('session') || '')
const loginStatus = ref<boolean>(false)
const loginPassword = ref<string>('')
const loginFn = async () => {
  if (!loginPassword.value) return toast({ description: '请输入密码', variant: 'destructive' });
  loginStatus.value = true;
  const res = await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ type: 'Login', session: loginPassword.value }) })
  await new Promise(resolve => setTimeout(resolve, 666))
  loginStatus.value = false;
  const data = await res.json()
  if (!data.success) return toast({ description: data.message, variant: 'destructive' });
  localStorage.setItem('session', loginPassword.value)
  session.value = loginPassword.value
  authStatus.value = false;
  // 站点列表
  getSiteList()
}

// 站点列表
const siteList = ref<Array<string>>([])
const siteValue = ref<string>('')
const timeList = [{ name: 'Today', value: 'today' }, { name: 'Yesterday', value: '1d' }, { name: 'Last 7 days', value: '7d' }, { name: 'Last 30 days', value: '30d' }, { name: 'Last 60 days', value: '60d' }, { name: 'Last 90 days', value: '90d' }]
const timeValue = ref<string>('today')
const getSiteList = async () => {
  vh.showLoading()
  try {
    const res = await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ type: 'list', session: session.value }) })
    const data = await res.json()
    if (data.code && data.code === 401) {
      localStorage.clear()
      authStatus.value = true
    }
    if (!data.success) return toast({ description: data.message, variant: 'destructive' });
    siteList.value = data.data;
    siteValue.value = siteList.value[0]
    if (siteValue.value) getDatas()
  } catch (error) {
    console.log(error);
  } finally {
    vh.hideLoading()
  }
}

// 获取数据
const resData = ref<any>({ visit: {} })
const tempResData = ref<any>({ visit: {} })
const getDatasStatus = ref<boolean>(false)
const getDatas = async () => {
  // 清空数据
  resData.value = { visit: {} }
  tempResData.value = { visit: {} }
  // 获取数据
  const pmsARR = ['visit', 'path', 'referrer', 'os', 'soft', 'area', 'ip', 'echarts'];
  getDatasStatus.value = true
  vh.showLoading()
  const promisesForEach: Array<Promise<any>> = [];
  pmsARR.forEach((i: any) => {
    const p = new Promise((r) => {
      (async () => {
        try {
          const pms = { type: i, siteID: siteValue.value, time: timeValue.value, session: session.value }
          const res = await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(pms) })
          const data = await res.json()
          if (data.code && data.code === 401) {
            localStorage.clear()
            authStatus.value = true;
          }
          if (!data.success) return toast({ description: data.message, variant: 'destructive' });
          tempResData.value[i] = i == 'echarts' ? renderEcharts(data.data.map((i: any) => `${i.name}${['today', '1d'].includes(timeValue.value) ? '点' : '日'}`), data.data.map((i: any) => `${i.value}`)) : data.data
          if (i === 'area') renderWorldMap(data.data)
        } catch (error) {
          console.log(error);
        } finally {
          // Promise执行完毕触发
          r(true);
        }
      })();
    });
    promisesForEach.push(p);
  })
  await Promise.all(promisesForEach);
  getDatasStatus.value = false;
  vh.hideLoading()
  // 渲染数据
  resData.value = { ...tempResData.value }
}

// 获取ICON
const getIconUrl = (url: string) => {
  if (!url) return 'https://icons.duckduckgo.com/ip3/none.ico'
  const _url = new URL(url)
  return `https://icons.duckduckgo.com/ip3/${_url.hostname}.ico`
}

// 获取Area ICON
const getIcon = (code: string) => `${location.origin}/icon/${code}.png`

// 渲染图表
const echartsDOM = ref<HTMLCanvasElement>();
const canvasMain = ref<any>();
const renderEcharts = async (dateList: Array<any>, valueList: Array<any>) => {
  const option = {
    grid: { left: "0", right: "0", bottom: "0", top: "10", containLabel: true },
    xAxis: {
      type: "category",
      data: dateList,
      axisLabel: { color: "#959BAA" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.56)", width: 2, type: "dashed" } }
    },
    yAxis: { type: "value", axisLabel: { color: "#959BAA" } },
    tooltip: { trigger: "axis" },
    series: [
      {
        data: valueList,
        type: "line",
        smooth: true,
        emphasis: {
          focus: "series",
          itemStyle: { borderWidth: 2 },
          areaStyle: {
            color: {
              colorStops: [
                { offset: 0, color: "#DAE4FF" },
                { offset: 1, color: "#ffffff" }
              ],
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              type: "linear",
              global: false
            }
          }
        },
        lineStyle: {
          width: 2,
          color: {
            colorStops: [{ offset: 1, color: "#6F94F1" }],
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            type: "linear",
            global: false
          }
        },
        showSymbol: false,
        areaStyle: {
          opacity: 1,
          color: {
            colorStops: [
              { offset: 0, color: "#DAE4FF" },
              { offset: 1, color: "#ffffff" }
            ],
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            type: "linear",
            global: false
          }
        }
      }
    ]
  };
  canvasMain.value.setOption(option);
};

// 地图渲染
const mapDOM = ref<HTMLDivElement>();
const mapMain = ref<any>();
let worldRegistered = false;
let isoToName: Record<string, string> = {};
let worldIsoList: Array<string> = [];
// ISO 别名映射：将统计返回的代码映射到底图属性值
const isoAliasMulti: Record<string, Array<string>> = {
  TW: ['CN-TW', 'TW'],
  HK: ['HK', 'CN-HK'],
  MO: ['MO', 'CN-MO']
};
const ensureWorldMap = async () => {
  if (worldRegistered) return;
  try {
    // 使用包含 ISO3166-1-Alpha-2 的世界国家 GeoJSON，便于与后端的国家代码对齐
    const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geoJSON = await res.json();
    // 构建 iso2 到英文名称的映射，用于提示展示
    try {
      isoToName = (geoJSON.features || []).reduce((acc: any, f: any) => {
        const iso2 = f?.properties?.['ISO3166-1-Alpha-2'];
        const name = f?.properties?.name;
        if (iso2) acc[iso2] = name || iso2;
        return acc;
      }, {} as Record<string, string>);
      worldIsoList = Object.keys(isoToName);
    } catch (_) {
      isoToName = {};
      worldIsoList = [];
    }
    echarts.registerMap('world', geoJSON);
    worldRegistered = true;
  } catch (error) {
    console.error('加载世界地图失败', error);
  }
};
const toNumber = (v: any) => {
  if (typeof v === 'number') return v;
  const s = String(v || '0').trim();
  if (s.endsWith('K')) return Math.round(parseFloat(s) * 1000);
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
const renderWorldMap = async (areaList: Array<any> = []) => {
  await ensureWorldMap();
  if (!mapMain.value) return;
  // 以 ISO2 为键，按“绝对访问量”映射亮度，并补齐无数据国家为 0
  const valueByIso: Record<string, number> = areaList.reduce((m: any, i: any) => {
    const candidates = isoAliasMulti[i.name] || [i.name];
    const val = toNumber(i.value);
    candidates.forEach((key) => {
      m[key] = (m[key] || 0) + val;
    });
    return m;
  }, {} as Record<string, number>);
  const mapData = (worldIsoList.length ? worldIsoList : Object.keys(valueByIso)).map((iso: string) => {
    const raw = valueByIso[iso] || 0;
    // value 用绝对访问量（在 piecewise 中分段映射），raw 用于 tooltip 展示
    const value = raw;
    return { name: iso, value, raw };
  });
  const option = {
    animation: false,
    tooltip: { trigger: 'item', formatter: (params: any) => `${isoToName[params.name] || params.name}: ${params.value || 0} visitors` },
    visualMap: {
      type: 'piecewise',
      left: 20,
      bottom: 20,
      text: ['更多', '更少'],
      // 绝对访问量分段映射，确保不同时间段亮度标准一致
      pieces: [
        { lte: 0, color: '#182232', label: '0' },
        { gt: 0, lte: 9, color: '#203046', label: '1-9' },
        { gt: 9, lte: 99, color: '#294365', label: '10-99' },
        { gt: 99, lte: 999, color: '#355e98', label: '100-999' },
        { gt: 999, lte: 9999, color: '#4a7fea', label: '1k-9.9k' },
        { gt: 9999, lte: 99999, color: '#8fb5ff', label: '10k-99k' },
        { gt: 99999, color: '#ffffff', label: '≥100k' }
      ]
    },
    series: [
      {
        type: 'map',
        map: 'world',
        roam: true,
        // 与数据中使用的 name 字段对齐
        nameProperty: 'ISO3166-1-Alpha-2',
        label: { show: false },
        itemStyle: { areaColor: '#0f1621', borderColor: '#8aa0b5', borderWidth: 0.9 },
        emphasis: { label: { show: false }, itemStyle: { areaColor: '#3b82f6', borderColor: '#cfe1f0', borderWidth: 1.2 } },
        data: mapData,
        zoom: 1.45,
        scaleLimit: { min: 0.6, max: 32 },
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        // 提高缩放、拖拽的响应速度，禁用系列动画
        animation: false,
        progressive: 0,
        progressiveThreshold: 0,
        selectedMode: false,
        
      }
    ]
  } as any;
  mapMain.value.setOption(option, { notMerge: true });
};

onMounted(() => {
  //   图表
  canvasMain.value = markRaw(echarts.init(echartsDOM.value, null, { renderer: "svg", useDirtyRect: true }));
  window.addEventListener("resize", canvasMain.value.resize);
  //   地图
  mapMain.value = markRaw(echarts.init(mapDOM.value as unknown as HTMLDivElement, null, { renderer: 'svg', useDirtyRect: true }));
  // 开启默认平移与滚轮缩放（roam: true 已启用），设置为手势友好
  // 调整缩放灵敏度与动画，提升交互顺滑度
  // 降低更新动画时长，进一步提升交互即时性
  mapMain.value.setOption({
    animation: false,
    series: [{ animation: false }]
  });
  window.addEventListener('resize', mapMain.value.resize);
  // 站点列表
  getSiteList()

  // 加载随机 ACG 背景（并发预加载 + 本地缓存 + 首屏更亮）
  ;(() => {
    const root = document.querySelector('.han_analytics') as HTMLElement | null;
    if (!root) return;
    root.classList.add('acg-loading');
    const setBg = (url: string) => {
      root.style.setProperty('--acg-bg-url', `url(${url})`);
      root.classList.remove('acg-loading');
      root.classList.add('acg-ready');
      try { localStorage.setItem('acg_bg_last', url); } catch {}
    };
    // 先用缓存的一张，避免首屏过暗
    try {
      const cached = localStorage.getItem('acg_bg_last');
      if (cached) setBg(cached);
    } catch {}
    const sources = [
      'https://api.ixiaowai.cn/api/api.php',
      'https://www.dmoe.cc/random.php',
      'https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images',
      'https://img.xjh.me/random_img.php?type=bg&ctype=acg&return=302'
    ];
    const preload = (rawUrl: string) => new Promise<string>((resolve, reject) => {
      const url = rawUrl + (rawUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = reject;
      img.src = url;
    });
    let done = false;
    const timer = setTimeout(() => { done = true; }, 1800);
    sources.forEach((src) => {
      preload(src).then((url) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        setBg(url);
      }).catch(() => {});
    });
  })();
})

// 组件卸载清理
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    try {
      window.removeEventListener('resize', canvasMain.value?.resize);
      window.removeEventListener('resize', mapMain.value?.resize);
      canvasMain.value?.dispose?.();
      mapMain.value?.dispose?.();
    } catch (e) {}
  })
}
</script>
<style>
.fixed.inset-0.z-50,
.fixed.grid.w-full.max-w-lg.shadow-lg.duration-200 {
  z-index: 99999999;
}
</style>

<style scoped>
@import '@/assets/index.less';
</style>
