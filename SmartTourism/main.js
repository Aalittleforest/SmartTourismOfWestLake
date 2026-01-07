// 西湖智慧旅游系统 - 主要JavaScript文件

// 全局变量
let map;
let markers = [];
let currentUserLocation = [30.2594, 120.1322]; // 西湖中心坐标
let userData = {
    visits: [],
    clicks: [],
    checkIns: [],
    favorites: [],
    startTime: Date.now()
};

// 景点数据
const attractions = [
    {
        id: 'broken-bridge',
        name: '断桥残雪',
        type: 'nature',
        coords: [30.2594, 120.1322],
        image: 'resources/attraction-3.jpg',
        rating: 4.8,
        description: '西湖十景之首，以冬日雪景著称',
        poem: '断桥荒藓合，空院落花深。',
        visitors: 1580
    },
    {
        id: 'three-ponds',
        name: '三潭印月',
        type: 'nature',
        coords: [30.2584, 120.1302],
        image: 'resources/attraction-2.jpg',
        rating: 4.9,
        description: '小瀛洲仙境，中秋赏月的绝佳去处',
        poem: '片月生沧海，三潭处处明。',
        visitors: 1420
    },
    {
        id: 'leifeng-tower',
        name: '雷峰塔',
        type: 'culture',
        coords: [30.2574, 120.1342],
        image: 'resources/attraction-1.jpg',
        rating: 4.7,
        description: '西湖的标志性建筑，承载着白娘子的传说',
        poem: '雷峰夕照西湖好，画舫笙歌处处闻。',
        visitors: 1350
    },
    {
        id: 'su-causeway',
        name: '苏堤春晓',
        type: 'nature',
        coords: [30.2614, 120.1282],
        image: 'resources/attraction-5.jpg',
        rating: 4.6,
        description: '西湖十景之一，春日桃花盛开的美景',
        poem: '苏堤春晓游人醉，桃红柳绿不胜春。',
        visitors: 1200
    },
    {
        id: 'willow-waves',
        name: '柳浪闻莺',
        type: 'leisure',
        coords: [30.2564, 120.1362],
        image: 'resources/attraction-4.jpg',
        rating: 4.5,
        description: '西湖东南岸的公园，以柳树和黄莺闻名',
        poem: '柳浪闻莺春意浓，声声入耳醉心中。',
        visitors: 980
    },
    {
        id: 'music-fountain',
        name: '音乐喷泉',
        type: 'leisure',
        coords: [30.2554, 120.1382],
        image: 'resources/attraction-6.jpg',
        rating: 4.4,
        description: '西湖音乐喷泉，夜晚的灯光秀',
        poem: '水光潋滟晴方好，山色空蒙雨亦奇。',
        visitors: 1100
    }
];

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    initializeUserData();
    initializeAnimations();
    initializeMap();
    initializeEventListeners();
    initializeChart();
    recordPageVisit('index.html');
    
    // 定时更新统计数据
    setInterval(updateStatistics, 30000);
});

// 初始化用户数据
function initializeUserData() {
    const savedData = localStorage.getItem('westLakeUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    } else {
        userData = {
            visits: [],
            clicks: [],
            checkIns: [],
            favorites: [],
            startTime: Date.now()
        };
        saveUserData();
    }
}

// 保存用户数据
function saveUserData() {
    localStorage.setItem('westLakeUserData', JSON.stringify(userData));
}

// 记录页面访问
function recordPageVisit(page) {
    const visit = {
        page: page,
        timestamp: Date.now(),
        duration: 0
    };
    userData.visits.push(visit);
    saveUserData();
    
    // 记录页面离开时间
    window.addEventListener('beforeunload', function() {
        const lastVisit = userData.visits[userData.visits.length - 1];
        if (lastVisit && lastVisit.page === page) {
            lastVisit.duration = Date.now() - lastVisit.timestamp;
            saveUserData();
        }
    });
}

// 记录点击行为
function recordClick(element, type, value = null) {
    const click = {
        element: element,
        type: type,
        value: value,
        timestamp: Date.now(),
        page: window.location.pathname
    };
    userData.clicks.push(click);
    saveUserData();
    
    // 触发点击动画
    triggerClickAnimation();
}

// 触发点击动画
function triggerClickAnimation() {
    anime({
        targets: 'body',
        scale: [1, 1.02, 1],
        duration: 200,
        easing: 'easeInOutQuad'
    });
}

// 初始化动画
function initializeAnimations() {
    // 标题动画
    anime({
        targets: '#main-title',
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
        delay: 500,
        easing: 'easeOutQuad'
    });
    
    // 副标题动画
    anime({
        targets: '#subtitle',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        delay: 800,
        easing: 'easeOutQuad'
    });
    
    // 卡片依次出现
    anime({
        targets: '.floating-panel',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(200, {start: 1200}),
        easing: 'easeOutQuad'
    });
}

// 初始化地图
function initializeMap() {
    // 创建地图
    map = L.map('map').setView(currentUserLocation, 14);
    
    // 添加地图图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // 添加景点标记
    attractions.forEach(attraction => {
        const marker = L.marker(attraction.coords)
            .addTo(map)
            .bindPopup(createPopupContent(attraction))
            .on('click', function() {
                recordClick('map-marker', 'attraction', attraction.id);
            });
        
        markers.push({
            marker: marker,
            attraction: attraction
        });
    });
    
    // 添加用户位置标记
    const userMarker = L.marker(currentUserLocation, {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-dot"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        })
    }).addTo(map);
    
    userMarker.bindPopup('<div class="text-center"><strong>您的位置</strong><br>西湖景区中心</div>');
}

// 创建弹窗内容
function createPopupContent(attraction) {
    return `
        <div class="p-2 max-w-xs">
            <img src="${attraction.image}" alt="${attraction.name}" class="w-full h-24 object-cover rounded-lg mb-2">
            <h3 class="font-bold text-lg mb-1">${attraction.name}</h3>
            <div class="flex items-center mb-2">
                <span class="text-yellow-500">★</span>
                <span class="text-sm ml-1">${attraction.rating}</span>
                <span class="text-gray-500 text-sm ml-2">(${attraction.visitors}人游览)</span>
            </div>
            <p class="text-sm text-gray-600 mb-3">${attraction.description}</p>
            <div class="flex space-x-2">
                <button onclick="checkInAttraction('${attraction.id}')" class="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                    打卡
                </button>
                <button onclick="viewAttraction('${attraction.id}')" class="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    详情
                </button>
            </div>
        </div>
    `;
}

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        filterAttractions(query);
        recordClick('search-input', 'search', query);
    });
    
    // 筛选按钮
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            filterByType(type);
            
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active', 'bg-blue-100', 'text-blue-700'));
            this.classList.add('active', 'bg-blue-100', 'text-blue-700');
            
            recordClick('filter-btn', 'filter', type);
        });
    });
    
    // 景点卡片点击
    const attractionCards = document.querySelectorAll('.attraction-card');
    attractionCards.forEach(card => {
        card.addEventListener('click', function() {
            const attractionId = this.dataset.attraction;
            viewAttraction(attractionId);
            recordClick('attraction-card', 'view', attractionId);
        });
    });
    
    // AI助手相关
    initializeAIAssistant();
    
    // 移动端菜单
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            alert('移动端菜单功能开发中...');
            recordClick('mobile-menu-btn', 'menu', 'toggle');
        });
    }
}

// 筛选景点
function filterAttractions(query) {
    markers.forEach(({marker, attraction}) => {
        if (attraction.name.toLowerCase().includes(query) || 
            attraction.description.toLowerCase().includes(query)) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

// 按类型筛选
function filterByType(type) {
    markers.forEach(({marker, attraction}) => {
        if (type === 'all' || attraction.type === type) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

// 景点打卡
function checkInAttraction(attractionId) {
    const attraction = attractions.find(a => a.id === attractionId);
    if (attraction) {
        const checkIn = {
            attractionId: attractionId,
            attractionName: attraction.name,
            timestamp: Date.now(),
            location: attraction.coords
        };
        userData.checkIns.push(checkIn);
        saveUserData();
        
        // 显示打卡成功动画
        showCheckInSuccess(attraction.name);
        recordClick('checkin-btn', 'checkin', attractionId);
    }
}

// 显示打卡成功
function showCheckInSuccess(attractionName) {
    // 创建成功提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>在 ${attractionName} 打卡成功！</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    // 动画显示
    anime({
        targets: toast,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad'
    });
    
    // 3秒后自动消失
    setTimeout(() => {
        anime({
            targets: toast,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInQuad',
            complete: () => {
                document.body.removeChild(toast);
            }
        });
    }, 3000);
}

// 快速打卡
function checkIn() {
    // 获取最近的景点
    const nearestAttraction = attractions[Math.floor(Math.random() * attractions.length)];
    checkInAttraction(nearestAttraction.id);
    recordClick('quick-checkin', 'checkin', 'quick');
}

// 查看景点详情
function viewAttraction(attractionId) {
    window.location.href = `attractions.html?id=${attractionId}`;
}

// 初始化AI助手
function initializeAIAssistant() {
    const aiAssistantBtn = document.getElementById('ai-assistant-btn');
    const aiModal = document.getElementById('ai-modal');
    const closeAiModal = document.getElementById('close-ai-modal');
    const aiInput = document.getElementById('ai-input');
    const sendAiMessage = document.getElementById('send-ai-message');
    const aiChatContent = document.getElementById('ai-chat-content');
    const aiChatBtn = document.getElementById('ai-chat-btn');
    const quickQuestions = document.querySelectorAll('.ai-quick-question');
    
    // 打开AI助手
    function openAIAssistant() {
        aiModal.classList.remove('hidden');
        aiInput.focus();
        recordClick('ai-assistant-btn', 'open', 'ai-modal');
    }
    
    aiAssistantBtn.addEventListener('click', openAIAssistant);
    aiChatBtn.addEventListener('click', openAIAssistant);
    
    // 关闭AI助手
    closeAiModal.addEventListener('click', function() {
        aiModal.classList.add('hidden');
        recordClick('close-ai-modal', 'close', 'ai-modal');
    });
    
    // 点击模态框外部关闭
    aiModal.addEventListener('click', function(e) {
        if (e.target === aiModal) {
            aiModal.classList.add('hidden');
        }
    });
    
    // 发送消息
    function sendMessage() {
        const message = aiInput.value.trim();
        if (message) {
            addChatMessage('user', message);
            aiInput.value = '';
            
            // 模拟AI回复
            setTimeout(() => {
                const response = getAIResponse(message);
                addChatMessage('ai', response);
            }, 1000);
            
            recordClick('send-ai-message', 'send', message);
        }
    }
    
    sendAiMessage.addEventListener('click', sendMessage);
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 快速问题
    quickQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const q = this.dataset.question;
            addChatMessage('user', q);
            
            setTimeout(() => {
                const response = getAIResponse(q);
                addChatMessage('ai', response);
            }, 1000);
            
            recordClick('ai-quick-question', 'quick-question', q);
        });
    });
    
    // 添加聊天消息
    function addChatMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-2 ${sender === 'user' ? 'text-right' : 'text-left'}`;
        
        const bubbleClass = sender === 'user' 
            ? 'bg-blue-500 text-white px-3 py-2 rounded-lg inline-block max-w-xs' 
            : 'bg-gray-200 text-gray-800 px-3 py-2 rounded-lg inline-block max-w-xs';
        
        messageDiv.innerHTML = `<div class="${bubbleClass}">${message}</div>`;
        aiChatContent.appendChild(messageDiv);
        
        // 滚动到底部
        aiChatContent.scrollTop = aiChatContent.scrollHeight;
    }
    
    // 获取AI回复
    function getAIResponse(message) {
        const responses = {
            '西湖有哪些著名景点？': '西湖有十大著名景点：断桥残雪、三潭印月、雷峰夕照、苏堤春晓、曲院风荷、平湖秋月、花港观鱼、柳浪闻莺、双峰插云、南屏晚钟。每个景点都有其独特的历史文化和自然风光。',
            '最佳游览时间？': '西湖四季皆宜游览。春季（3-5月）桃花盛开，夏季（6-8月）荷花满池，秋季（9-11月）桂花飘香，冬季（12-2月）雪景如画。建议选择天气晴朗的日子前往。',
            '附近有什么美食？': '西湖周边有众多美食：西湖醋鱼、东坡肉、龙井虾仁、叫化童鸡、宋嫂鱼羹等杭帮菜。推荐在楼外楼、知味观等老字号餐厅品尝正宗杭帮菜。',
            '门票价格？': '西湖景区本身免费开放，但部分景点需要门票：雷峰塔40元，三潭印月55元（含船票），岳王庙25元，净慈寺10元。建议提前在网上购票享受优惠。',
            '开放时间？': '西湖景区全天开放。主要景点开放时间：雷峰塔8:00-17:30，三潭印月8:00-17:00，岳王庙7:30-17:30。建议早上或傍晚游览，避开人流高峰。'
        };
        
        return responses[message] || '感谢您的提问！这是一个很好的问题。作为AI助手，我会不断学习和改进，为您提供更准确的信息。您还可以问我关于景点介绍、游览路线、交通指南等问题。';
    }
}

// 初始化图表
function initializeChart() {
    const chartDom = document.getElementById('popularity-chart');
    const myChart = echarts.init(chartDom);
    
    const option = {
        title: {
            text: '热门景点排行',
            left: 'center',
            textStyle: {
                color: '#4A90A4',
                fontSize: 18,
                fontWeight: 'bold'
            }
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
            data: attractions.map(a => a.name),
            axisLabel: {
                rotate: 45,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            name: '游客数量'
        },
        series: [{
            name: '游客数量',
            type: 'bar',
            data: attractions.map(a => ({
                value: a.visitors,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#4A90A4' },
                        { offset: 1, color: '#7FB069' }
                    ])
                }
            })),
            barWidth: '60%',
            label: {
                show: true,
                position: 'top',
                fontSize: 10
            }
        }]
    };
    
    myChart.setOption(option);
    
    // 响应式
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 更新统计数据
function updateStatistics() {
    // 模拟实时数据更新
    const visitorCount = document.getElementById('visitor-count');
    const checkinCount = document.getElementById('checkin-count');
    
    if (visitorCount && checkinCount) {
        const currentVisitors = parseInt(visitorCount.textContent.replace(',', ''));
        const currentCheckins = parseInt(checkinCount.textContent.replace(',', ''));
        
        const newVisitors = currentVisitors + Math.floor(Math.random() * 10);
        const newCheckins = currentCheckins + Math.floor(Math.random() * 5);
        
        visitorCount.textContent = newVisitors.toLocaleString();
        checkinCount.textContent = newCheckins.toLocaleString();
        
        // 数字变化动画
        anime({
            targets: [visitorCount, checkinCount],
            scale: [1, 1.1, 1],
            duration: 500,
            easing: 'easeInOutQuad'
        });
    }
}

// P5.js 背景动画
function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-background');
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
}

let waves = [];

function draw() {
    clear();
    
    // 创建水波纹效果
    fill(74, 144, 164, 20);
    noStroke();
    
    for (let i = 0; i < 3; i++) {
        let wave = {
            x: width * (0.2 + i * 0.3) + sin(frameCount * 0.01 + i) * 50,
            y: height * 0.3 + cos(frameCount * 0.008 + i) * 30,
            size: 100 + sin(frameCount * 0.02 + i) * 20
        };
        
        ellipse(wave.x, wave.y, wave.size, wave.size * 0.6);
    }
    
    // 添加浮动的粒子
    fill(127, 176, 105, 30);
    for (let i = 0; i < 5; i++) {
        let particle = {
            x: width * (0.1 + i * 0.2) + sin(frameCount * 0.015 + i * 2) * 30,
            y: height * 0.6 + cos(frameCount * 0.012 + i * 2) * 20,
            size: 5 + sin(frameCount * 0.03 + i) * 2
        };
        
        ellipse(particle.x, particle.y, particle.size);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// 导出用户数据（用于调试）
function exportUserData() {
    console.log('用户数据:', userData);
    return userData;
}

// 页面卸载时保存数据
window.addEventListener('beforeunload', function() {
    saveUserData();
});

// 全局暴露函数
window.checkIn = checkIn;
window.checkInAttraction = checkInAttraction;
window.viewAttraction = viewAttraction;
window.exportUserData = exportUserData;