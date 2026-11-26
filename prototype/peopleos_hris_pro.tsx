import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Users,
  UserPlus,
  UserCheck,
  FileSignature,
  CalendarClock,
  Award,
  UserCircle,
  Briefcase,
  TrendingUp,
  Search,
  Bell,
  Plus,
  Download,
  List,
  LayoutGrid as GridIcon,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  X,
  Check,
  ShieldCheck,
  FileText,
  Clock,
  DollarSign,
  Lock,
  Unlock,
  Send,
  Filter,
  Building2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Edit3,
  CreditCard,
  IdCard,
  HeartHandshake,
  Paperclip,
  Upload,
  Trash2,
  RotateCcw,
  Ban,
  Layers,
  UserCheck2,
  Target,
} from 'lucide-react';

// ==========================================
// 1. 业务常量与标准字典
// ==========================================
const DEPARTMENTS = ['全部部门', '内容创作部', '技术部', '视觉设计部', '运营部', '人力资源部'];
const EMPLOYEE_STATUSES = ['全部状态', '正式员工', '试用期', '已离职'];
const HIRE_YEAR_MONTHS = ['入职年月', '2024-03', '2024-06', '2024-08', '2025-02', '2026-09', '2026-10', '2026-11'];

const ETHNIC_GROUPS = [
  '汉族', '蒙古族', '回族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族', '朝鲜族',
  '满族', '侗族', '瑶族', '白族', '土家族', '哈尼族', '哈萨克族', '傣族', '黎族', '傈僳族',
  '佤族', '畲族', '高山族', '拉祜族', '水族', '东乡族', '纳西族', '景颇族', '柯尔克孜族', '土族',
  '达斡尔族', '仫佬族', '羌族', '布朗族', '撒拉族', '毛南族', '仡佬族', '锡伯族', '阿昌族', '普米族',
  '塔吉克族', '怒族', '乌孜别克族', '俄罗斯族', '鄂温克族', '德昂族', '保安族', '裕固族', '京族', '塔塔尔族',
  '独龙族', '鄂伦春族', '赫哲族', '门巴族', '珞巴族', '基诺族',
];

const COUNTRIES_REGIONS = [
  '中国', '中国香港', '中国澳门', '中国台湾', '美国', '英国', '日本', '韩国', '新加坡', '加拿大',
  '澳大利亚', '德国', '法国', '瑞士', '荷兰', '瑞典', '新西兰', '马来西亚', '泰国', '阿联酋', '其他国家/地区',
];

const PROVINCE_CITY_MAP = {
  北京市: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '顺义区', '昌平区', '大兴区'],
  上海市: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '闵行区', '宝山区'],
  天津市: ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '滨海新区'],
  重庆市: ['渝中区', '江北区', '南岸区', '九龙坡区', '沙坪坝区', '渝北区', '巴南区'],
  浙江省: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  广东省: ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '惠州市', '东莞市', '中山市'],
  江苏省: ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市'],
  四川省: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '宜宾市'],
  湖北省: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市'],
  湖南省: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市'],
  福建省: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  山东省: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '临沂市'],
  河南省: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '新乡市', '焦作市', '许昌市', '南阳市', '信阳市'],
  河北省: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市'],
  陕西省: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市'],
  安徽省: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '安庆市', '黄山市', '滁州市', '阜阳市'],
  辽宁省: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市'],
  吉林省: ['长春市', '吉林市', '四平市', '通化市', '延边州'],
  黑龙江省: ['哈尔滨市', '齐齐哈尔市', '牡丹江市', '佳木斯市', '大庆市'],
  云南省: ['昆明市', '曲靖市', '玉溪市', '大理州', '丽江市', '西双版纳州'],
  贵州省: ['贵阳市', '遵义市', '六盘水市', '安顺市', '毕节市'],
  广西壮族自治区: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市'],
  海南省: ['海口市', '三亚市', '三沙市', '儋州市'],
  港澳台及海外: ['香港特别行政区', '澳门特别行政区', '台北市', '高雄市', '海外侨居地'],
};

const GLOBAL_BANKS = [
  '中国工商银行 (ICBC)',
  '中国建设银行 (CCB)',
  '中国农业银行 (ABC)',
  '中国银行 (BOC)',
  '招商银行 (CMB)',
  '交通银行 (BOCOM)',
  '中国邮政储蓄银行 (PSBC)',
  '中信银行 (CITIC)',
  '浦发银行 (SPDB)',
  '兴业银行 (CIB)',
  '中国民生银行 (CMBC)',
  '中国光大银行 (CEB)',
  '平安银行 (PAB)',
  '华夏银行 (HXB)',
  '北京银行 (BOB)',
  '上海银行 (BOSC)',
  '宁波银行 (NBCB)',
  '汇丰银行 (HSBC)',
  '花旗银行 (Citibank)',
  '渣打银行 (Standard Chartered)',
  '摩根大通银行 (JPMorgan Chase)',
  '美国银行 (Bank of America)',
  '星展银行 (DBS Bank)',
  '三菱日联银行 (MUFG Bank)',
  '瑞银集团 (UBS)',
  '德意志银行 (Deutsche Bank)',
];

const HOUSEHOLD_TYPES = ['本市城镇', '本市农村', '外埠城镇', '外埠农村'];
const MARITAL_STATUSES = ['未婚', '已婚', '已婚已育', '离异'];
const POLITICAL_STATUSES = ['群众', '共青团员', '中共党员', '中共预备党员', '民主党派'];
const JOB_LEVELS = ['暂无', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'M1', 'M2', 'M3', 'M4'];
const PROBATION_OPTIONS = ['1个月', '2个月', '3个月', '6个月'];
const EMPLOYMENT_TYPES = ['全职', '兼职', '劳务', '实习'];
const ID_DOC_TYPES = ['居民身份证', '护照', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '其他证件'];

const ATTACHMENT_SLOTS = [
  { key: 'idFront', label: '身份证（人像面）', required: true },
  { key: 'idBack', label: '身份证（国徽面）', required: true },
  { key: 'photo', label: '一寸免冠证件照', required: true },
  { key: 'diploma', label: '最高学历证书 / 学信网报告', required: true },
  { key: 'degree', label: '学位证书', required: false },
  { key: 'resignation', label: '上家单位离职证明', required: false },
  { key: 'bankFront', label: '工资卡正面扫描件', required: true },
  { key: 'bankBack', label: '工资卡背面扫描件', required: false },
  { key: 'medical', label: '入职体检合格报告', required: true },
  { key: 'skillCert', label: '技能附件（英语/计算机等证书）', required: false },
];

const SELF_SERVICE_CATEGORIES = {
  假勤申请: ['年假申请', '调休申请', '病假 / 事假', '婚假 / 产假 / 陪产假', '加班工时申报'],
  资产申领: ['办公电脑 / 显示器', '人体工学座椅 / 外设', '软件许可 / AI 算力账号', '办公耗材领用'],
  费用报销: ['差旅交通及住宿报销', '团队建设及业务招待', '外部培训及书籍报销', '日常办公垫付报销'],
  综合行政: ['公章 / 合同用印申请', '名片印制与门禁权限', '个人档案信息变更', '工牌补办申请'],
};

const AVATAR_STYLES = [
  'bg-[#E8F5E9] text-[#1E7E34]',
  'bg-[#FFF3E0] text-[#E65100]',
  'bg-[#E3F2FD] text-[#1565C0]',
  'bg-[#F3E5F5] text-[#6A1B9A]',
  'bg-[#FCE4EC] text-[#AD1457]',
  'bg-[#E0F2F1] text-[#00695C]',
];

// ==========================================
// 2. 辅助工具函数
// ==========================================
function calcAge(birthDate) {
  if (!birthDate) return '--';
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return '--';
  const now = new Date('2026-11-25');
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age >= 0 ? `${age} 岁` : '--';
}

function calcTenure(firstWorkDate) {
  if (!firstWorkDate) return '--';
  const start = new Date(firstWorkDate);
  if (Number.isNaN(start.getTime())) return '--';
  const now = new Date('2026-11-25');
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 0) return '0 年';
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return years > 0 ? `${years} 年 ${remMonths} 个月` : `${remMonths} 个月`;
}

function calcProbationEndDate(startDate, periodLabel) {
  if (!startDate || !periodLabel) return '';
  const months = parseInt(periodLabel, 10);
  if (Number.isNaN(months)) return '';
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function calcContractEndDate(startDate, years = 3) {
  if (!startDate) return '';
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return '';
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function addDaysToDate(dateStr, days) {
  if (!dateStr) return '2026-12-08';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '2026-12-08';
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function createEmptyEmployeeForm(overrides = {}) {
  const defaultHire = overrides.hireDate !== undefined ? overrides.hireDate : '2026-11-25';
  const defaultProbPeriod = overrides.probationPeriod !== undefined ? overrides.probationPeriod : '3个月';
  const defaultContractEnd =
    overrides.contractEnd !== undefined
      ? overrides.contractEnd
      : defaultHire
      ? calcContractEndDate(defaultHire, 3)
      : '';
  const defaultProbEnd =
    overrides.probationEndDate !== undefined
      ? overrides.probationEndDate
      : defaultHire
      ? calcProbationEndDate(defaultHire, defaultProbPeriod)
      : '';

  return {
    name: '',
    alias: '',
    gender: '',
    phone: '',
    email: '',
    birthDate: '',
    nationality: '中国',
    ethnicity: '',
    householdType: '',
    householdLocation: '',
    householdAddress: '',
    nativePlace: '浙江省 / 杭州市',
    politicalStatus: '群众',
    maritalStatus: '',
    firstWorkDate: '',
    bankCards: [
      {
        bankName: '招商银行 (CMB)',
        branchName: '',
        cardNumber: '',
        holderName: '',
        holderIdNumber: '',
        reservedPhone: '',
      },
    ],
    idDocs: [
      {
        docType: '居民身份证',
        docNumber: '',
        expiryDate: '2035-06-15',
      },
    ],
    educations: [
      {
        school: '',
        major: '',
        degreeLevel: '本科',
        studyMode: '全日制',
        degreeTitle: '学士',
        startDate: '2016-09-01',
        endDate: '2020-06-30',
      },
    ],
    emergencyContacts: [
      {
        name: '',
        relation: '父亲',
        phone: '',
      },
    ],
    familyMembers: [
      {
        name: '',
        relation: '母亲',
        gender: '女',
        phone: '',
        birthDate: '',
      },
    ],
    attachments: {},
    department: '技术部',
    role: '',
    manager: '陈嘉宁',
    type: '全职',
    status: '试用期',
    level: 'P5',
    hireDate: defaultHire,
    contractEnd: defaultContractEnd,
    probationPeriod: defaultProbPeriod,
    probationEndDate: defaultProbEnd,
    internStartDate: '2026-11-25',
    internEndDate: '2027-02-25',
    internDailyRate: 300,
    partTimePayUnit: '按天计酬 (元/天)',
    partTimePayRate: 500,
    probationBaseSalary: 16000,
    probationPerfSalary: 4000,
    baseSalary: 20000,
    perfSalary: 5000,
    contractEntity: '标准签约实体（默认租户）',
    renewalStatus: 'normal',
    ...overrides,
  };
}

// ==========================================
// 3. 初始高保真模拟数据（完全独立去品牌化）
// ==========================================
const INITIAL_EMPLOYEES = [
  createEmptyEmployeeForm({
    id: 'EMP001',
    name: '林晓梅',
    alias: 'May Lin',
    gender: '女',
    phone: '13810248801',
    email: 'xiaomei.lin@peopleos.io',
    birthDate: '1996-05-12',
    nativePlace: '北京市 / 朝阳区',
    householdLocation: '北京市朝阳区',
    householdAddress: '北京市朝阳区建国路 88 号',
    department: '内容创作部',
    role: 'AI 编剧',
    manager: '陈嘉宁',
    type: '全职',
    status: '正式员工',
    level: 'P6',
    hireDate: '2024-03-01',
    contractEnd: '2026-12-12',
    baseSalary: 22000,
    perfSalary: 5000,
    probationBaseSalary: 18000,
    probationPerfSalary: 4000,
    bankCards: [
      {
        bankName: '招商银行 (CMB)',
        branchName: '北京朝外支行',
        cardNumber: '6225880139481024',
        holderName: '林晓梅',
        holderIdNumber: '110105199605124321',
        reservedPhone: '13810248801',
      },
    ],
    idDocs: [{ docType: '居民身份证', docNumber: '110105199605124321', expiryDate: '2036-05-12' }],
    educations: [
      {
        school: '中国传媒大学',
        major: '戏剧影视文学',
        degreeLevel: '硕士',
        studyMode: '全日制',
        degreeTitle: '文学硕士',
        startDate: '2018-09-01',
        endDate: '2021-06-30',
      },
    ],
    emergencyContacts: [{ name: '林建国', relation: '父亲', phone: '13901012233' }],
    familyMembers: [{ name: '赵淑芬', relation: '母亲', gender: '女', phone: '13901012244', birthDate: '1969-10-08' }],
    attachments: { idFront: '身份证正面.jpg', idBack: '身份证背面.jpg', photo: '一寸证件照.jpg', diploma: '硕士学历证.pdf', bankFront: '招行卡正面.jpg', medical: '体检报告.pdf' },
  }),
  createEmptyEmployeeForm({
    id: 'EMP002',
    name: '张伟',
    alias: 'Wayne',
    gender: '男',
    phone: '13920487712',
    email: 'wei.zhang@peopleos.io',
    birthDate: '1998-09-20',
    nativePlace: '上海市 / 浦东新区',
    householdLocation: '上海市浦东新区',
    householdAddress: '上海市浦东新区张江高科技园区 18 号',
    department: '技术部',
    role: 'AI 视效工程师',
    manager: '陈嘉宁',
    type: '全职',
    status: '试用期',
    level: 'P5',
    hireDate: '2026-09-01',
    contractEnd: '2029-09-01',
    probationPeriod: '3个月',
    probationEndDate: '2026-12-01',
    baseSalary: 26000,
    perfSalary: 6000,
    probationBaseSalary: 21000,
    probationPerfSalary: 5000,
    bankCards: [
      {
        bankName: '中国工商银行 (ICBC)',
        branchName: '上海张江支行',
        cardNumber: '6222021001129843',
        holderName: '张伟',
        holderIdNumber: '310115199809201135',
        reservedPhone: '13920487712',
      },
    ],
    idDocs: [{ docType: '居民身份证', docNumber: '310115199809201135', expiryDate: '2038-09-20' }],
    educations: [
      {
        school: '上海交通大学',
        major: '数字媒体技术',
        degreeLevel: '本科',
        studyMode: '全日制',
        degreeTitle: '工学学士',
        startDate: '2016-09-01',
        endDate: '2020-06-30',
      },
    ],
    emergencyContacts: [{ name: '张海涛', relation: '父亲', phone: '13761239988' }],
    familyMembers: [{ name: '张海涛', relation: '父亲', gender: '男', phone: '13761239988', birthDate: '1970-03-15' }],
    attachments: { idFront: '身份证正面.jpg', idBack: '身份证背面.jpg', photo: '证件照.jpg', diploma: '本科学历.pdf', bankFront: '工行卡.jpg', medical: '体检报告.pdf' },
  }),
  createEmptyEmployeeForm({
    id: 'EMP003',
    name: '王芳',
    alias: 'Flora Wang',
    gender: '女',
    phone: '13788239910',
    email: 'fang.wang@peopleos.io',
    birthDate: '1995-08-22',
    nativePlace: '上海市 / 徐汇区',
    householdLocation: '上海市徐汇区',
    householdAddress: '上海市徐汇区漕溪北路 120 号',
    department: '视觉设计部',
    role: '视觉设计师',
    manager: '陈嘉宁',
    type: '全职',
    status: '正式员工',
    level: 'P5',
    hireDate: '2024-03-01',
    contractEnd: '2027-05-31',
    baseSalary: 19000,
    perfSalary: 4000,
    emergencyContacts: [{ name: '王明德', relation: '父亲', phone: '13817226655' }],
    familyMembers: [{ name: '李秀英', relation: '母亲', gender: '女', phone: '13817226688', birthDate: '1968-11-02' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP004',
    name: '陈嘉宁',
    alias: 'Jianing',
    gender: '男',
    phone: '13600991122',
    email: 'jianing.chen@peopleos.io',
    birthDate: '1992-02-14',
    nativePlace: '广东省 / 深圳市',
    householdLocation: '广东省深圳市南山区',
    householdAddress: '广东省深圳市南山区科技园南区 6 栋',
    department: '运营部',
    role: '内容运营总监',
    manager: '李明',
    type: '全职',
    status: '正式员工',
    level: 'M2',
    hireDate: '2024-03-01',
    contractEnd: '2027-09-30',
    baseSalary: 32000,
    perfSalary: 8000,
    emergencyContacts: [{ name: '陈文博', relation: '父亲', phone: '13510293847' }],
    familyMembers: [{ name: '陈文博', relation: '父亲', gender: '男', phone: '13510293847', birthDate: '1965-04-19' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP005',
    name: '李明',
    alias: 'Ming Li',
    gender: '男',
    phone: '13500116620',
    email: 'ming.li@peopleos.io',
    birthDate: '1993-11-08',
    nativePlace: '浙江省 / 杭州市',
    householdLocation: '浙江省杭州市西湖区',
    householdAddress: '浙江省杭州市西湖区教工路 18 号',
    department: '人力资源部',
    role: 'HR 主管',
    manager: '创始人直属',
    type: '全职',
    status: '正式员工',
    level: 'M1',
    hireDate: '2024-03-01',
    contractEnd: '2026-12-12',
    baseSalary: 25000,
    perfSalary: 6000,
    emergencyContacts: [{ name: '李建华', relation: '父亲', phone: '13957118899' }],
    familyMembers: [{ name: '周桂兰', relation: '母亲', gender: '女', phone: '13957118800', birthDate: '1967-08-12' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP006',
    name: '刘雨桐',
    alias: 'Yutong',
    gender: '女',
    phone: '13944120987',
    email: 'yutong.liu@peopleos.io',
    birthDate: '1998-04-17',
    ethnicity: '回族',
    householdType: '外埠城镇',
    nativePlace: '浙江省 / 杭州市',
    householdLocation: '浙江省杭州市西湖区',
    householdAddress: '浙江省杭州市西湖区文三路 90 号',
    department: '内容创作部',
    role: '分镜导演',
    manager: '陈嘉宁',
    type: '全职',
    status: '试用期',
    level: 'P5',
    hireDate: '2026-09-01',
    contractEnd: '2029-09-01',
    probationPeriod: '3个月',
    probationEndDate: '2026-12-01',
    baseSalary: 21000,
    perfSalary: 4500,
    emergencyContacts: [{ name: '刘振国', relation: '父亲', phone: '13868012345' }],
    familyMembers: [{ name: '马秀兰', relation: '母亲', gender: '女', phone: '13868012346', birthDate: '1971-01-25' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP007',
    name: '周予安',
    alias: 'Evan Zhou',
    gender: '男',
    phone: '13977315509',
    email: 'yuan.zhou@peopleos.io',
    birthDate: '1996-12-03',
    nativePlace: '江苏省 / 南京市',
    householdLocation: '江苏省南京市鼓楼区',
    householdAddress: '江苏省南京市鼓楼区中山北路 200 号',
    department: '技术部',
    role: '前端架构组长',
    manager: '陈嘉宁',
    type: '全职',
    status: '正式员工',
    level: 'P7',
    hireDate: '2024-03-01',
    contractEnd: '2027-05-31',
    baseSalary: 30000,
    perfSalary: 7500,
    emergencyContacts: [{ name: '周志强', relation: '父亲', phone: '13851409988' }],
    familyMembers: [{ name: '周志强', relation: '父亲', gender: '男', phone: '13851409988', birthDate: '1968-06-11' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP008',
    name: '苏婉清',
    alias: 'Claire Su',
    gender: '女',
    phone: '13588421093',
    email: 'wanqing.su@peopleos.io',
    birthDate: '1997-03-19',
    nativePlace: '四川省 / 成都市',
    householdLocation: '四川省成都市武侯区',
    householdAddress: '四川省成都市武侯区天府大道北段 966 号',
    department: '内容创作部',
    role: '项目制片人',
    manager: '陈嘉宁',
    type: '全职',
    status: '正式员工',
    level: 'P6',
    hireDate: '2024-06-15',
    contractEnd: '2027-06-14',
    baseSalary: 23000,
    perfSalary: 5000,
    emergencyContacts: [{ name: '苏建军', relation: '父亲', phone: '13880015544' }],
    familyMembers: [{ name: '苏建军', relation: '父亲', gender: '男', phone: '13880015544', birthDate: '1969-09-09' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP009',
    name: '陆泽宇',
    alias: 'Zeyu Lu',
    gender: '男',
    phone: '13766194420',
    email: 'zeyu.lu@peopleos.io',
    birthDate: '1995-01-28',
    nativePlace: '湖北省 / 武汉市',
    householdLocation: '湖北省武汉市洪山区',
    householdAddress: '湖北省武汉市洪山区珞喻路 1037 号',
    department: '技术部',
    role: 'AIGC 算法工程师',
    manager: '陈嘉宁',
    type: '全职',
    status: '正式员工',
    level: 'P7',
    hireDate: '2025-02-10',
    contractEnd: '2028-02-09',
    baseSalary: 34000,
    perfSalary: 8500,
    emergencyContacts: [{ name: '陆国平', relation: '父亲', phone: '13971023344' }],
    familyMembers: [{ name: '陆国平', relation: '父亲', gender: '男', phone: '13971023344', birthDate: '1967-02-17' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP010',
    name: '沈念安',
    alias: 'Nianan',
    gender: '女',
    phone: '18611234490',
    email: 'nianan.shen@peopleos.io',
    birthDate: '2003-07-11',
    nativePlace: '江苏省 / 苏州市',
    householdLocation: '江苏省苏州市工业园区',
    householdAddress: '江苏省苏州市工业园区星湖街 328 号',
    department: '视觉设计部',
    role: '概念原画实习生',
    manager: '王芳',
    type: '实习',
    status: '正式员工',
    level: '暂无',
    hireDate: '2026-10-12',
    contractEnd: '2027-04-11',
    internStartDate: '2026-10-12',
    internEndDate: '2027-04-11',
    internDailyRate: 280,
    baseSalary: 6000,
    perfSalary: 0,
    emergencyContacts: [{ name: '沈建国', relation: '父亲', phone: '13913507788' }],
    familyMembers: [{ name: '沈建国', relation: '父亲', gender: '男', phone: '13913507788', birthDate: '1974-05-03' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP011',
    name: '顾北辰',
    alias: 'Beichen',
    gender: '男',
    phone: '13899002211',
    email: 'beichen.gu@peopleos.io',
    birthDate: '1994-10-05',
    nativePlace: '福建省 / 厦门市',
    householdLocation: '福建省厦门市思明区',
    householdAddress: '福建省厦门市思明区软件园二期 33 号',
    department: '运营部',
    role: '海外增长顾问',
    manager: '陈嘉宁',
    type: '兼职',
    status: '正式员工',
    level: 'P6',
    hireDate: '2024-08-20',
    contractEnd: '2027-08-19',
    partTimePayUnit: '按月计酬 (元/月)',
    partTimePayRate: 14000,
    baseSalary: 14000,
    perfSalary: 0,
    emergencyContacts: [{ name: '顾海峰', relation: '父亲', phone: '13806009911' }],
    familyMembers: [{ name: '顾海峰', relation: '父亲', gender: '男', phone: '13806009911', birthDate: '1966-12-01' }],
  }),
  createEmptyEmployeeForm({
    id: 'EMP012',
    name: '赵子轩',
    alias: 'Zixuan',
    gender: '男',
    phone: '13522110099',
    email: 'zixuan.zhao@peopleos.io',
    birthDate: '1997-08-14',
    nativePlace: '山东省 / 青岛市',
    householdLocation: '山东省青岛市市南区',
    householdAddress: '山东省青岛市市南区香港中路 68 号',
    department: '技术部',
    role: '后端开发外包顾问',
    manager: '周予安',
    type: '劳务',
    status: '已离职',
    level: '暂无',
    hireDate: '2024-03-01',
    contractEnd: '2026-06-30',
    partTimePayUnit: '按天计酬 (元/天)',
    partTimePayRate: 900,
    baseSalary: 18000,
    perfSalary: 0,
    emergencyContacts: [{ name: '赵德明', relation: '父亲', phone: '13853201122' }],
    familyMembers: [{ name: '赵德明', relation: '父亲', gender: '男', phone: '13853201122', birthDate: '1970-07-20' }],
  }),
];

const INITIAL_ONBOARDING_TASKS = [
  {
    id: 'OB-2026-001',
    candidateName: '许知远',
    department: '内容创作部',
    role: 'AI 剧本策划',
    type: '全职',
    expectedDate: '2026-12-01',
    baseSalary: 20000,
    perfSalary: 4500,
    stage: '待核验入职材料',
    checklist: {
      idCard: true,
      diploma: true,
      resignationCert: false,
      bankCard: true,
      medicalReport: true,
    },
    remark: '前司离职证明原件将于报到当日补交，其余电子材料均已在线核验通过。',
  },
  {
    id: 'OB-2026-002',
    candidateName: '宋清欢',
    department: '技术部',
    role: 'ComfyUI 工作流研发工程师',
    type: '全职',
    expectedDate: '2026-12-08',
    baseSalary: 28000,
    perfSalary: 6000,
    stage: 'Offer 已签待建档',
    checklist: {
      idCard: true,
      diploma: true,
      resignationCert: true,
      bankCard: true,
      medicalReport: true,
    },
    remark: '五项入职前置资料已全部核验齐全，可随时办理正式建档并分配工号。',
  },
];

const INITIAL_LIFECYCLE_TASKS = [
  {
    id: 'LC-2026-001',
    type: '转正评估',
    employeeName: '张伟',
    employeeId: 'EMP002',
    department: '技术部',
    role: 'AI 视效工程师',
    detail: '试用期阶段性项目交付达标（渲染管线提效 22%），直属上级陈嘉宁已完成初评，等待 HR 终审确认。',
    stage: '待 HR 终审',
    effectiveDate: '2026-12-01',
    approver: '李明（HR 主管）',
  },
  {
    id: 'LC-2026-002',
    type: '转正评估',
    employeeName: '刘雨桐',
    employeeId: 'EMP006',
    department: '内容创作部',
    role: '分镜导演',
    detail: '主导完成 3 支 AIGC 短片动态分镜交付，直属上级已审批通过，等待 HR 归档生效。',
    stage: '待 HR 终审',
    effectiveDate: '2026-12-01',
    approver: '李明（HR 主管）',
  },
  {
    id: 'LC-2026-004',
    type: '内部调岗',
    employeeName: '周予安',
    employeeId: 'EMP007',
    department: '技术部',
    role: '前端架构组长',
    detail: '由「前端工程师」晋升调整为「前端架构组长」，薪资档位同步调整。',
    stage: '已生效归档',
    effectiveDate: '2026-11-15',
    approver: '李明（HR 主管）',
  },
];

const INITIAL_JOBS = [
  {
    id: 'JOB-101',
    title: '高级 AI 动画导演',
    department: '内容创作部',
    headcount: 2,
    location: '总部 · 现场办公',
    salaryRange: '30K - 40K · 14薪',
    applicants: 18,
    interviewing: 6,
    offers: 1,
    priority: '紧急招聘',
  },
  {
    id: 'JOB-102',
    title: 'ComfyUI 工作流研发工程师',
    department: '技术部',
    headcount: 1,
    location: '总部 / 混合办公',
    salaryRange: '28K - 38K · 15薪',
    applicants: 14,
    interviewing: 4,
    offers: 1,
    priority: '核心岗位',
  },
  {
    id: 'JOB-103',
    title: '品牌视觉资深设计师',
    department: '视觉设计部',
    headcount: 1,
    location: '总部 · 现场办公',
    salaryRange: '22K - 28K · 13薪',
    applicants: 9,
    interviewing: 3,
    offers: 0,
    priority: '常规招募',
  },
  {
    id: 'JOB-104',
    title: '海外社媒增长运营',
    department: '运营部',
    headcount: 1,
    location: '总部 · 现场办公',
    salaryRange: '18K - 25K · 13薪',
    applicants: 5,
    interviewing: 2,
    offers: 0,
    priority: '常规招募',
  },
];

const INITIAL_CANDIDATES = [
  {
    id: 'CAN-01',
    jobId: 'JOB-101',
    name: '唐子昂',
    jobTitle: '高级 AI 动画导演',
    department: '内容创作部',
    stage: 'Offer 待确认',
    score: '4.9',
    exp: '5年经验 · 影视动画',
    expectedSalary: '32K - 38K',
    availableDate: '2026-12-07',
    interviewer: '陈嘉宁',
    evaluation: '作品集视觉张力极强，精通 Sora/Runway/ComfyUI 混合工作流，团队文化高度契合。',
  },
  {
    id: 'CAN-02',
    jobId: 'JOB-102',
    name: '宋清欢',
    jobTitle: 'ComfyUI 工作流研发工程师',
    department: '技术部',
    stage: '终面通过',
    score: '4.8',
    exp: '4年经验 · 生成式AI',
    expectedSalary: '30K - 35K',
    availableDate: '2026-12-08',
    interviewer: '周予安',
    evaluation: '自定义节点开发能力扎实，具备高并发模型推理部署经验，建议直接发 Offer。',
  },
  {
    id: 'CAN-03',
    jobId: 'JOB-103',
    name: '叶知秋',
    jobTitle: '品牌视觉资深设计师',
    department: '视觉设计部',
    stage: '专业复试中',
    score: '4.5',
    exp: '6年经验 · 互联网设计',
    expectedSalary: '24K - 28K',
    availableDate: '2026-12-15',
    interviewer: '王芳',
    evaluation: '品牌 VI 体系搭建成熟，已安排本周四与业务总监进行终面沟通。',
  },
  {
    id: 'CAN-04',
    jobId: 'JOB-104',
    name: '韩牧野',
    jobTitle: '海外社媒增长运营',
    department: '运营部',
    stage: '初试筛选',
    score: '4.3',
    exp: '3年经验 · 出海投放',
    expectedSalary: '20K - 25K',
    availableDate: '随时到岗',
    interviewer: '陈嘉宁',
    evaluation: '具备 TikTok / YouTube Shorts 百万级播放操盘经验，待进入业务初试。',
  },
];

const INITIAL_PERF_RECORDS = [
  {
    id: 'EMP001',
    name: '林晓梅',
    department: '内容创作部',
    role: 'AI 编剧',
    okrProgress: 94,
    selfEval: '已提交',
    grade: 'S (4.9)',
    status: '已校准',
    okrSummary: '主导 4 部 S 级短剧剧本创作，平均完播率提升 24%；沉淀 12 套 AI 剧本提示词模板。',
    managerComment: '产出质量与效率均居部门首位，具备极强的创新驱动力。',
  },
  {
    id: 'EMP003',
    name: '王芳',
    department: '视觉设计部',
    role: '视觉设计师',
    okrProgress: 88,
    selfEval: '已提交',
    grade: 'A (4.6)',
    status: '已校准',
    okrSummary: '完成品牌视觉 3.0 升级规范交付，设计需求按时交付率 100%。',
    managerComment: '视觉把控细腻稳健，跨团队协作响应迅速。',
  },
  {
    id: 'EMP004',
    name: '陈嘉宁',
    department: '运营部',
    role: '内容运营总监',
    okrProgress: 92,
    selfEval: '已提交',
    grade: 'S (4.8)',
    status: '已校准',
    okrSummary: '达成季度全渠道粉丝增长 145% 目标，商业化投放 ROI 提升至 3.4。',
    managerComment: '团队管理与商业增长结果双优，发挥了核心骨干带头作用。',
  },
  {
    id: 'EMP005',
    name: '李明',
    department: '人力资源部',
    role: 'HR 主管',
    okrProgress: 95,
    selfEval: '已提交',
    grade: 'S (4.9)',
    status: '已校准',
    okrSummary: '完成核心组织人才盘点与 PeopleOS 数字化人事底座上线，关键岗位到岗周期缩短 32%。',
    managerComment: '组织架构搭建与人才密度提升成效显著。',
  },
  {
    id: 'EMP007',
    name: '周予安',
    department: '技术部',
    role: '前端架构组长',
    okrProgress: 96,
    selfEval: '已提交',
    grade: 'S (4.9)',
    status: '已校准',
    okrSummary: '完成工作台核心架构重构，首屏加载耗时降低 62%，零线上重大故障。',
    managerComment: '技术前瞻性与工程落地能力出众，已晋升为前端架构组长。',
  },
  {
    id: 'EMP009',
    name: '陆泽宇',
    department: '技术部',
    role: 'AIGC 算法工程师',
    okrProgress: 90,
    selfEval: '已提交',
    grade: 'A (4.7)',
    status: '待终审',
    okrSummary: '完成视频生成推理速度优化 1.8 倍，显存占用下降 30%。',
    managerComment: '核心算法突破显著，建议评定为 A 级以上。',
  },
  {
    id: 'EMP002',
    name: '张伟',
    department: '技术部',
    role: 'AI 视效工程师',
    okrProgress: 82,
    selfEval: '已提交',
    grade: 'A (4.7)',
    status: '已校准',
    okrSummary: '已接入渲染农场自动化管线，主导完成两套渲染集群提效。',
    managerComment: '试用期季度考核综合评定 4.7 分，建议如期转正。',
  },
];

// ==========================================
// 4. 通用基础组件
// ==========================================
function AppleActionButton({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  type = 'button',
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-medium rounded-xl transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none cursor-pointer';
  const variants = {
    primary: 'bg-[#1D1D1F] text-white hover:bg-[#333336] shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
    blue: 'bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-[0_1px_3px_rgba(0,113,227,0.28)]',
    secondary:
      'bg-white text-[#1D1D1F] border border-black/[0.08] hover:bg-[#F5F5F7] shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    subtle: 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]',
    danger: 'bg-[#FFF2F2] text-[#D70015] border border-[#FF3B30]/20 hover:bg-[#FFE5E5]',
  };
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-[13px]',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.secondary} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className={size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const config = {
    正式员工: { bg: 'bg-[#EAF8EE]', text: 'text-[#1E7E34]', dot: 'bg-[#34C759]' },
    试用期: { bg: 'bg-[#FFF5E6]', text: 'text-[#B25E00]', dot: 'bg-[#FF9500]' },
    已离职: { bg: 'bg-[#F2F2F7]', text: 'text-[#6E6E73]', dot: 'bg-[#8E8E93]' },
    即将到期: { bg: 'bg-[#FFF5E6]', text: 'text-[#B25E00]', dot: 'bg-[#FF9500]' },
    不再续签: { bg: 'bg-[#FFF2F2]', text: 'text-[#D70015]', dot: 'bg-[#FF3B30]' },
    正常履行中: { bg: 'bg-[#EAF8EE]', text: 'text-[#1E7E34]', dot: 'bg-[#34C759]' },
    待补全材料: { bg: 'bg-[#FFF5E6]', text: 'text-[#B25E00]', dot: 'bg-[#FF9500]' },
    已驳回: { bg: 'bg-[#FFF2F2]', text: 'text-[#D70015]', dot: 'bg-[#FF3B30]' },
  };
  const current = config[status] || {
    bg: 'bg-[#EBF5FF]',
    text: 'text-[#0071E3]',
    dot: 'bg-[#0071E3]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${current.bg} ${current.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {status}
    </span>
  );
}

// 通用一二级级联悬浮菜单组件（用于省市籍贯 & 员工自助业务类型）
function TwoLevelCascader({ value, onChange, dataMap, placeholder = '请选择', disabled = false }) {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(dataMap);
  const initialFirst = value && value.includes(' / ') ? value.split(' / ')[0] : keys[0];
  const [activeFirst, setActiveFirst] = useState(keys.includes(initialFirst) ? initialFirst : keys[0]);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const secondOptions = dataMap[activeFirst] || [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent text-left text-xs flex items-center justify-between transition-all ${
          disabled
            ? 'opacity-75 cursor-default'
            : 'hover:bg-[#EFEFF4] focus:bg-white focus:border-[#0071E3] cursor-pointer'
        }`}
      >
        <span className={value ? 'text-[#1D1D1F] font-medium' : 'text-[#86868B]'}>
          {value || placeholder}
        </span>
        {!disabled && <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />}
      </button>

      {open && !disabled && (
        <div className="absolute left-0 mt-1.5 w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-[0_16px_44px_rgba(0,0,0,0.16)] border border-black/[0.08] overflow-hidden z-50 grid grid-cols-2">
          <div className="max-h-64 overflow-y-auto border-r border-black/[0.06] bg-[#FAFAFC] p-1.5 space-y-0.5">
            {keys.map((k) => (
              <div
                key={k}
                onMouseEnter={() => setActiveFirst(k)}
                onClick={() => setActiveFirst(k)}
                className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  activeFirst === k
                    ? 'bg-[#0071E3] text-white font-semibold'
                    : 'text-[#1D1D1F] hover:bg-black/[0.04]'
                }`}
              >
                <span className="truncate">{k}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </div>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 bg-white">
            {secondOptions.map((sub) => {
              const fullVal = `${activeFirst} / ${sub}`;
              const isSelected = value === fullVal;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    onChange(fullVal);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs text-left flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#EBF5FF] text-[#0071E3] font-semibold'
                      : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  <span className="truncate">{sub}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#0071E3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. 飞书标准 7+1 人员全息档案表单组件（新增建档 & 查看编辑共用）
// ==========================================
function EmployeeStandardFormSections({ form, setForm, readOnly = false }) {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: '个人信息', required: true },
    { id: 'bank', label: '银行卡信息', required: true },
    { id: 'idDocs', label: '证件信息', required: true },
    { id: 'education', label: '教育经历', required: true },
    { id: 'emergency', label: '紧急联系人', required: true },
    { id: 'family', label: '家庭成员', required: true },
    { id: 'attachments', label: '资料附件', required: true },
    { id: 'jobPayroll', label: '岗位与薪酬', required: true },
  ];

  const inputClass = `w-full px-3.5 py-2.5 rounded-xl text-xs transition-all outline-none ${
    readOnly
      ? 'bg-[#F5F5F7]/80 text-[#1D1D1F] cursor-default'
      : 'bg-[#F5F5F7] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3]'
  }`;

  const updateField = (key, val) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'hireDate' && next.type === '全职') {
        next.probationEndDate = calcProbationEndDate(val, next.probationPeriod);
        next.contractEnd = calcContractEndDate(val, 3);
      } else if (key === 'probationPeriod' && next.type === '全职') {
        next.probationEndDate = calcProbationEndDate(next.hireDate, val);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[470px] max-h-[68vh]">
      {/* 左侧目录导航 */}
      <div className="w-full md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-black/[0.06] bg-[#FAFAFC] p-3 flex md:flex-col gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-[#EBF5FF] text-[#0071E3] font-semibold'
                  : 'text-[#515154] hover:bg-black/[0.04]'
              }`}
            >
              <span>
                {t.label}
                {t.required && <span className="text-[#FF3B30] ml-0.5">*</span>}
              </span>
              {active && <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#0071E3]" />}
            </button>
          );
        })}
      </div>

      {/* 右侧表单内容区 */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
              个人信息
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  姓名 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="请输入真实姓名"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">别名 / 英文名</label>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="请输入别名或花名"
                  value={form.alias}
                  onChange={(e) => updateField('alias', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  性别 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.gender}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-[#6E6E73]">
                    手机号码 <span className="text-[#FF3B30]">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      form.phone.length === 11 ? 'text-[#248A3D]' : 'text-[#86868B]'
                    }`}
                  >
                    {form.phone.length}/11 位数字
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-2.5 rounded-xl bg-[#EFEFF4] text-xs font-medium text-[#6E6E73]">
                    +86
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    disabled={readOnly}
                    placeholder="请输入 11 位手机号码"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">个人邮箱</label>
                <input
                  type="email"
                  disabled={readOnly}
                  placeholder="用于接收电子工资条与入职通知"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  出生日期 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.birthDate}
                  onChange={(e) => updateField('birthDate', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  年龄（根据出生日期自动计算）
                </label>
                <input
                  type="text"
                  disabled
                  value={form.birthDate ? calcAge(form.birthDate) : '—'}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  民族 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.ethnicity}
                  onChange={(e) => updateField('ethnicity', e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  {ETHNIC_GROUPS.map((eth) => (
                    <option key={eth} value={eth}>
                      {eth}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  户口类型 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.householdType}
                  onChange={(e) => updateField('householdType', e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  {HOUSEHOLD_TYPES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  婚姻状况 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                  className={inputClass}
                >
                  <option value="">请选择</option>
                  {MARITAL_STATUSES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  首次参加工作日期 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={form.firstWorkDate}
                  onChange={(e) => updateField('firstWorkDate', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  累计工龄（自动计算）
                </label>
                <input
                  type="text"
                  disabled
                  value={form.firstWorkDate ? calcTenure(form.firstWorkDate) : '—'}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                银行卡信息
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField('bankCards', [
                      ...form.bankCards,
                      {
                        bankName: '招商银行 (CMB)',
                        branchName: '',
                        cardNumber: '',
                        holderName: form.name || '',
                        holderIdNumber: '',
                        reservedPhone: form.phone || '',
                      },
                    ])
                  }
                >
                  添加银行卡
                </AppleActionButton>
              )}
            </div>
            {form.bankCards.map((card, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">银行卡信息 {idx + 1}</span>
                  {!readOnly && form.bankCards.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'bankCards',
                          form.bankCards.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      银行卡号 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={readOnly}
                      placeholder="请输入储蓄卡号"
                      value={card.cardNumber}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, cardNumber: e.target.value.replace(/\D/g, '') };
                        updateField('bankCards', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      持卡人姓名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入持卡人姓名"
                      value={card.holderName}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, holderName: e.target.value };
                        updateField('bankCards', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        持卡人身份证号 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          (card.holderIdNumber || '').length === 18 ? 'text-[#248A3D]' : 'text-[#86868B]'
                        }`}
                      >
                        {(card.holderIdNumber || '').length}/18 位数字
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={18}
                      disabled={readOnly}
                      placeholder="请输入 18 位身份证号"
                      value={card.holderIdNumber || ''}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = {
                          ...card,
                          holderIdNumber: e.target.value.replace(/\D/g, '').slice(0, 18),
                        };
                        updateField('bankCards', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      所属银行（全球银行列表） <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={card.bankName}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, bankName: e.target.value };
                        updateField('bankCards', list);
                      }}
                      className={inputClass}
                    >
                      {GLOBAL_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      详细支行名称 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="例如：北京朝外支行 / 杭州高新支行"
                      value={card.branchName}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = { ...card, branchName: e.target.value };
                        updateField('bankCards', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        银行预留手机号 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          (card.reservedPhone || '').length === 11 ? 'text-[#248A3D]' : 'text-[#86868B]'
                        }`}
                      >
                        {(card.reservedPhone || '').length}/11 位数字
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      disabled={readOnly}
                      placeholder="请输入 11 位银行预留手机号"
                      value={card.reservedPhone || ''}
                      onChange={(e) => {
                        const list = [...form.bankCards];
                        list[idx] = {
                          ...card,
                          reservedPhone: e.target.value.replace(/\D/g, '').slice(0, 11),
                        };
                        updateField('bankCards', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'idDocs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                证件信息（居民身份证限制 18 位纯数字，其他证件不限）
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField('idDocs', [
                      ...form.idDocs,
                      { docType: '护照', docNumber: '', expiryDate: '2035-01-01' },
                    ])
                  }
                >
                  添加证件信息
                </AppleActionButton>
              )}
            </div>
            {form.idDocs.map((doc, idx) => {
              const isResidentId = doc.docType === '居民身份证';
              return (
                <div key={idx} className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F]">证件信息 {idx + 1}</span>
                    {!readOnly && form.idDocs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            'idDocs',
                            form.idDocs.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-xs text-[#D70015] hover:underline cursor-pointer"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        证件类型 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <select
                        disabled={readOnly}
                        value={doc.docType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const list = [...form.idDocs];
                          list[idx] = {
                            ...doc,
                            docType: newType,
                            docNumber:
                              newType === '居民身份证'
                                ? doc.docNumber.replace(/\D/g, '').slice(0, 18)
                                : doc.docNumber,
                          };
                          updateField('idDocs', list);
                        }}
                        className={inputClass}
                      >
                        {ID_DOC_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-[#6E6E73]">
                          证件号码 <span className="text-[#FF3B30]">*</span>
                        </label>
                        {isResidentId ? (
                          <span
                            className={`text-[10px] font-mono ${
                              doc.docNumber.length === 18 ? 'text-[#248A3D]' : 'text-[#86868B]'
                            }`}
                          >
                            {doc.docNumber.length}/18 位数字
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#0071E3]">不限格式</span>
                        )}
                      </div>
                      <input
                        type="text"
                        inputMode={isResidentId ? 'numeric' : 'text'}
                        maxLength={isResidentId ? 18 : 40}
                        disabled={readOnly}
                        placeholder={isResidentId ? '请输入 18 位纯数字身份证号' : '请输入证件号码'}
                        value={doc.docNumber}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const formatted = isResidentId ? raw.replace(/\D/g, '').slice(0, 18) : raw;
                          const list = [...form.idDocs];
                          list[idx] = { ...doc, docNumber: formatted };
                          updateField('idDocs', list);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        有效期至 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <input
                        type="date"
                        disabled={readOnly}
                        value={doc.expiryDate}
                        onChange={(e) => {
                          const list = [...form.idDocs];
                          list[idx] = { ...doc, expiryDate: e.target.value };
                          updateField('idDocs', list);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                教育经历
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField('educations', [
                      ...form.educations,
                      {
                        school: '',
                        major: '',
                        degreeLevel: '本科',
                        studyMode: '全日制',
                        degreeTitle: '学士',
                        startDate: '2016-09-01',
                        endDate: '2020-06-30',
                      },
                    ])
                  }
                >
                  添加教育经历
                </AppleActionButton>
              )}
            </div>
            {form.educations.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">教育经历 {idx + 1}</span>
                  {!readOnly && form.educations.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'educations',
                          form.educations.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      学历 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={edu.degreeLevel}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, degreeLevel: e.target.value };
                        updateField('educations', list);
                      }}
                      className={inputClass}
                    >
                      <option value="博士">博士</option>
                      <option value="硕士">硕士</option>
                      <option value="本科">本科</option>
                      <option value="大专">大专</option>
                      <option value="高中及以下">高中及以下</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      学习形式 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={edu.studyMode || '全日制'}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, studyMode: e.target.value };
                        updateField('educations', list);
                      }}
                      className={inputClass}
                    >
                      <option value="全日制">全日制</option>
                      <option value="非全日制">非全日制</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      毕业院校 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入学校全称"
                      value={edu.school}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, school: e.target.value };
                        updateField('educations', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      所学专业 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入专业名称"
                      value={edu.major}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, major: e.target.value };
                        updateField('educations', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      开始日期 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={edu.startDate}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, startDate: e.target.value };
                        updateField('educations', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      结束日期 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={edu.endDate}
                      onChange={(e) => {
                        const list = [...form.educations];
                        list[idx] = { ...edu, endDate: e.target.value };
                        updateField('educations', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                紧急联系人
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField('emergencyContacts', [
                      ...form.emergencyContacts,
                      { name: '', relation: '配偶', phone: '' },
                    ])
                  }
                >
                  添加紧急联系人
                </AppleActionButton>
              )}
            </div>
            {form.emergencyContacts.map((ec, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">紧急联系人 {idx + 1}</span>
                  {!readOnly && form.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'emergencyContacts',
                          form.emergencyContacts.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      姓名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入联系人姓名"
                      value={ec.name}
                      onChange={(e) => {
                        const list = [...form.emergencyContacts];
                        list[idx] = { ...ec, name: e.target.value };
                        updateField('emergencyContacts', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      关系 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={ec.relation}
                      onChange={(e) => {
                        const list = [...form.emergencyContacts];
                        list[idx] = { ...ec, relation: e.target.value };
                        updateField('emergencyContacts', list);
                      }}
                      className={inputClass}
                    >
                      <option value="父亲">父亲</option>
                      <option value="母亲">母亲</option>
                      <option value="配偶">配偶</option>
                      <option value="兄弟姐妹">兄弟姐妹</option>
                      <option value="其他亲属">其他亲属</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        联系电话 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#86868B]">{ec.phone.length}/11 位</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      disabled={readOnly}
                      placeholder="请输入 11 位手机号码"
                      value={ec.phone}
                      onChange={(e) => {
                        const list = [...form.emergencyContacts];
                        list[idx] = { ...ec, phone: e.target.value.replace(/\D/g, '').slice(0, 11) };
                        updateField('emergencyContacts', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'family' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
                家庭成员（必填至少一位直系亲属：父母 / 兄弟姐妹）
              </h4>
              {!readOnly && (
                <AppleActionButton
                  size="xs"
                  icon={Plus}
                  onClick={() =>
                    updateField('familyMembers', [
                      ...form.familyMembers,
                      { name: '', relation: '父亲', gender: '男', phone: '', birthDate: '' },
                    ])
                  }
                >
                  添加家庭成员
                </AppleActionButton>
              )}
            </div>
            {form.familyMembers.map((fm, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    家庭成员 {idx + 1} {idx === 0 && <span className="text-[#FF3B30]">*（必填）</span>}
                  </span>
                  {!readOnly && form.familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'familyMembers',
                          form.familyMembers.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-xs text-[#D70015] hover:underline cursor-pointer"
                    >
                      删除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      姓名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      placeholder="请输入家庭成员姓名"
                      value={fm.name}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, name: e.target.value };
                        updateField('familyMembers', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      与本人关系 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={fm.relation}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, relation: e.target.value };
                        updateField('familyMembers', list);
                      }}
                      className={inputClass}
                    >
                      <option value="父亲">父亲</option>
                      <option value="母亲">母亲</option>
                      <option value="兄弟">兄弟</option>
                      <option value="姐妹">姐妹</option>
                      <option value="配偶">配偶</option>
                      <option value="子女">子女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                      性别 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      disabled={readOnly}
                      value={fm.gender}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, gender: e.target.value };
                        updateField('familyMembers', list);
                      }}
                      className={inputClass}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#6E6E73]">
                        联系电话 <span className="text-[#FF3B30]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#86868B]">{fm.phone.length}/11 位</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      disabled={readOnly}
                      placeholder="请输入 11 位手机号码"
                      value={fm.phone}
                      onChange={(e) => {
                        const list = [...form.familyMembers];
                        list[idx] = { ...fm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) };
                        updateField('familyMembers', list);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
              资料附件（支持 JPEG / JPG / PNG / PDF / DOC / DOCX，单文件 ≤ 50MB）
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ATTACHMENT_SLOTS.map((slot) => {
                const uploadedFile = form.attachments?.[slot.key];
                return (
                  <div
                    key={slot.key}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      uploadedFile
                        ? 'bg-[#F2FBF4] border-[#34C759]/25'
                        : 'bg-[#FAFAFC] border-black/[0.06]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {slot.label}
                        {slot.required && <span className="text-[#FF3B30] ml-0.5">*</span>}
                      </div>
                      <div className="text-[11px] text-[#86868B] truncate mt-0.5">
                        {uploadedFile ? `已归档：${uploadedFile}` : '暂未上传附件'}
                      </div>
                    </div>
                    {!readOnly && (
                      <label className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] cursor-pointer">
                        {uploadedFile ? '替换' : '上传'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              updateField('attachments', {
                                ...(form.attachments || {}),
                                [slot.key]: f.name,
                              });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'jobPayroll' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#0071E3]" />
              岗位与薪酬定级
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  所属部门 <span className="text-[#FF3B30]">*</span>
                </label>
                <select
                  disabled={readOnly}
                  value={form.department}
                  onChange={(e) => updateField('department', e.target.value)}
                  className={inputClass}
                >
                  {DEPARTMENTS.filter((d) => d !== '全部部门').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  岗位名称 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  placeholder="例如：高级产品交互设计师"
                  value={form.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  直属上级 <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={form.manager}
                  onChange={(e) => updateField('manager', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  岗位职级
                </label>
                <select
                  disabled={readOnly}
                  value={form.level}
                  onChange={(e) => updateField('level', e.target.value)}
                  className={inputClass}
                >
                  {JOB_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                  员工类型 <span className="text-[#FF3B30]">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {EMPLOYMENT_TYPES.map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateField('type', tp)}
                      className={`py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        form.type === tp
                          ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                          : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                      }`}
                    >
                      {tp}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === '全职' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      劳动合同开始时间 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.hireDate}
                      onChange={(e) => updateField('hireDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      劳动合同结束时间（默认整 3 年）
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.contractEnd}
                      onChange={(e) => updateField('contractEnd', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期周期
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PROBATION_OPTIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          disabled={readOnly}
                          onClick={() => updateField('probationPeriod', p)}
                          className={`py-2 rounded-xl text-[11px] font-semibold border cursor-pointer ${
                            form.probationPeriod === p
                              ? 'bg-[#0071E3] text-white border-[#0071E3]'
                              : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期结束时间（整月自动计算）
                    </label>
                    <input
                      type="date"
                      disabled
                      value={form.probationEndDate}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期底薪（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.probationBaseSalary}
                      onChange={(e) => updateField('probationBaseSalary', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      试用期绩效基数（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.probationPerfSalary}
                      onChange={(e) => updateField('probationPerfSalary', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      转正底薪（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.baseSalary}
                      onChange={(e) => updateField('baseSalary', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      转正绩效基数（元/月）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.perfSalary}
                      onChange={(e) => updateField('perfSalary', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {form.type === '实习' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      实习期开始时间
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.internStartDate}
                      onChange={(e) => updateField('internStartDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      实习期结束时间
                    </label>
                    <input
                      type="date"
                      disabled={readOnly}
                      value={form.internEndDate}
                      onChange={(e) => updateField('internEndDate', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      实习补贴 / 实习报酬（元/天）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.internDailyRate}
                      onChange={(e) => updateField('internDailyRate', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {(form.type === '劳务' || form.type === '兼职') && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      计薪标准模式
                    </label>
                    <select
                      disabled={readOnly}
                      value={form.partTimePayUnit}
                      onChange={(e) => updateField('partTimePayUnit', e.target.value)}
                      className={inputClass}
                    >
                      <option value="按天计酬 (元/天)">按天计酬 (元/天)</option>
                      <option value="按月计酬 (元/月)">按月计酬 (元/月)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      协议报酬金额（{form.partTimePayUnit}）
                    </label>
                    <input
                      type="number"
                      disabled={readOnly}
                      value={form.partTimePayRate}
                      onChange={(e) => updateField('partTimePayRate', Number(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. 核心人事各业务模块页面组件
// ==========================================
function DashboardOverview({
  employees,
  onboardingTasks,
  lifecycleTasks,
  onNavigate,
  onOpenNewModal,
  role,
  currentUser,
}) {
  const isEmployee = role === '普通员工';
  const isHr = role === 'HR 主管';
  const activeEmps = employees.filter((e) => e.status !== '已离职');
  const probationCount = activeEmps.filter((e) => e.status === '试用期').length;
  const expiringCount = activeEmps.filter((e) => e.contractEnd <= '2026-12-31').length;
  const pendingLifecycleCount = lifecycleTasks.filter((t) => t.stage !== '已生效归档').length;

  const deptList = ['内容创作部', '技术部', '视觉设计部', '运营部', '人力资源部'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            {isEmployee ? 'PERSONAL WORKSPACE' : 'EXECUTIVE OVERVIEW'}
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {isEmployee ? '我的工作台' : '人事工作台'}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            早安，{currentUser.name}。
            {isEmployee
              ? '以下为您的个人在职状态、本月出勤与快捷自助服务入口。'
              : '以下是当前组织架构健康度与核心人事待办摘要。'}
          </p>
        </div>

        {isHr && (
          <div className="flex items-center gap-2.5">
            <AppleActionButton icon={Users} onClick={() => onNavigate('employees')}>
              管理员工档案
            </AppleActionButton>
            <AppleActionButton variant="primary" icon={Plus} onClick={onOpenNewModal}>
              快速办理入职
            </AppleActionButton>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => !isEmployee && onNavigate('employees')}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>{isEmployee ? '当前在职状态' : '在编总人数'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-3 tabular-nums">
            {isEmployee ? currentUser.status : `${activeEmps.length} 人`}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            {isEmployee
              ? `${currentUser.department} · ${currentUser.role}`
              : `含试用期 ${probationCount} 人`}
          </div>
        </div>

        <div
          onClick={() => onNavigate(isEmployee ? 'self-service' : 'lifecycle')}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>{isEmployee ? '剩余法定年假' : '待处理入转调离'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#0071E3] mt-3 tabular-nums">
            {isEmployee
              ? '8.5 天'
              : `${
                  onboardingTasks.filter((t) => t.stage !== '已完成入职建档').length +
                  pendingLifecycleCount
                } 项`}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            {isEmployee ? '可用调休余额 12.0 小时' : '点击进入入职与转调离审批'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('contracts')}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>{isEmployee ? '我的合同到期日' : '30天内合同到期'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#D97706] mt-3 tabular-nums">
            {isEmployee ? currentUser.contractEnd : `${expiringCount} 份`}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1.5">
            {isEmployee ? currentUser.contractEntity : '建议提前发起电子续签沟通'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#86868B]">
            <span>本月出勤合规率</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold text-[#248A3D] mt-3 tabular-nums">99.4%</div>
          <div className="text-[11px] text-[#86868B] mt-1.5">全员考勤异常 0 条待申诉</div>
        </div>
      </div>

      {!isEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1D1D1F]">部门在职人数分布</h2>
              {isHr && (
                <AppleActionButton size="xs" onClick={() => onNavigate('employees')}>
                  查看完整花名册
                </AppleActionButton>
              )}
            </div>
            <div className="space-y-3.5">
              {deptList.map((dept) => {
                const count = activeEmps.filter((e) => e.department === dept).length;
                const pct = activeEmps.length ? Math.round((count / activeEmps.length) * 100) : 0;
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1D1D1F]">{dept}</span>
                      <span className="text-[#6E6E73] font-mono">
                        {count} 人 ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F5F5F7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1D1D1F] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-[#1D1D1F]">高频人事快捷办理</h2>
            <div className="space-y-2.5">
              {[
                {
                  title: '查看全员员工花名册',
                  sub: `共 ${employees.length} 名伙伴完整建档`,
                  target: 'employees',
                  show: isHr,
                },
                {
                  title: '办理新员工入职核验',
                  sub: `${onboardingTasks.length} 项待报到入职记录`,
                  target: 'onboarding',
                  show: isHr,
                },
                {
                  title: '审批入转调离流程',
                  sub: `${pendingLifecycleCount} 项待审批异动流程`,
                  target: 'lifecycle',
                  show: true,
                },
                {
                  title: '一键生成证明文件',
                  sub: '支持导出无章版 PDF 与 Word',
                  target: 'certificates',
                  show: isHr,
                },
              ]
                .filter((x) => x.show)
                .map((item) => (
                  <button
                    key={item.title}
                    onClick={() => onNavigate(item.target)}
                    className="w-full p-3.5 rounded-xl bg-[#FAFAFC] hover:bg-[#F5F5F7] border border-black/[0.05] flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1D1D1F]">{item.title}</div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">{item.sub}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#86868B]" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeesDirectoryView({
  employees,
  onSelectEmployee,
  onOpenNewModal,
  onExportCsv,
  isSelfOnly = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('全部部门');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [hireMonthFilter, setHireMonthFilter] = useState('入职年月');
  const [categoryPill, setCategoryPill] = useState('全部员工');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const pillCounts = useMemo(
    () => ({
      全部员工: employees.length,
      正式员工: employees.filter((e) => e.status === '正式员工').length,
      试用期: employees.filter((e) => e.status === '试用期').length,
      兼职: employees.filter((e) => e.type === '兼职').length,
      劳务: employees.filter((e) => e.type === '劳务').length,
      实习生: employees.filter((e) => e.type === '实习').length,
      已离职: employees.filter((e) => e.status === '已离职').length,
    }),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (categoryPill === '正式员工' && emp.status !== '正式员工') return false;
      if (categoryPill === '试用期' && emp.status !== '试用期') return false;
      if (categoryPill === '已离职' && emp.status !== '已离职') return false;
      if (categoryPill === '兼职' && emp.type !== '兼职') return false;
      if (categoryPill === '劳务' && emp.type !== '劳务') return false;
      if (categoryPill === '实习生' && emp.type !== '实习') return false;

      if (deptFilter !== '全部部门' && emp.department !== deptFilter) return false;
      if (statusFilter !== '全部状态' && emp.status !== statusFilter) return false;
      if (hireMonthFilter !== '入职年月' && !emp.hireDate.startsWith(hireMonthFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          emp.name.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [employees, categoryPill, deptFilter, statusFilter, hireMonthFilter, searchQuery]);

  const pills = [
    { key: '全部员工', dot: null },
    { key: '正式员工', dot: 'bg-[#34C759]' },
    { key: '试用期', dot: 'bg-[#FF9500]' },
    { key: '兼职', dot: 'bg-[#0071E3]' },
    { key: '劳务', dot: 'bg-[#5856D6]' },
    { key: '实习生', dot: 'bg-[#AF52DE]' },
    { key: '已离职', dot: 'bg-[#8E8E93]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            {isSelfOnly ? 'MY PROFILE' : 'PEOPLE DIRECTORY'}
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {isSelfOnly ? '我的档案' : '员工档案'}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {isSelfOnly
              ? '查看本人入职建档信息、教育背景、银行卡与劳动合同周期。'
              : '每一位伙伴，都是团队不可或缺的一部分。'}
          </p>
        </div>

        {!isSelfOnly && (
          <div className="flex items-center gap-2.5">
            <AppleActionButton icon={Download} onClick={onExportCsv}>
              导出报表
            </AppleActionButton>
            <AppleActionButton variant="primary" icon={Plus} onClick={onOpenNewModal}>
              新增员工
            </AppleActionButton>
          </div>
        )}
      </div>

      {/* 全维度员工类型与状态展陈胶囊栏 */}
      {!isSelfOnly && (
        <div className="flex flex-wrap items-center gap-2">
          {pills.map((p) => {
            const active = categoryPill === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setCategoryPill(p.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1D1D1F] text-white shadow-2xs'
                    : 'bg-white text-[#515154] border border-black/[0.06] hover:bg-[#FAFAFC]'
                }`}
              >
                {p.dot && <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />}
                <span>{p.key}</span>
                <span className={`font-mono ${active ? 'text-white/80' : 'text-[#86868B]'}`}>
                  {pillCounts[p.key]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索姓名、工号或岗位..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3.5 py-1.5 rounded-xl bg-[#F5F5F7] text-xs outline-none w-48 focus:w-56 transition-all"
              />
            </div>

            {!isSelfOnly && (
              <>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] outline-none cursor-pointer"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] outline-none cursor-pointer"
                >
                  {EMPLOYEE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={hireMonthFilter}
                  onChange={(e) => setHireMonthFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F7] text-xs font-medium text-[#1D1D1F] outline-none cursor-pointer"
                >
                  {HIRE_YEAR_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m === '入职年月' ? '入职年月' : `${m} 入职`}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#86868B]">共 {filteredEmployees.length} 条档案</span>
            <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F7]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-[#1D1D1F]' : 'text-[#86868B]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-[#1D1D1F]' : 'text-[#86868B]'
                }`}
              >
                <GridIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                  <th className="py-3.5 px-5">员工</th>
                  <th className="py-3.5 px-4">所属部门</th>
                  <th className="py-3.5 px-4">岗位名称</th>
                  <th className="py-3.5 px-4">直属上级</th>
                  <th className="py-3.5 px-4">用工类型</th>
                  <th className="py-3.5 px-4">状态</th>
                  <th className="py-3.5 px-4">入职日期</th>
                  <th className="py-3.5 px-4">合同到期日</th>
                  <th className="py-3.5 px-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs">
                {filteredEmployees.map((emp, i) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="hover:bg-[#FAFAFC] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            AVATAR_STYLES[i % AVATAR_STYLES.length]
                          }`}
                        >
                          {emp.name.slice(-2)}
                        </div>
                        <div>
                          <div className="font-bold text-[#1D1D1F]">{emp.name}</div>
                          <div className="text-[11px] text-[#86868B] font-mono">{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#1D1D1F]">{emp.department}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1D1D1F]">{emp.role}</td>
                    <td className="py-3.5 px-4 text-[#6E6E73]">{emp.manager}</td>
                    <td className="py-3.5 px-4 text-[#6E6E73]">{emp.type}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[#6E6E73] font-mono">{emp.hireDate}</td>
                    <td
                      className={`py-3.5 px-4 font-mono ${
                        emp.contractEnd <= '2026-12-31' ? 'text-[#D97706] font-semibold' : 'text-[#6E6E73]'
                      }`}
                    >
                      {emp.contractEnd}
                    </td>
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <AppleActionButton size="xs" onClick={() => onSelectEmployee(emp)}>
                        查看详情
                      </AppleActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp, i) => (
              <div
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="p-4 rounded-2xl border border-black/[0.06] hover:shadow-md transition-all cursor-pointer bg-[#FAFAFC]/60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        AVATAR_STYLES[i % AVATAR_STYLES.length]
                      }`}
                    >
                      {emp.name.slice(-2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1D1D1F]">{emp.name}</div>
                      <div className="text-[11px] text-[#86868B] font-mono">
                        {emp.id} · {emp.type}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={emp.status} />
                </div>
                <div className="mt-4 pt-3 border-t border-black/[0.05] text-xs space-y-1.5 text-[#6E6E73]">
                  <div className="flex justify-between">
                    <span>所属部门</span>
                    <span className="font-medium text-[#1D1D1F]">{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>岗位名称</span>
                    <span className="font-medium text-[#1D1D1F]">{emp.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>入职日期</span>
                    <span className="font-mono">{emp.hireDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingModuleView({ tasks, onCompleteOnboarding, onOpenNewModal }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [checklistState, setChecklistState] = useState({});
  const [showPendingConfirm, setShowPendingConfirm] = useState(false);
  const [pendingReasonType, setPendingReasonType] = useState('材料稍后补交');
  const [pendingReasonNote, setPendingReasonNote] = useState('');
  const [pendingDeadline, setPendingDeadline] = useState('2026-12-08');

  const openVerifyModal = (task) => {
    setSelectedTask(task);
    setChecklistState({ ...task.checklist });
    setShowPendingConfirm(false);
    setPendingReasonType('材料稍后补交');
    setPendingReasonNote('');
    setPendingDeadline(addDaysToDate(task.expectedDate, 7));
  };

  const checklistItems = [
    { key: 'idCard', label: '二代居民身份证正反面扫描件' },
    { key: 'diploma', label: '最高学历学位证书及学信网验证报告' },
    { key: 'resignationCert', label: '上家单位离职证明原件' },
    { key: 'bankCard', label: '工资代发银行储蓄卡照片及开户行信息' },
    { key: 'medicalReport', label: '近 3 个月内入职体检合格报告' },
  ];

  const missingItems = checklistItems.filter((item) => !checklistState[item.key]);
  const allChecked = missingItems.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            ONBOARDING PIPELINE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">入职管理</h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            独立追踪新员工 Offer 签署、入职五项前置资料核验（支持材料待补全先行入职）与正式建档。
          </p>
        </div>
        <AppleActionButton variant="primary" icon={Plus} onClick={onOpenNewModal}>
          直接新建员工建档
        </AppleActionButton>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1D1D1F]">待报到及材料核验队列</span>
          <span className="text-xs text-[#86868B]">共 {tasks.length} 条记录</span>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {tasks.map((task) => {
            const checkedCount = Object.values(task.checklist || {}).filter(Boolean).length;
            const isPendingTag = task.stage.startsWith('材料待补');
            return (
              <div
                key={task.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFC] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-bold text-[#1D1D1F]">{task.candidateName}</span>
                    <span className="text-xs text-[#6E6E73]">
                      {task.department} · {task.role}
                    </span>
                    {isPendingTag ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF5E6] text-[#B25E00]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
                        {task.stage}
                      </span>
                    ) : (
                      <StatusBadge status={task.stage} />
                    )}
                  </div>
                  <p className="text-xs text-[#6E6E73]">{task.remark}</p>
                  <div className="text-[11px] text-[#86868B] font-mono">
                    单号：{task.id} · 预计报到：{task.expectedDate} · 材料齐全度：{checkedCount}/5 项
                  </div>
                </div>
                <div className="shrink-0">
                  <AppleActionButton size="sm" onClick={() => openVerifyModal(task)}>
                    {task.stage === '已完成入职建档' || isPendingTag ? '查看建档记录' : '核验材料并办理'}
                  </AppleActionButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">新员工入职材料核验详情</h3>
                <p className="text-xs text-[#86868B] mt-0.5 font-mono">
                  {selectedTask.id} · {selectedTask.candidateName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">拟入职部门与岗位</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedTask.department} · {selectedTask.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">预计报到日期</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {selectedTask.expectedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">定薪标准</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    底薪 ¥{selectedTask.baseSalary.toLocaleString()} + 绩效 ¥
                    {selectedTask.perfSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#1D1D1F] mb-2.5">入职前置五项材料核验清单</div>
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <label
                      key={item.key}
                      className="p-3 rounded-xl border border-black/[0.06] bg-white flex items-center justify-between cursor-pointer hover:bg-[#FAFAFC]"
                    >
                      <span className="text-xs text-[#1D1D1F]">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(checklistState[item.key])}
                        onChange={(e) =>
                          setChecklistState((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#0071E3] rounded cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              <AppleActionButton variant="secondary" onClick={() => setSelectedTask(null)}>
                关闭
              </AppleActionButton>
              {selectedTask.stage !== '已完成入职建档' && !selectedTask.stage.startsWith('材料待补') && (
                <div className="flex items-center gap-2">
                  {allChecked ? (
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={() => {
                        onCompleteOnboarding(selectedTask.id, checklistState, false);
                        setSelectedTask(null);
                      }}
                    >
                      核验通过并建档
                    </AppleActionButton>
                  ) : (
                    <AppleActionButton
                      variant="primary"
                      onClick={() => setShowPendingConfirm(true)}
                    >
                      材料待补全（先办入职）
                    </AppleActionButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 材料没齐时先办入职二次确认小弹窗 */}
      {selectedTask && showPendingConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#1D1D1F]">确认材料待补全先行入职</h4>
              <button
                onClick={() => setShowPendingConfirm(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF5E6] border border-[#FF9500]/30 text-[#B25E00] leading-relaxed">
              还缺 <span className="font-bold">{missingItems.length}</span> 项：
              {missingItems.map((m) => m.label).join('、')}
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">
                先办入职的原因 <span className="text-[#FF3B30]">*</span>
              </label>
              <select
                value={pendingReasonType}
                onChange={(e) => setPendingReasonType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              >
                <option value="材料稍后补交">材料稍后补交</option>
                <option value="特批入职">特批入职</option>
                <option value="其他">其他</option>
              </select>
              {pendingReasonType === '其他' && (
                <input
                  type="text"
                  placeholder="请填写具体原因备注..."
                  value={pendingReasonNote}
                  onChange={(e) => setPendingReasonNote(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1.5">
                补交截止日期 <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="date"
                value={pendingDeadline}
                onChange={(e) => setPendingDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <AppleActionButton variant="secondary" onClick={() => setShowPendingConfirm(false)}>
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="primary"
                disabled={
                  !pendingDeadline ||
                  (pendingReasonType === '其他' && !pendingReasonNote.trim())
                }
                onClick={() => {
                  const reasonSummary =
                    pendingReasonType === '其他' ? pendingReasonNote.trim() : pendingReasonType;
                  onCompleteOnboarding(selectedTask.id, checklistState, true, {
                    deadline: pendingDeadline,
                    reason: reasonSummary,
                  });
                  setShowPendingConfirm(false);
                  setSelectedTask(null);
                }}
              >
                确认建档
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractsModuleView({
  employees,
  onRenewContract,
  onTerminateRenewal,
  isSelfOnly = false,
}) {
  const [onlyExpiring, setOnlyExpiring] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [renewYears, setRenewYears] = useState(3);
  const [newEndDate, setNewEndDate] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [clauseMode, setClauseMode] = useState('unchanged'); // 'unchanged' | 'modified'
  const [clauseNotes, setClauseNotes] = useState('');

  const openContractModal = (emp) => {
    setSelectedEmp(emp);
    setRenewYears(3);
    const base = new Date(emp.contractEnd);
    if (!Number.isNaN(base.getTime())) {
      base.setFullYear(base.getFullYear() + 3);
      setNewEndDate(base.toISOString().slice(0, 10));
    } else {
      setNewEndDate('2029-12-31');
    }
    setNewRoleName(emp.role);
    setClauseMode('unchanged');
    setClauseNotes('');
  };

  const handleSelectYears = (yrs) => {
    setRenewYears(yrs);
    if (selectedEmp) {
      const base = new Date(selectedEmp.contractEnd);
      if (!Number.isNaN(base.getTime())) {
        base.setFullYear(base.getFullYear() + yrs);
        setNewEndDate(base.toISOString().slice(0, 10));
      }
    }
  };

  const visibleList = useMemo(() => {
    return employees.filter((e) => {
      if (e.status === '已离职') return false;
      if (onlyExpiring) return e.contractEnd <= '2026-12-31';
      return true;
    });
  }, [employees, onlyExpiring]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            {isSelfOnly ? 'MY CONTRACT' : 'CONTRACT & COMPLIANCE'}
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {isSelfOnly ? '我的合同' : '合同管理'}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {isSelfOnly
              ? '查看本人劳动合同起止周期、签约主体与电子续签状态。'
              : '劳动合同台账监控与电子续签管理，点击详情可编辑续签条款或标记到期不再续签。'}
          </p>
        </div>
        {!isSelfOnly && (
          <AppleActionButton
            variant={onlyExpiring ? 'primary' : 'secondary'}
            icon={Filter}
            onClick={() => setOnlyExpiring(!onlyExpiring)}
          >
            {onlyExpiring ? '显示全部合同' : '仅看即将到期预警'}
          </AppleActionButton>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">签署人</th>
              <th className="py-3.5 px-4">所属部门</th>
              <th className="py-3.5 px-4">岗位名称</th>
              <th className="py-3.5 px-4">签约主体</th>
              <th className="py-3.5 px-4">入职起始日</th>
              <th className="py-3.5 px-4">合同到期日</th>
              <th className="py-3.5 px-4">合同状态</th>
              <th className="py-3.5 px-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {visibleList.map((emp) => {
              const isExpiring = emp.contractEnd <= '2026-12-31';
              const statusLabel =
                emp.renewalStatus === 'terminated'
                  ? '不再续签'
                  : isExpiring
                  ? '即将到期'
                  : '正常履行中';
              return (
                <tr key={emp.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                    {emp.name} <span className="font-mono text-[#86868B] font-normal">{emp.id}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[#1D1D1F]">{emp.department}</td>
                  <td className="py-3.5 px-4 text-[#1D1D1F] font-medium">{emp.role}</td>
                  <td className="py-3.5 px-4 text-[#6E6E73]">{emp.contractEntity}</td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">{emp.hireDate}</td>
                  <td
                    className={`py-3.5 px-4 font-mono ${
                      isExpiring ? 'text-[#D97706] font-semibold' : 'text-[#6E6E73]'
                    }`}
                  >
                    {emp.contractEnd}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={statusLabel} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <AppleActionButton size="xs" onClick={() => openContractModal(emp)}>
                      查看详情
                    </AppleActionButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">劳动合同详情与电子续签</h3>
                <p className="text-xs text-[#86868B] font-mono mt-0.5">
                  CTR-{selectedEmp.id} · {selectedEmp.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">签约员工</span>
                  <span className="font-bold text-[#1D1D1F]">
                    {selectedEmp.name}（{selectedEmp.id}）
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">所属部门与岗位</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedEmp.department} · {selectedEmp.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">原合同起止周期</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {selectedEmp.hireDate} 至 {selectedEmp.contractEnd}
                  </span>
                </div>
              </div>

              {!isSelfOnly && (
                <div className="space-y-3">
                  <div className="font-bold text-[#1D1D1F]">续签合同信息编辑</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 3, 5].map((yrs) => (
                      <button
                        key={yrs}
                        type="button"
                        onClick={() => handleSelectYears(yrs)}
                        className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                          renewYears === yrs
                            ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                            : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                        }`}
                      >
                        续签 {yrs} 年
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        新合同到期日期
                      </label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#6E6E73] mb-1">
                        续签后岗位名称
                      </label>
                      <input
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#6E6E73] mb-1.5">
                      续签补充条款模式
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setClauseMode('unchanged')}
                        className={`py-2 px-3 rounded-xl font-semibold border cursor-pointer ${
                          clauseMode === 'unchanged'
                            ? 'bg-[#0071E3] text-white border-[#0071E3]'
                            : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                        }`}
                      >
                        无修改（按原条款顺延）
                      </button>
                      <button
                        type="button"
                        onClick={() => setClauseMode('modified')}
                        className={`py-2 px-3 rounded-xl font-semibold border cursor-pointer ${
                          clauseMode === 'modified'
                            ? 'bg-[#0071E3] text-white border-[#0071E3]'
                            : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                        }`}
                      >
                        需修改补充条款
                      </button>
                    </div>
                    {clauseMode === 'modified' && (
                      <textarea
                        rows={2}
                        placeholder="请具体填写需变更的薪资、工作地点或补充协议条款..."
                        value={clauseNotes}
                        onChange={(e) => setClauseNotes(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {!isSelfOnly ? (
                <>
                  <AppleActionButton
                    variant="danger"
                    icon={Ban}
                    onClick={() => {
                      onTerminateRenewal(selectedEmp.id);
                      setSelectedEmp(null);
                    }}
                  >
                    到期不再续签
                  </AppleActionButton>
                  <div className="flex items-center gap-2">
                    <AppleActionButton variant="secondary" onClick={() => setSelectedEmp(null)}>
                      取消
                    </AppleActionButton>
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={() => {
                        onRenewContract(selectedEmp.id, newEndDate, newRoleName, clauseMode, clauseNotes);
                        setSelectedEmp(null);
                      }}
                    >
                      保存条款并办理电子续签
                    </AppleActionButton>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <AppleActionButton onClick={() => setSelectedEmp(null)}>关闭</AppleActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LifecycleModuleView({
  tasks,
  onApproveTask,
  onRejectTask,
  onCreateTask,
  role,
  currentUser,
  prefillModal,
  onClearPrefillModal,
}) {
  const [typeFilter, setTypeFilter] = useState('全部类型');
  const [selectedTask, setSelectedTask] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    type: '内部调岗',
    employeeName: '',
    employeeId: 'EMP002',
    department: currentUser.department,
    role: '',
    effectiveDate: '2026-12-01',
    detail: '',
  });

  useEffect(() => {
    if (prefillModal) {
      setTaskForm({
        type: prefillModal.type || '转正评估',
        employeeName: prefillModal.employeeName || '',
        employeeId: prefillModal.employeeId || 'EMP002',
        department: prefillModal.department || currentUser.department,
        role: prefillModal.role || '',
        effectiveDate: '2026-12-01',
        detail:
          prefillModal.type === '离职办理'
            ? '申请办理离职交接与劳动合同解除流程。'
            : '试用期考核达标，申请如期办理转正评估。',
      });
      setShowNewTaskModal(true);
      onClearPrefillModal();
    }
  }, [prefillModal, currentUser.department, onClearPrefillModal]);

  const isDeptLead = role === '部门负责人';
  const scopedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (isDeptLead && t.department !== currentUser.department) return false;
      if (typeFilter !== '全部类型' && t.type !== typeFilter) return false;
      return true;
    });
  }, [tasks, isDeptLead, currentUser.department, typeFilter]);

  const tabs = ['全部类型', '转正评估', '内部调岗', '离职办理'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            LIFECYCLE MANAGEMENT
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">转调离管理</h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            {isDeptLead
              ? `当前仅展示「${currentUser.department}」部门异动流转，支持发起本部门内部调岗与审批节点复核。`
              : '员工转正评估、内部调岗与离职办理全流程审批中心，审批生效后自动同步员工档案。'}
          </p>
        </div>
        <AppleActionButton
          variant="primary"
          icon={Plus}
          onClick={() => {
            setTaskForm({
              type: isDeptLead ? '内部调岗' : '转正评估',
              employeeName: '',
              employeeId: 'EMP002',
              department: currentUser.department,
              role: '',
              effectiveDate: '2026-12-01',
              detail: '',
            });
            setShowNewTaskModal(true);
          }}
        >
          {isDeptLead ? '发起本部门内部调岗' : '发起人事异动流程'}
        </AppleActionButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = typeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#1D1D1F] text-white'
                  : 'bg-white text-[#515154] border border-black/[0.06] hover:bg-[#F5F5F7]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] divide-y divide-black/[0.05]">
        {scopedTasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#86868B]">当前筛选条件下暂无转调离流程记录</div>
        ) : (
          scopedTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFC]"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EBF5FF] text-[#0071E3] text-[11px] font-bold">
                    {task.type}
                  </span>
                  <span className="text-sm font-bold text-[#1D1D1F]">{task.employeeName}</span>
                  <span className="text-xs font-mono text-[#86868B]">{task.employeeId}</span>
                  <span className="text-xs text-[#6E6E73]">
                    {task.department} · {task.role}
                  </span>
                  <StatusBadge status={task.stage} />
                </div>
                <p className="text-xs text-[#515154]">{task.detail}</p>
                <div className="text-[11px] text-[#86868B] font-mono">
                  单号：{task.id} · 预计生效日期：{task.effectiveDate} · 当前节点负责人：{task.approver}
                </div>
              </div>
              <AppleActionButton
                size="xs"
                onClick={() => {
                  setSelectedTask(task);
                  setShowRejectBox(false);
                  setRejectReason('');
                }}
              >
                查看详情
              </AppleActionButton>
            </div>
          ))
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-black/[0.08] overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">{selectedTask.type} · 审批详情</h3>
                <p className="text-[#86868B] font-mono mt-0.5">{selectedTask.id}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">员工信息</span>
                  <span className="font-bold text-[#1D1D1F]">
                    {selectedTask.employeeName}（{selectedTask.employeeId}）
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">部门与目标岗位</span>
                  <span className="font-semibold text-[#1D1D1F]">
                    {selectedTask.department} · {selectedTask.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">预计生效日期</span>
                  <span className="font-mono font-semibold">{selectedTask.effectiveDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">当前节点负责人</span>
                  <span className="font-semibold text-[#0071E3]">{selectedTask.approver}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl border border-black/[0.06] text-[#1D1D1F] leading-relaxed">
                {selectedTask.detail}
              </div>

              {showRejectBox && (
                <div className="space-y-1.5">
                  <label className="block font-semibold text-[#D70015]">请填写驳回原因 *</label>
                  <textarea
                    rows={2}
                    placeholder="请说明需补充材料或驳回退回的具体原因..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FFF2F2]/60 border border-[#FF3B30]/30 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {selectedTask.stage !== '已生效归档' && selectedTask.stage !== '已驳回' ? (
                <>
                  {!showRejectBox ? (
                    <AppleActionButton
                      variant="danger"
                      icon={Ban}
                      onClick={() => setShowRejectBox(true)}
                    >
                      驳回申请
                    </AppleActionButton>
                  ) : (
                    <AppleActionButton
                      variant="danger"
                      disabled={!rejectReason.trim()}
                      onClick={() => {
                        onRejectTask(selectedTask.id, rejectReason.trim());
                        setSelectedTask(null);
                      }}
                    >
                      确认驳回退回
                    </AppleActionButton>
                  )}
                  <div className="flex items-center gap-2">
                    <AppleActionButton variant="secondary" onClick={() => setSelectedTask(null)}>
                      关闭
                    </AppleActionButton>
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={() => {
                        onApproveTask(selectedTask.id);
                        setSelectedTask(null);
                      }}
                    >
                      同意并归档生效
                    </AppleActionButton>
                  </div>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <AppleActionButton onClick={() => setSelectedTask(null)}>关闭</AppleActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F]">发起人事异动流程</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1">异动类型</label>
              <select
                disabled={isDeptLead}
                value={taskForm.type}
                onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              >
                <option value="转正评估">转正评估</option>
                <option value="内部调岗">内部调岗</option>
                <option value="离职办理">离职办理</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">员工姓名 *</label>
                <input
                  type="text"
                  placeholder="例如：张伟"
                  value={taskForm.employeeName}
                  onChange={(e) => setTaskForm({ ...taskForm, employeeName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">目标部门</label>
                <select
                  disabled={isDeptLead}
                  value={taskForm.department}
                  onChange={(e) => setTaskForm({ ...taskForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                >
                  {DEPARTMENTS.filter((d) => d !== '全部部门').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">目标岗位 *</label>
                <input
                  type="text"
                  placeholder="请输入岗位名称"
                  value={taskForm.role}
                  onChange={(e) => setTaskForm({ ...taskForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">预计生效日期</label>
                <input
                  type="date"
                  value={taskForm.effectiveDate}
                  onChange={(e) => setTaskForm({ ...taskForm, effectiveDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1">申请说明与评估意见</label>
              <textarea
                rows={2}
                value={taskForm.detail}
                onChange={(e) => setTaskForm({ ...taskForm, detail: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <AppleActionButton variant="secondary" onClick={() => setShowNewTaskModal(false)}>
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="primary"
                disabled={!taskForm.employeeName.trim() || !taskForm.role.trim()}
                onClick={() => {
                  onCreateTask(taskForm);
                  setShowNewTaskModal(false);
                }}
              >
                提交审批流程
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttendancePayrollView({
  employees,
  role,
  currentUser,
  onTriggerToast,
  unlocked,
  setUnlocked,
}) {
  const isEmployee = role === '普通员工';
  const isHrLead = role === 'HR 主管';
  const [scopeTab, setScopeTab] = useState('team'); // 'team' | 'personal'

  // 普通员工专属：2026年11月个人考勤日历视图
  if (isEmployee || scopeTab === 'personal') {
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
              PERSONAL ATTENDANCE
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
              2026年11月考勤数据
            </h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              {currentUser.name}（{currentUser.department}）· 月度每日上下班打卡记录与出勤日历。
            </p>
          </div>
          {!isEmployee && (
            <div className="inline-flex p-1 rounded-xl bg-[#E8E8ED]">
              <button
                onClick={() => setScopeTab('team')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#515154] cursor-pointer"
              >
                团队考勤与算薪
              </button>
              <button
                onClick={() => setScopeTab('personal')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1D1D1F] shadow-2xs cursor-pointer"
              >
                个人考勤日历
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-[#1D1D1F]">
              2026 年 11 月出勤日历（应出勤 22 天 · 实出勤 22 天）
            </span>
            <div className="flex items-center gap-4 text-xs text-[#6E6E73]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34C759]" /> 正常出勤
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D1D1D6]" /> 周末公休
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((w) => (
              <div key={w} className="py-2 font-semibold text-[#86868B]">
                {w}
              </div>
            ))}
            {days.map((d) => {
              const weekday = d % 7;
              const isWeekend = weekday === 1 || weekday === 0;
              return (
                <div
                  key={d}
                  className={`p-3 rounded-xl border text-left ${
                    isWeekend
                      ? 'bg-[#FAFAFC] border-black/[0.04] text-[#86868B]'
                      : 'bg-[#F2FBF4]/60 border-[#34C759]/20 text-[#1D1D1F]'
                  }`}
                >
                  <div className="font-bold font-mono">{d} 日</div>
                  <div className="text-[10px] mt-1">{isWeekend ? '公休日' : '09:26 - 18:40'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeList = employees.filter((e) => e.status !== '已离职');
  const totalGross = activeList.reduce((acc, e) => acc + (e.baseSalary || 0) + (e.perfSalary || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            ATTENDANCE & PAYROLL
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">考勤薪资</h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            月度考勤工时汇总与自动算薪台账，默认开启敏感薪资保护锁。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 rounded-xl bg-[#E8E8ED]">
            <button
              onClick={() => setScopeTab('team')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1D1D1F] shadow-2xs cursor-pointer"
            >
              团队考勤
            </button>
            <button
              onClick={() => setScopeTab('personal')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#515154] cursor-pointer"
            >
              个人考勤
            </button>
          </div>

          <AppleActionButton
            variant="secondary"
            icon={unlocked ? Lock : Unlock}
            onClick={() => setUnlocked(!unlocked)}
          >
            {unlocked ? '锁定薪资明细' : '解锁薪资明细'}
          </AppleActionButton>

          {isHrLead && (
            <AppleActionButton
              variant="primary"
              icon={DollarSign}
              onClick={() =>
                onTriggerToast(
                  '2026年11月电子工资条已发放',
                  `已向 ${activeList.length} 名在职伙伴推送加密薪资单`
                )
              }
            >
              一键发放工资条
            </AppleActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">本期计薪在编人数</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2">{activeList.length} 人</div>
          <div className="text-[11px] text-[#86868B] mt-1">全勤标准 22 个工作日（176 小时）</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">本月税前应发总额</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2 font-mono">
            {unlocked ? `¥ ${totalGross.toLocaleString()}` : '¥ ***,***'}
          </div>
          <div className="text-[11px] text-[#86868B] mt-1">含基本薪资与月度绩效奖金</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs text-[#86868B]">五险一金缴纳状态</div>
          <div className="text-3xl font-bold text-[#248A3D] mt-2">已核准申报</div>
          <div className="text-[11px] text-[#86868B] mt-1">本月无新增增减员漏报异常</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">员工</th>
              <th className="py-3.5 px-4">出勤天数</th>
              <th className="py-3.5 px-4">基本月薪</th>
              <th className="py-3.5 px-4">绩效奖金</th>
              <th className="py-3.5 px-4">税前应发合计</th>
              <th className="py-3.5 px-5 text-right">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {activeList.map((emp) => {
              const gross = (emp.baseSalary || 0) + (emp.perfSalary || 0);
              return (
                <tr key={emp.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                    {emp.name} <span className="font-normal text-[#86868B]">（{emp.department}）</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">22.0 天（全勤）</td>
                  <td className="py-3.5 px-4 font-mono">
                    {unlocked ? `¥ ${(emp.baseSalary || 0).toLocaleString()}` : '¥ **,***'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {unlocked ? `¥ ${(emp.perfSalary || 0).toLocaleString()}` : '¥ *,***'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1D1D1F]">
                    {unlocked ? `¥ ${gross.toLocaleString()}` : '¥ **,***'}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                      已核算
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelfServiceModuleView({ currentUser, requests, onSubmitRequest }) {
  const [bizType, setBizType] = useState('假勤申请 / 年假申请');
  const [effectiveDate, setEffectiveDate] = useState('2026-12-04');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmitRequest({
      bizType,
      effectiveDate,
      reason,
    });
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
          EMPLOYEE SELF-SERVICE
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">员工自助</h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          当前登录：{currentUser.name}（{currentUser.id} · {currentUser.role}）
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">剩余法定年假</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mt-2">8.5 天</div>
          <div className="text-[11px] text-[#86868B] mt-1">有效期至 2026-12-31</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">可用调休余额</div>
          <div className="text-3xl font-bold text-[#0071E3] mt-2">12.0 小时</div>
          <div className="text-[11px] text-[#86868B] mt-1">支持最小 0.5 小时为单位调休</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
          <div className="text-xs font-medium text-[#86868B]">本月打卡状态</div>
          <div className="text-3xl font-bold text-[#248A3D] mt-2">全勤正常</div>
          <div className="text-[11px] text-[#86868B] mt-1">今日上班打卡 09:26 · 总部研发中心</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4"
        >
          <h2 className="text-sm font-bold text-[#1D1D1F]">发起申请</h2>
          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
              申请业务类型（一级大类 / 二级具体事项）
            </label>
            <TwoLevelCascader
              value={bizType}
              onChange={setBizType}
              dataMap={SELF_SERVICE_CATEGORIES}
              placeholder="请选择申请业务类型"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
              申请日期 / 生效时间
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">
              申请事由 / 补充说明
            </label>
            <textarea
              rows={3}
              placeholder="请填写具体事由、金额或规格型号说明..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none"
            />
          </div>

          <AppleActionButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!reason.trim()}
          >
            提交审批申请
          </AppleActionButton>
        </form>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">我的申请记录</h2>
            <span className="text-xs text-[#86868B]">共 {requests.length} 条记录</span>
          </div>
          <div className="space-y-2.5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-black/[0.06] bg-[#FAFAFC] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-[#1D1D1F]">
                    {req.bizType}{' '}
                    <span className="font-mono font-normal text-[#86868B]">{req.effectiveDate}</span>
                  </div>
                  <div className="text-[11px] text-[#6E6E73] mt-0.5">{req.reason}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${
                    req.status === '已批准'
                      ? 'bg-[#EAF8EE] text-[#1E7E34]'
                      : 'bg-[#FFF5E6] text-[#B25E00]'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 独立子应用：ATS 招聘工作台视图
function RecruitingModuleView({
  jobs,
  candidates,
  onPublishJob,
  onUpdateCandidateStage,
  atsSubNav = 'ats-funnel',
}) {
  const [stageFilter, setStageFilter] = useState('全部阶段');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '技术部',
    headcount: 1,
    location: '总部 · 现场办公',
    salaryRange: '25K - 35K · 14薪',
  });

  const stages = ['全部阶段', '初试筛选', '专业复试中', '终面通过', 'Offer 待确认', '已录用转入职', '已淘汰归档'];

  const filteredCandidates = useMemo(() => {
    if (stageFilter === '全部阶段') return candidates;
    return candidates.filter((c) => c.stage === stageFilter);
  }, [candidates, stageFilter]);

  const nextStageMap = {
    初试筛选: '专业复试中',
    专业复试中: '终面通过',
    终面通过: 'Offer 待确认',
    'Offer 待确认': '已录用转入职',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
            TALENT ACQUISITION · ATS STUDIO
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">
            {atsSubNav === 'ats-jobs'
              ? '在招职位管理'
              : atsSubNav === 'ats-talent'
              ? '企业人才库'
              : '招聘漏斗与职位看板'}
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            在招岗位需求看板与核心候选人面试漏斗实时流转，确认录用后自动推送至 HRIS 入职管理。
          </p>
        </div>
        <AppleActionButton variant="blue" icon={Plus} onClick={() => setShowNewJobModal(true)}>
          发布新招聘职位
        </AppleActionButton>
      </div>

      {/* 在招职位看板 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#0071E3]">{job.department}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#EAF8EE] text-[#1E7E34] font-semibold">
                  招聘中 · {job.headcount} HC
                </span>
              </div>
              <div className="text-sm font-bold text-[#1D1D1F] mt-2">{job.title}</div>
              <div className="text-[11px] text-[#86868B] mt-1">
                {job.location} · {job.salaryRange}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
              <span className="text-[#6E6E73]">新简历 {job.applicants}</span>
              <span className="text-[#6E6E73]">面试中 {job.interviewing}</span>
              <span className="font-bold text-[#1D1D1F]">Offer {job.offers}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 重点候选人面试漏斗（带完整表头 + 仅保留查看详情按钮防误触） */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {stages.map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                  stageFilter === st
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-[#F5F5F7] text-[#515154] hover:bg-[#EBEBF0]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#86868B]">点击查看详情可推进节点或淘汰归档</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                <th className="py-3.5 px-5">候选人姓名</th>
                <th className="py-3.5 px-4">应聘岗位</th>
                <th className="py-3.5 px-4">所属部门</th>
                <th className="py-3.5 px-4">期望薪酬</th>
                <th className="py-3.5 px-4">最快到岗日</th>
                <th className="py-3.5 px-4">当前招聘节点</th>
                <th className="py-3.5 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#1D1D1F]">{cand.name}</div>
                    <div className="text-[11px] text-[#86868B]">{cand.exp}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1D1D1F]">{cand.jobTitle}</td>
                  <td className="py-3.5 px-4 text-[#6E6E73]">{cand.department}</td>
                  <td className="py-3.5 px-4 font-mono text-[#1D1D1F]">{cand.expectedSalary}</td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">{cand.availableDate}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={cand.stage} />
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <AppleActionButton size="xs" onClick={() => setSelectedCandidate(cand)}>
                      查看详情
                    </AppleActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 候选人详情与面试流转弹窗 */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">候选人评估与招聘节点推进</h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {selectedCandidate.name} · 应聘「{selectedCandidate.jobTitle}」
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">所属部门</span>
                  <span className="font-semibold text-[#1D1D1F]">{selectedCandidate.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">期望薪酬 / 最快到岗</span>
                  <span className="font-mono font-semibold text-[#1D1D1F]">
                    {selectedCandidate.expectedSalary} · {selectedCandidate.availableDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">面试官与综合评分</span>
                  <span className="font-semibold text-[#0071E3]">
                    {selectedCandidate.interviewer} · {selectedCandidate.score} / 5.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">当前节点</span>
                  <StatusBadge status={selectedCandidate.stage} />
                </div>
              </div>

              <div>
                <div className="font-semibold text-[#6E6E73] mb-1.5">面试评语摘要</div>
                <div className="p-3.5 rounded-2xl border border-black/[0.06] text-[#1D1D1F] leading-relaxed">
                  {selectedCandidate.evaluation}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {selectedCandidate.stage !== '已录用转入职' &&
              selectedCandidate.stage !== '已淘汰归档' ? (
                <>
                  <AppleActionButton
                    variant="danger"
                    icon={Ban}
                    onClick={() => {
                      onUpdateCandidateStage(selectedCandidate.id, '已淘汰归档');
                      setSelectedCandidate(null);
                    }}
                  >
                    淘汰归档
                  </AppleActionButton>
                  <AppleActionButton
                    variant="blue"
                    icon={Check}
                    onClick={() => {
                      const next = nextStageMap[selectedCandidate.stage] || '已录用转入职';
                      onUpdateCandidateStage(selectedCandidate.id, next);
                      setSelectedCandidate(null);
                    }}
                  >
                    推进至「{nextStageMap[selectedCandidate.stage] || '已录用转入职'}」
                  </AppleActionButton>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <AppleActionButton onClick={() => setSelectedCandidate(null)}>关闭</AppleActionButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 发布新招聘职位弹窗 */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1D1D1F]">发布新招聘职位</h3>
              <button
                onClick={() => setShowNewJobModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">职位名称 *</label>
                <input
                  type="text"
                  placeholder="例如：高级产品交互设计师"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1">需求部门</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                  >
                    {DEPARTMENTS.filter((d) => d !== '全部部门').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1">招聘名额 (HC)</label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.headcount}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, headcount: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">薪酬预算区间</label>
                <input
                  type="text"
                  value={jobForm.salaryRange}
                  onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex justify-end gap-2">
              <AppleActionButton variant="secondary" onClick={() => setShowNewJobModal(false)}>
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="blue"
                disabled={!jobForm.title.trim()}
                onClick={() => {
                  onPublishJob(jobForm);
                  setJobForm({ ...jobForm, title: '' });
                  setShowNewJobModal(false);
                }}
              >
                确认发布职位
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceModuleView({
  records,
  onCalibrateGrade,
  onSyncPayroll,
  isSelfOnly = false,
  currentUser,
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [gradeValue, setGradeValue] = useState('S (4.9)');
  const [commentValue, setCommentValue] = useState('');

  const openCalibrateModal = (rec) => {
    setSelectedRecord(rec);
    setGradeValue(rec.grade === '待评定' ? 'A (4.6)' : rec.grade);
    setCommentValue(rec.managerComment);
  };

  if (isSelfOnly) {
    const myPerf = records.find((r) => r.id === currentUser.id) || records[0];
    return (
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            MY PERFORMANCE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">我的绩效</h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            查看本人 2026 Q4 季度 OKR 关键结果达成度与主管校准等级结果。
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-[#1D1D1F]">
                {myPerf.name} · {myPerf.department}（{myPerf.role}）
              </div>
              <div className="text-xs text-[#86868B] mt-1">考核周期：2026 年 Q4 季度</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-xs font-bold">
                校准等级：{myPerf.grade}
              </span>
              <StatusBadge status={myPerf.status} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>季度 OKR 关键结果总达成度</span>
              <span>{myPerf.okrProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#F5F5F7] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#1D1D1F]"
                style={{ width: `${myPerf.okrProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.05]">
              <div className="font-bold text-[#1D1D1F] mb-1.5">本季度 OKR 关键成果自评</div>
              <p className="text-[#515154] leading-relaxed">{myPerf.okrSummary}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.05]">
              <div className="font-bold text-[#1D1D1F] mb-1.5">直属主管校准评语</div>
              <p className="text-[#515154] leading-relaxed">{myPerf.managerComment}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
            OKR & PERFORMANCE
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">绩效考核</h1>
          <p className="text-[13px] text-[#6E6E73] mt-1">
            季度 OKR 关键结果达成度与主管绩效等级校准看板，点击查看详情进行安全校准。
          </p>
        </div>
        <AppleActionButton variant="primary" icon={TrendingUp} onClick={onSyncPayroll}>
          同步结果至算薪引擎
        </AppleActionButton>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
              <th className="py-3.5 px-5">被评估人</th>
              <th className="py-3.5 px-4">所属部门</th>
              <th className="py-3.5 px-4">岗位名称</th>
              <th className="py-3.5 px-4">OKR 完成度</th>
              <th className="py-3.5 px-4">员工自评</th>
              <th className="py-3.5 px-4">校准等级</th>
              <th className="py-3.5 px-4">当前阶段</th>
              <th className="py-3.5 px-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-[#FAFAFC]">
                <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                  {rec.name} <span className="font-mono text-[#86868B] font-normal">{rec.id}</span>
                </td>
                <td className="py-3.5 px-4 text-[#1D1D1F]">{rec.department}</td>
                <td className="py-3.5 px-4 text-[#6E6E73]">{rec.role}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1D1D1F]"
                        style={{ width: `${rec.okrProgress}%` }}
                      />
                    </div>
                    <span className="font-mono font-semibold">{rec.okrProgress}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-[#6E6E73]">{rec.selfEval}</td>
                <td className="py-3.5 px-4 font-bold text-[#0071E3]">{rec.grade}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={rec.status} />
                </td>
                <td className="py-3.5 px-5 text-right">
                  <AppleActionButton size="xs" onClick={() => openCalibrateModal(rec)}>
                    查看详情
                  </AppleActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 绩效详情与等级校准弹窗（防误触） */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">季度绩效详情与等级校准</h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  {selectedRecord.name}（{selectedRecord.id} · {selectedRecord.department}）
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 space-y-1.5">
                <div className="font-bold text-[#1D1D1F]">
                  OKR 关键结果完成度：{selectedRecord.okrProgress}%
                </div>
                <p className="text-[#515154] leading-relaxed">{selectedRecord.okrSummary}</p>
              </div>

              <div>
                <label className="block font-medium text-[#6E6E73] mb-1.5">校准绩效等级</label>
                <div className="grid grid-cols-4 gap-2">
                  {['S (4.9)', 'A (4.6)', 'B+ (4.2)', 'B (3.8)'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGradeValue(g)}
                      className={`py-2 rounded-xl font-bold border cursor-pointer ${
                        gradeValue === g
                          ? 'bg-[#0071E3] text-white border-[#0071E3]'
                          : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#6E6E73] mb-1.5">主管校准评语</label>
                <textarea
                  rows={3}
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex justify-end gap-2">
              <AppleActionButton variant="secondary" onClick={() => setSelectedRecord(null)}>
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="primary"
                icon={Check}
                onClick={() => {
                  onCalibrateGrade(selectedRecord.id, gradeValue, commentValue);
                  setSelectedRecord(null);
                }}
              >
                确认保存校准结果
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CertificatesModuleView({ employees, onTriggerToast, salaryUnlocked }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP001');
  const [certType, setCertType] = useState('在职证明');
  const [purpose, setPurpose] = useState('办理个人签证 / 居住证积分申请');
  const [resignDate, setResignDate] = useState('');

  const targetEmp = useMemo(
    () => employees.find((e) => e.id === selectedEmpId) || employees[0],
    [employees, selectedEmpId]
  );

  const isIncomeLocked = certType === '收入证明' && !salaryUnlocked;
  const isResignMissingDate = certType === '离职证明' && !resignDate;
  const isDownloadDisabled = isIncomeLocked || isResignMissingDate;

  const formatDateCn = (isoStr) => {
    if (!isoStr) return '（请选择离职日期）';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
  };

  const grossMonthly = (targetEmp?.baseSalary || 0) + (targetEmp?.perfSalary || 0);

  const handleDownloadDoc = (ext) => {
    const title = certType;
    let bodyText = '';
    if (certType === '在职证明') {
      bodyText = `兹证明 ${targetEmp.name}（员工工号：${targetEmp.id}），自 ${formatDateCn(
        targetEmp.hireDate
      )} 起加入我司并任职于 ${targetEmp.department}，担任 ${
        targetEmp.role
      } 一职，当前雇佣状态为「${targetEmp.status}」。\n\n本证明仅限用于「${purpose}」，不作其他任何经济或法律担保用途。特此证明。`;
    } else if (certType === '收入证明') {
      bodyText = `兹证明 ${targetEmp.name}（员工工号：${targetEmp.id}），自 ${formatDateCn(
        targetEmp.hireDate
      )} 起在我司 ${targetEmp.department} 担任 ${
        targetEmp.role
      } 一职，税前月综合收入为人民币 ¥${grossMonthly.toLocaleString()} 元。\n\n本证明仅限用于「${purpose}」，不作任何经济担保用途。特此证明。`;
    } else {
      bodyText = `兹证明 ${targetEmp.name}（员工工号：${targetEmp.id}），自 ${formatDateCn(
        targetEmp.hireDate
      )} 起在我司任职于 ${targetEmp.department}，担任 ${targetEmp.role} 一职，于 ${formatDateCn(
        resignDate
      )} 离职，双方劳动合同已解除。特此证明。`;
    }

    const content = `${title}\n\n致相关单位：\n\n${bodyText}\n\n文档编号：DOC-${targetEmp.id}-20261125\n生成日期：2026年11月25日\n（本文件为无章版标准电子证明底稿）`;
    const mime =
      ext === 'PDF'
        ? 'application/pdf;charset=utf-8'
        : 'application/msword;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetEmp.name}_${certType}_无章底稿.${ext === 'PDF' ? 'pdf' : 'doc'}`;
    a.click();
    URL.revokeObjectURL(url);
    onTriggerToast(`已生成并下载 ${certType} (${ext})`, `无章版标准电子文档已保存至本地`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-[#86868B] uppercase">
          DIGITAL CERTIFICATES
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">证明文件</h1>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          实时读取员工档案数据生成标准无章证明底稿，支持导出 PDF 与 Word 文档。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#1D1D1F]">证明生成参数配置</h2>

          <div>
            <label className="block font-medium text-[#6E6E73] mb-1.5">选择开具对象</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] font-semibold text-[#1D1D1F] outline-none"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}（{e.id} · {e.status}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#6E6E73] mb-1.5">证明文件类型</label>
            <div className="grid grid-cols-3 gap-2">
              {['在职证明', '收入证明', '离职证明'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCertType(type)}
                  className={`py-2.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                    certType === type
                      ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                      : 'bg-[#F5F5F7] text-[#515154] border-transparent hover:bg-[#EBEBF0]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {certType === '离职证明' ? (
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">
                离职日期 <span className="text-[#FF3B30]">*</span>
              </label>
              <input
                type="date"
                value={resignDate}
                onChange={(e) => setResignDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">证明用途说明</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
              />
            </div>
          )}

          {isIncomeLocked && (
            <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9500]/30 text-[#B25E00] text-[11px] font-medium flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>请先在考勤薪资页解锁薪资明细</span>
            </div>
          )}

          {isResignMissingDate && (
            <div className="p-3 rounded-xl bg-[#F5F5F7] text-[#6E6E73] text-[11px]">
              请先选择离职日期后，再生成导出离职证明文件。
            </div>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <AppleActionButton
              variant="primary"
              icon={Download}
              disabled={isDownloadDisabled}
              onClick={() => handleDownloadDoc('PDF')}
            >
              生成文件 (PDF)
            </AppleActionButton>
            <AppleActionButton
              variant="secondary"
              icon={FileText}
              disabled={isDownloadDisabled}
              onClick={() => handleDownloadDoc('Word')}
            >
              生成文件 (Word)
            </AppleActionButton>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="text-center">
              <div className="text-[10px] font-semibold tracking-widest text-[#86868B] uppercase">
                STANDARD DOCUMENT PREVIEW
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1F] mt-1 tracking-wide">{certType}</h2>
            </div>

            <div className="mt-8 space-y-4 text-[13px] text-[#1D1D1F] leading-7">
              <div>致相关单位：</div>
              {certType === '在职证明' && (
                <>
                  <p className="indent-7">
                    兹证明 <span className="font-bold">{targetEmp.name}</span>（员工工号：
                    <span className="font-mono">{targetEmp.id}</span>），自{' '}
                    <span className="font-mono">{targetEmp.hireDate}</span> 起加入我司并任职于{' '}
                    <span className="font-bold">{targetEmp.department}</span>，担任{' '}
                    <span className="font-bold">{targetEmp.role}</span> 一职，当前雇佣状态为「
                    {targetEmp.status}」。
                  </p>
                  <p className="indent-7">
                    本证明仅限用于「{purpose}」，不作其他任何经济或法律担保用途。特此证明。
                  </p>
                </>
              )}

              {certType === '收入证明' && (
                <>
                  <p className="indent-7">
                    兹证明 <span className="font-bold">{targetEmp.name}</span>（员工工号：
                    <span className="font-mono">{targetEmp.id}</span>），自{' '}
                    <span className="font-mono">{targetEmp.hireDate}</span> 起在我司{' '}
                    <span className="font-bold">{targetEmp.department}</span> 担任{' '}
                    <span className="font-bold">{targetEmp.role}</span>{' '}
                    一职，税前月综合收入为人民币{' '}
                    <span className="font-mono font-bold text-[#0071E3]">
                      {salaryUnlocked ? `¥ ${grossMonthly.toLocaleString()}` : '¥**,***'}
                    </span>{' '}
                    元。
                  </p>
                  <p className="indent-7">
                    本证明仅限用于「{purpose}」，不作任何经济担保用途。特此证明。
                  </p>
                </>
              )}

              {certType === '离职证明' && (
                <p className="indent-7">
                  兹证明 <span className="font-bold">{targetEmp.name}</span>（员工工号：
                  <span className="font-mono">{targetEmp.id}</span>），自{' '}
                  <span className="font-bold">{formatDateCn(targetEmp.hireDate)}</span> 起在我司任职于{' '}
                  <span className="font-bold">{targetEmp.department}</span> 部门，担任{' '}
                  <span className="font-bold">{targetEmp.role}</span> 一职，于{' '}
                  <span
                    className={`font-bold ${
                      resignDate ? 'text-[#1D1D1F]' : 'text-[#D97706]'
                    }`}
                  >
                    {formatDateCn(resignDate)}
                  </span>{' '}
                  离职，双方劳动合同已解除。特此证明。
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#86868B] font-mono">
            <span>文档编号：DOC-{targetEmp.id}-20261125（无章版标准底稿）</span>
            <span>生成日期：2026年11月25日</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. 主应用框架（PeopleOS · HRIS Pro + ATS 独立子应用切换器）
// ==========================================
export default function App() {
  const [activeApp, setActiveApp] = useState('hris'); // 'hris' | 'ats'
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [activeNav, setActiveNav] = useState('employees');
  const [atsActiveNav, setAtsActiveNav] = useState('ats-funnel');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState('HR 主管'); // 'HR 主管' | '部门负责人' | '普通员工'

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [onboardingTasks, setOnboardingTasks] = useState(INITIAL_ONBOARDING_TASKS);
  const [lifecycleTasks, setLifecycleTasks] = useState(INITIAL_LIFECYCLE_TASKS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [perfRecords, setPerfRecords] = useState(INITIAL_PERF_RECORDS);
  const [atsViewMode, setAtsViewMode] = useState('dashboard'); // 'dashboard' | 'job-create'
  const [atsRegionMode, setAtsRegionMode] = useState('domestic'); // 'domestic' | 'overseas'
  const [atsAnonymousMode, setAtsAnonymousMode] = useState(false);
  const [atsProgressView, setAtsProgressView] = useState('kanban'); // 'kanban' | 'list'
  const [selectedAtsJobId, setSelectedAtsJobId] = useState('JOB-101');
  const [activeCandidateDrawer, setActiveCandidateDrawer] = useState(null);
  const [scorecardCandidate, setScorecardCandidate] = useState(null);
  const [offerCandidate, setOfferCandidate] = useState(null);
  const [talentPool, setTalentPool] = useState([
    { id: 'TP-01', name: '顾言之', role: '资深算法架构师', company: '字节跳动', tag: '银牌候选人', score: '4.7', lastActive: '2026-10-15' },
    { id: 'TP-02', name: '沈书瑶', role: '3D 概念美术指导', company: '米哈游', tag: '历史高分沉淀', score: '4.8', lastActive: '2026-09-28' },
  ]);
  const [selfRequests, setSelfRequests] = useState([
    {
      id: 'REQ-01',
      bizType: '假勤申请 / 年假申请',
      effectiveDate: '2026-10-08 ~ 2026-10-09 (2天)',
      reason: '个人年度休假安排',
      status: '已批准',
    },
    {
      id: 'REQ-02',
      bizType: '资产申领 / 办公电脑 / 显示器',
      effectiveDate: '2026-11-12',
      reason: '4K 外接显示器及人体工学支架',
      status: '已批准',
    },
    {
      id: 'REQ-03',
      bizType: '费用报销 / 差旅交通及住宿报销',
      effectiveDate: '2026-11-18',
      reason: '¥ 1,280.00 · 华东业务交流差旅报销',
      status: '审批中',
    },
  ]);

  // 居中自适应弹窗状态
  const [showNewModal, setShowNewModal] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState(() => createEmptyEmployeeForm());

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editEmpForm, setEditEmpForm] = useState(null);
  const [isEditingEmp, setIsEditingEmp] = useState(false);
  const [prefillLifecycleModal, setPrefillLifecycleModal] = useState(null);
  const [salaryUnlocked, setSalaryUnlocked] = useState(false);

  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.title === title ? null : prev));
    }, 3600);
  };

  // 快捷键 ⌘K / Ctrl+K 打开全局搜索
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSpotlight((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUser = useMemo(() => {
    if (role === '部门负责人') {
      return employees.find((e) => e.id === 'EMP004') || employees[0]; // 陈嘉宁 · 运营部负责人
    }
    return employees.find((e) => e.id === 'EMP005') || employees[0]; // 李明
  }, [role, employees]);

  const isEmployeeRole = role === '普通员工';

  // 动态计算侧边栏导航项（HRIS 核心人事 vs ATS 招聘子应用独立 IA 树状导航）
  const navItems = useMemo(() => {
    if (activeApp === 'ats' && role === 'HR 主管') {
      return [
        { id: 'ats-home', label: '招聘工作台', icon: LayoutGrid },
        { id: 'ats-jobs', label: '职位管理', icon: Briefcase, badge: jobs.length },
        {
          id: 'ats-progress',
          label: '招聘进度',
          icon: Layers,
          badge: candidates.filter((c) => c.stage !== '已录用转入职' && c.stage !== '已淘汰归档').length,
        },
        { id: 'ats-candidates', label: '候选人库', icon: Users },
        { id: 'ats-talent', label: '人才库', icon: Sparkles, badge: talentPool.length },
        {
          id: 'ats-offers',
          label: 'Offer 中心',
          icon: Award,
          badge: candidates.filter((c) => c.stage === '终面通过' || c.stage === 'Offer 待确认').length,
        },
        { id: 'ats-analytics', label: '招聘报表', icon: TrendingUp },
      ];
    }

    if (role === '普通员工') {
      return [
        { id: 'dashboard', label: '我的工作台', icon: LayoutGrid },
        { id: 'employees', label: '我的档案', icon: Users },
        { id: 'contracts', label: '我的合同', icon: FileSignature },
        { id: 'attendance', label: '我的考勤', icon: CalendarClock },
        { id: 'self-service', label: '员工自助', icon: UserCircle },
        { id: 'performance', label: '我的绩效', icon: TrendingUp },
      ];
    }

    if (role === '部门负责人') {
      return [
        { id: 'dashboard', label: '工作台', icon: LayoutGrid },
        {
          id: 'lifecycle',
          label: '转调离管理',
          icon: UserCheck,
          badge: lifecycleTasks.filter(
            (t) => t.department === currentUser.department && t.stage !== '已生效归档'
          ).length,
        },
        { id: 'contracts', label: '我的合同', icon: FileSignature },
        { id: 'attendance', label: '考勤薪资', icon: CalendarClock },
        { id: 'self-service', label: '员工自助', icon: UserCircle },
        { id: 'performance', label: '绩效考核', icon: TrendingUp },
      ];
    }

    return [
      { id: 'dashboard', label: '工作台', icon: LayoutGrid },
      { id: 'employees', label: '员工档案', icon: Users },
      {
        id: 'onboarding',
        label: '入职管理',
        icon: UserPlus,
        badge: onboardingTasks.filter((t) => t.stage !== '已完成入职建档').length,
      },
      {
        id: 'lifecycle',
        label: '转调离管理',
        icon: UserCheck,
        badge: lifecycleTasks.filter((t) => t.stage !== '已生效归档').length,
      },
      { id: 'contracts', label: '合同管理', icon: FileSignature },
      { id: 'attendance', label: '考勤薪资', icon: CalendarClock },
      { id: 'certificates', label: '证明文件', icon: Award },
      { id: 'self-service', label: '员工自助', icon: UserCircle },
      { id: 'performance', label: '绩效考核', icon: TrendingUp },
    ];
  }, [activeApp, role, onboardingTasks, lifecycleTasks, currentUser.department, jobs.length, candidates]);

  useEffect(() => {
    if (role !== 'HR 主管' && activeApp === 'ats') {
      setActiveApp('hris');
    }
  }, [role, activeApp]);

  useEffect(() => {
    const allowedIds = navItems.map((i) => i.id);
    if (activeApp === 'ats') {
      if (!allowedIds.includes(atsActiveNav)) setAtsActiveNav('ats-home');
    } else {
      if (!allowedIds.includes(activeNav)) setActiveNav('dashboard');
    }
  }, [navItems, activeNav, atsActiveNav, activeApp]);

  const currentNavLabel = useMemo(() => {
    if (activeApp === 'ats') {
      if (atsViewMode === 'job-create') return '发布新职位';
      return navItems.find((i) => i.id === atsActiveNav)?.label || '招聘工作台';
    }
    return navItems.find((i) => i.id === activeNav)?.label || '工作台';
  }, [activeApp, atsViewMode, atsActiveNav, activeNav, navItems]);

  const handleExportCsv = () => {
    const headers = ['工号', '姓名', '部门', '岗位', '用工类型', '状态', '入职日期', '合同到期日'];
    const rows = employees.map((e) => [
      e.id,
      e.name,
      e.department,
      e.role,
      e.type,
      e.status,
      e.hireDate,
      e.contractEnd,
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `员工花名册导出_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('花名册 CSV 报表已导出', `共导出 ${employees.length} 条员工档案数据`);
  };

  // 严格校验人员档案核心字段（必填项 + 手机 11 位数字 + 居民身份证 18 位数字 + 必填家庭成员）
  const validateEmployeeForm = (form) => {
    if (!form.name.trim()) return '请填写员工真实姓名';
    if (!form.gender) return '请选择性别';
    if (!/^\d{11}$/.test(form.phone)) return '个人手机号码必须为 11 位纯数字';
    if (!form.birthDate) return '请选择出生日期';
    if (!form.ethnicity) return '请选择民族';
    if (!form.householdType) return '请选择户口类型';
    if (!form.maritalStatus) return '请选择婚姻状况';
    if (!form.firstWorkDate) return '请选择首次参加工作日期';
    if (!form.role.trim()) return '请在「岗位与薪酬」中填写岗位名称';

    for (let i = 0; i < (form.bankCards || []).length; i += 1) {
      const c = form.bankCards[i];
      if (c.holderIdNumber && !/^\d{18}$/.test(c.holderIdNumber)) {
        return `银行卡 ${i + 1} 的持卡人身份证号必须为 18 位纯数字`;
      }
      if (c.reservedPhone && !/^\d{11}$/.test(c.reservedPhone)) {
        return `银行卡 ${i + 1} 的银行预留手机号必须为 11 位纯数字`;
      }
    }

    for (let i = 0; i < (form.idDocs || []).length; i += 1) {
      const d = form.idDocs[i];
      if (d.docType === '居民身份证' && !/^\d{18}$/.test(d.docNumber)) {
        return `证件信息 ${i + 1} 为居民身份证，必须填写 18 位纯数字`;
      }
    }

    const firstFamily = form.familyMembers?.[0];
    if (!firstFamily || !firstFamily.name.trim()) {
      return '请在「家庭成员」中至少填写一位直系亲属（父母/兄弟姐妹）姓名';
    }
    return null;
  };

  const handleCreateEmployee = () => {
    const err = validateEmployeeForm(newEmpForm);
    if (err) {
      triggerToast('表单校验未通过', err);
      return;
    }
    const maxNum = employees.reduce((m, e) => {
      const n = parseInt(e.id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const nextId = `EMP${String(maxNum + 1).padStart(3, '0')}`;
    const created = {
      ...newEmpForm,
      id: nextId,
      status: newEmpForm.type === '全职' ? '试用期' : '正式员工',
    };
    setEmployees((prev) => [created, ...prev]);
    setShowNewModal(false);
    setNewEmpForm(createEmptyEmployeeForm());
    triggerToast(
      `新员工 ${created.name}（${nextId}）建档成功`,
      '已同步写入花名册、合同台账与算薪引擎'
    );
  };

  const handleOpenEmployeeDetail = (emp) => {
    setSelectedEmployee(emp);
    setEditEmpForm(JSON.parse(JSON.stringify(emp)));
    setIsEditingEmp(false);
  };

  const handleSaveEmployeeEdit = () => {
    if (!editEmpForm) return;
    const err = validateEmployeeForm(editEmpForm);
    if (err) {
      triggerToast('档案校验未通过', err);
      return;
    }
    setEmployees((prev) => prev.map((e) => (e.id === editEmpForm.id ? editEmpForm : e)));
    setSelectedEmployee(editEmpForm);
    setIsEditingEmp(false);
    triggerToast('员工全息档案已保存', `${editEmpForm.name}（${editEmpForm.id}）最新资料已更新`);
  };
  const handleCompleteOnboarding = (taskId, checklist, isPendingMaterials, pendingMeta = null) => {
    const task = onboardingTasks.find((t) => t.id === taskId);
    if (!task) return;
    const pendingLabel =
      isPendingMaterials && pendingMeta?.deadline
        ? `材料待补 · 截止 ${pendingMeta.deadline}`
        : '材料待补全';
    setOnboardingTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checklist,
              stage: isPendingMaterials ? pendingLabel : '已完成入职建档',
              remark:
                isPendingMaterials && pendingMeta
                  ? `${t.remark}（先办入职原因：${pendingMeta.reason} · 补交截止：${pendingMeta.deadline}）`
                  : t.remark,
            }
          : t
      )
    );

    const maxNum = employees.reduce((m, e) => {
      const n = parseInt(e.id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const nextId = `EMP${String(maxNum + 1).padStart(3, '0')}`;
    const probRatio = (task.probationRatio || 80) / 100;
    const newEmp = createEmptyEmployeeForm({
      id: nextId,
      name: task.candidateName,
      phone: task.phone || '',
      email: task.email || '',
      department: task.department,
      role: task.role,
      manager: task.manager || '陈嘉宁',
      level: task.level || 'P5',
      type: task.type || '全职',
      status: '试用期',
      hireDate: task.expectedDate,
      contractEnd: calcContractEndDate(task.expectedDate, 3),
      probationPeriod: '3个月',
      probationEndDate: calcProbationEndDate(task.expectedDate, '3个月'),
      probationBaseSalary: Math.round((task.baseSalary || 0) * probRatio),
      probationPerfSalary: task.perfSalary || 0,
      baseSalary: task.baseSalary || 0,
      perfSalary: task.perfSalary || 0,
    });
    setEmployees((prev) => [newEmp, ...prev]);
    triggerToast(
      isPendingMaterials ? `已办理先行入职（${pendingLabel}）` : '入职材料核验通过并完成建档',
      `${task.candidateName} 已分配工号 ${nextId} 并同步至花名册`
    );
  };

  const handleApproveLifecycle = (taskId) => {
    const task = lifecycleTasks.find((t) => t.id === taskId);
    setLifecycleTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stage: '已生效归档' } : t))
    );
    if (task) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id !== task.employeeId && emp.name !== task.employeeName) return emp;
          if (task.type === '转正评估') return { ...emp, status: '正式员工' };
          if (task.type === '离职办理') return { ...emp, status: '已离职' };
          if (task.type === '内部调岗') return { ...emp, role: task.role, department: task.department };
          return emp;
        })
      );
      triggerToast('审批已办结并同步花名册', `${task.employeeName} 的「${task.type}」已生效`);
    }
  };

  const handleRejectLifecycle = (taskId, reason) => {
    setLifecycleTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, stage: '已驳回', detail: `${t.detail}（驳回原因：${reason}）` } : t
      )
    );
    triggerToast('流程已驳回退回', `单号 ${taskId} 已退回发起人修改`);
  };

  const handleCreateLifecycleTask = (form) => {
    const maxSeq = lifecycleTasks.reduce((m, t) => {
      const parts = t.id.split('-');
      const n = parseInt(parts[parts.length - 1], 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const newId = `LC-2026-${String(maxSeq + 1).padStart(3, '0')}`;
    const newTask = {
      id: newId,
      type: form.type,
      employeeName: form.employeeName,
      employeeId: form.employeeId,
      department: form.department,
      role: form.role,
      detail: form.detail || `申请办理 ${form.employeeName} 的「${form.type}」流程。`,
      stage: '待 HR 终审',
      effectiveDate: form.effectiveDate,
      approver: '李明（HR 主管）',
    };
    setLifecycleTasks((prev) => [newTask, ...prev]);
    triggerToast(`已发起「${form.type}」审批流`, `单号 ${newId} 已推送至审批节点`);
  };

  const handleRenewContract = (empId, newEndDate, newRoleName, clauseMode, clauseNotes) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId
          ? {
              ...emp,
              contractEnd: newEndDate,
              role: newRoleName || emp.role,
              renewalStatus: 'normal',
            }
          : emp
      )
    );
    triggerToast(
      '劳动合同电子续签已生效',
      `合同到期日已更新至 ${newEndDate}（${
        clauseMode === 'modified' && clauseNotes ? '已附补充条款' : '按原条款顺延'
      }）`
    );
  };

  const handleTerminateRenewal = (empId) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === empId ? { ...emp, renewalStatus: 'terminated' } : emp))
    );
    triggerToast('已标记到期不再续签', '系统已将该合同纳入到期终止提醒清单');
  };

  const handlePublishJob = (jobForm) => {
    const maxNum = jobs.reduce((m, j) => {
      const n = parseInt(j.id.replace(/\D/g, ''), 10);
      return Number.isNaN(n) ? m : Math.max(m, n);
    }, 100);
    const newJob = {
      id: `JOB-${maxNum + 1}`,
      title: jobForm.title,
      department: jobForm.department,
      headcount: jobForm.headcount || 1,
      location: jobForm.location || '总部 · 现场办公',
      salaryRange: jobForm.salaryRange || '25K - 35K · 14薪',
      applicants: 0,
      interviewing: 0,
      offers: 0,
      priority: '新发布',
    };
    setJobs((prev) => [newJob, ...prev]);
    triggerToast('新招聘职位已发布上线', `「${newJob.title}」已同步至在招看板`);
  };

  const handleUpdateCandidateStage = (candId, nextStage, offerDetails = null) => {
    const cand = candidates.find((c) => c.id === candId);
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, stage: nextStage } : c))
    );
    if (cand && nextStage === '已录用转入职') {
      const expectedDate =
        offerDetails?.startDate ||
        (cand.availableDate === '随时到岗' ? '2026-12-01' : cand.availableDate);
      const baseSalary = offerDetails?.baseMonthly ?? 25000;
      const perfSalary = offerDetails?.perfMonthly ?? 5000;
      const probationRatio = offerDetails?.probationRatio ?? 80;
      const manager = offerDetails?.manager || '陈嘉宁';
      const level = offerDetails?.level || 'P6';

      const existingOb = onboardingTasks.find((ob) => {
        const nameMatch = ob.candidateName === cand.name;
        const roleMatch = ob.role === cand.jobTitle;
        const phoneMatch =
          cand.phone && ob.phone ? cand.phone === ob.phone : true;
        return nameMatch && roleMatch && phoneMatch;
      });

      if (existingOb) {
        setOnboardingTasks((prev) =>
          prev.map((ob) =>
            ob.id === existingOb.id
              ? {
                  ...ob,
                  department: cand.department,
                  expectedDate,
                  baseSalary,
                  perfSalary,
                  probationRatio,
                  manager,
                  level,
                  phone: cand.phone || ob.phone || '',
                  email: cand.email || ob.email || '',
                  remark: `已关联更新 Offer 定薪（基本月薪 ¥${baseSalary.toLocaleString()} + 绩效 ¥${perfSalary.toLocaleString()} · 试用期 ${probationRatio}%）。`,
                }
              : ob
          )
        );
        triggerToast(
          `已关联到现有入职单 ${existingOb.id}`,
          `${cand.name} 的 Offer 薪资、入职日期与职级已同步更新，未重复建单`
        );
      } else {
        const newObId = `OB-2026-${String(onboardingTasks.length + 1).padStart(3, '0')}`;
        const newOb = {
          id: newObId,
          candidateName: cand.name,
          phone: cand.phone || '',
          email: cand.email || '',
          department: cand.department,
          role: cand.jobTitle,
          manager,
          level,
          type: '全职',
          expectedDate,
          baseSalary,
          perfSalary,
          probationRatio,
          stage: '待核验入职材料',
          checklist: {
            idCard: true,
            diploma: true,
            resignationCert: false,
            bankCard: false,
            medicalReport: false,
          },
          remark: `由 ATS 招聘工作台录用同步转入（定薪：底薪 ¥${baseSalary.toLocaleString()} + 绩效 ¥${perfSalary.toLocaleString()} · 试用期 ${probationRatio}%）。`,
        };
        setOnboardingTasks((prev) => [newOb, ...prev]);
        triggerToast(
          `已自动转入 HRIS 入职管理（${newObId}）`,
          `${cand.name} 的定薪、入职日期与职级已同步带入待入职列表`
        );
      }
    } else if (cand) {
      triggerToast('候选人招聘节点已更新', `${cand.name} 当前处于「${nextStage}」`);
    }
  };

  const handleSubmitSelfRequest = ({ bizType, effectiveDate, reason }) => {
    const newReq = {
      id: `REQ-${Date.now()}`,
      bizType,
      effectiveDate,
      reason,
      status: '审批中',
    };
    setSelfRequests((prev) => [newReq, ...prev]);
    triggerToast('自助申请已提交', `「${bizType}」已推送至直属上级审批`);
  };

  const handleCalibrateGrade = (empId, grade, comment) => {
    setPerfRecords((prev) =>
      prev.map((r) =>
        r.id === empId ? { ...r, grade, managerComment: comment, status: '已校准' } : r
      )
    );
    triggerToast('绩效等级校准已保存', `员工 ${empId} 季度校准等级已更新为 ${grade}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex font-sans antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      {/* 1. 左侧极简导航栏 */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-[76px]' : 'w-[244px]'
        } bg-[#FAFAFC]/90 backdrop-blur-xl border-r border-black/[0.06] flex flex-col justify-between transition-all duration-200 shrink-0 sticky top-0 h-screen z-20`}
      >
        <div>
          <div className="h-16 px-4 flex items-center gap-3 border-b border-black/[0.04]">
            <div
              className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                activeApp === 'ats' ? 'bg-[#0071E3]' : 'bg-[#1D1D1F]'
              }`}
            >
              {activeApp === 'ats' ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-[#1D1D1F] truncate">
                  {activeApp === 'ats'
                    ? '招聘工作台'
                    : isEmployeeRole
                    ? '员工工作台'
                    : '人事工作台'}
                </div>
                <div className="text-[10px] font-medium text-[#86868B] tracking-wider uppercase truncate">
                  {activeApp === 'ats'
                    ? 'PEOPLEOS · ATS STUDIO'
                    : isEmployeeRole
                    ? 'PEOPLEOS · WORKSPACE'
                    : 'PEOPLEOS · HRIS PRO'}
                </div>
              </div>
            )}
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                activeApp === 'ats' ? atsActiveNav === item.id : activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    activeApp === 'ats' ? setAtsActiveNav(item.id) : setActiveNav(item.id)
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                    active
                      ? activeApp === 'ats'
                        ? 'bg-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]'
                        : 'bg-[#1D1D1F] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                      : 'text-[#515154] hover:bg-black/[0.04] hover:text-[#1D1D1F]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-white' : 'text-[#6E6E73]'
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full tabular-nums ${
                        active ? 'bg-white/20 text-white' : 'bg-[#FFF4E5] text-[#B25E00]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 space-y-2.5">
          {!sidebarCollapsed && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F2F2F7] to-white border border-black/[0.05]">
              <div className="text-xs font-semibold text-[#1D1D1F]">让每一份才华，被看见。</div>
              <div className="text-[11px] text-[#86868B] mt-0.5 leading-relaxed">
                {activeApp === 'ats'
                  ? 'ATS 与核心人事底座实时同源'
                  : '激活组织与人才的更多可能'}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-[#248A3D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                PeopleOS Core v3.0
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>收起侧栏</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 bg-white/75 backdrop-blur-xl border-b border-black/[0.05] sticky top-0 z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            {/* 全局顶部最左侧：同源底座子应用切换器 (App Switcher) */}
            {role === 'HR 主管' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAppSwitcher((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBF0] border border-black/[0.06] text-xs font-semibold text-[#1D1D1F] transition-all cursor-pointer"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeApp === 'ats' ? 'bg-[#0071E3]' : 'bg-[#1D1D1F]'
                    }`}
                  />
                  <span>{activeApp === 'ats' ? '招聘管理 (ATS)' : '核心人事 (HRIS)'}</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-[#86868B]" />
                </button>

                {showAppSwitcher && (
                  <>
                    <div
                      onClick={() => setShowAppSwitcher(false)}
                      className="fixed inset-0 z-30"
                    />
                    <div className="absolute left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_16px_44px_rgba(0,0,0,0.14)] border border-black/[0.08] p-2 z-40 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#86868B] uppercase flex items-center justify-between">
                        <span>PEOPLEOS 同源子应用工作台</span>
                        <Layers className="w-3 h-3" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveApp('hris');
                          setShowAppSwitcher(false);
                          triggerToast(
                            '已切换至「核心人事 (HRIS)」',
                            '花名册、入转调离、合同与考勤算薪同源联动'
                          );
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                          activeApp === 'hris'
                            ? 'bg-[#1D1D1F] text-white'
                            : 'hover:bg-[#F5F5F7] text-[#1D1D1F]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeApp === 'hris'
                                ? 'bg-white/15 text-white'
                                : 'bg-[#F5F5F7] text-[#1D1D1F]'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">核心人事 (HRIS)</div>
                            <div
                              className={`text-[10px] ${
                                activeApp === 'hris' ? 'text-white/70' : 'text-[#86868B]'
                              }`}
                            >
                              员工档案 · 入转调离 · 合同考勤绩效
                            </div>
                          </div>
                        </div>
                        {activeApp === 'hris' && <Check className="w-4 h-4 shrink-0" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveApp('ats');
                          setShowAppSwitcher(false);
                          triggerToast(
                            '已切换至「招聘管理 (ATS)」',
                            '已进入独立招聘工作台，录用结果自动同步入职管理'
                          );
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                          activeApp === 'ats'
                            ? 'bg-[#0071E3] text-white'
                            : 'hover:bg-[#F5F5F7] text-[#1D1D1F]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activeApp === 'ats'
                                ? 'bg-white/20 text-white'
                                : 'bg-[#EBF5FF] text-[#0071E3]'
                            }`}
                          >
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">招聘管理 (ATS)</div>
                            <div
                              className={`text-[10px] ${
                                activeApp === 'ats' ? 'text-white/80' : 'text-[#86868B]'
                              }`}
                            >
                              职位 HC · 面试漏斗 · Offer 与人才库
                            </div>
                          </div>
                        </div>
                        {activeApp === 'ats' && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <span className="text-[#D1D1D6]">/</span>
            <button
              onClick={() =>
                activeApp === 'ats' ? setAtsActiveNav('ats-funnel') : setActiveNav('dashboard')
              }
              className="text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
            >
              {activeApp === 'ats' ? 'ATS 招聘工作台' : isEmployeeRole ? '我的工作台' : '工作台'}
            </button>
            <span className="text-[#D1D1D6]">/</span>
            <span className="font-semibold text-[#1D1D1F]">{currentNavLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSpotlight(true)}
              className="hidden sm:flex items-center justify-between gap-6 px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBF0] text-xs text-[#86868B] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                搜索功能或模块...
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-black/[0.08] font-mono">
                ⌘ K
              </kbd>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] text-xs">
              <span className="text-[#86868B]">视角</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="font-semibold text-[#1D1D1F] bg-transparent outline-none cursor-pointer"
              >
                <option value="HR 主管">HR 主管</option>
                <option value="部门负责人">部门负责人</option>
                <option value="普通员工">普通员工</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-black/[0.06]">
              <div className="w-8 h-8 rounded-full bg-[#EFE6FA] text-[#6A1B9A] flex items-center justify-center text-xs font-bold">
                {currentUser.name.slice(-2)}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-bold text-[#1D1D1F]">{currentUser.name}</div>
                <div className="text-[10px] text-[#86868B]">{role}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
          {activeApp === 'ats' ? (
            <AtsFullSuiteWorkspace
              atsActiveNav={atsActiveNav}
              setAtsActiveNav={setAtsActiveNav}
              atsViewMode={atsViewMode}
              setAtsViewMode={setAtsViewMode}
              atsRegionMode={atsRegionMode}
              setAtsRegionMode={setAtsRegionMode}
              atsAnonymousMode={atsAnonymousMode}
              setAtsAnonymousMode={setAtsAnonymousMode}
              atsProgressView={atsProgressView}
              setAtsProgressView={setAtsProgressView}
              selectedAtsJobId={selectedAtsJobId}
              setSelectedAtsJobId={setSelectedAtsJobId}
              jobs={jobs}
              setJobs={setJobs}
              candidates={candidates}
              setCandidates={setCandidates}
              talentPool={talentPool}
              setTalentPool={setTalentPool}
              employees={employees}
              activeCandidateDrawer={activeCandidateDrawer}
              setActiveCandidateDrawer={setActiveCandidateDrawer}
              scorecardCandidate={scorecardCandidate}
              setScorecardCandidate={setScorecardCandidate}
              offerCandidate={offerCandidate}
              setOfferCandidate={setOfferCandidate}
              onUpdateCandidateStage={handleUpdateCandidateStage}
              onPublishJob={handlePublishJob}
              onTriggerToast={triggerToast}
              onboardingTasks={onboardingTasks}
              onJumpToOnboarding={() => {
                setActiveApp('hris');
                setActiveNav('onboarding');
              }}
            />
          ) : (
            <>
              {activeNav === 'dashboard' && (
                <DashboardOverview
                  employees={employees}
                  onboardingTasks={onboardingTasks}
                  lifecycleTasks={lifecycleTasks}
                  onNavigate={setActiveNav}
                  onOpenNewModal={() => setShowNewModal(true)}
                  role={role}
                  currentUser={currentUser}
                />
              )}

              {activeNav === 'employees' && (
                <EmployeesDirectoryView
                  employees={
                    isEmployeeRole
                      ? employees.filter((e) => e.id === currentUser.id)
                      : employees
                  }
                  onSelectEmployee={handleOpenEmployeeDetail}
                  onOpenNewModal={() => setShowNewModal(true)}
                  onExportCsv={handleExportCsv}
                  isSelfOnly={isEmployeeRole}
                />
              )}

              {activeNav === 'onboarding' && (
                <OnboardingModuleView
                  tasks={onboardingTasks}
                  onCompleteOnboarding={handleCompleteOnboarding}
                  onOpenNewModal={() => setShowNewModal(true)}
                />
              )}

              {activeNav === 'lifecycle' && (
                <LifecycleModuleView
                  tasks={lifecycleTasks}
                  onApproveTask={handleApproveLifecycle}
                  onRejectTask={handleRejectLifecycle}
                  onCreateTask={handleCreateLifecycleTask}
                  role={role}
                  currentUser={currentUser}
                  prefillModal={prefillLifecycleModal}
                  onClearPrefillModal={() => setPrefillLifecycleModal(null)}
                />
              )}

              {activeNav === 'contracts' && (
                <ContractsModuleView
                  employees={
                    role === 'HR 主管'
                      ? employees
                      : employees.filter((e) => e.id === currentUser.id)
                  }
                  onRenewContract={handleRenewContract}
                  onTerminateRenewal={handleTerminateRenewal}
                  isSelfOnly={role !== 'HR 主管'}
                />
              )}

              {activeNav === 'attendance' && (
                <AttendancePayrollView
                  employees={employees}
                  role={role}
                  currentUser={currentUser}
                  onTriggerToast={triggerToast}
                  unlocked={salaryUnlocked}
                  setUnlocked={setSalaryUnlocked}
                />
              )}

              {activeNav === 'certificates' && (
                <CertificatesModuleView
                  employees={employees}
                  onTriggerToast={triggerToast}
                  salaryUnlocked={salaryUnlocked}
                />
              )}

              {activeNav === 'self-service' && (
                <SelfServiceModuleView
                  currentUser={currentUser}
                  requests={selfRequests}
                  onSubmitRequest={handleSubmitSelfRequest}
                />
              )}

              {activeNav === 'performance' && (
                <PerformanceModuleView
                  records={perfRecords}
                  onCalibrateGrade={handleCalibrateGrade}
                  onSyncPayroll={() =>
                    triggerToast('全员绩效结果已同步', '校准结果已自动关联至本月算薪绩效奖金基数')
                  }
                  isSelfOnly={isEmployeeRole}
                  currentUser={currentUser}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. 居中自适应弹窗 A：新增员工完整建档 */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">新增员工入职登记与建档</h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  请按左侧模块如实填写员工档案；居民身份证限制 18 位数字，手机号码限制 11 位数字
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmployeeStandardFormSections form={newEmpForm} setForm={setNewEmpForm} />

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#86868B]">
                校验规则：手机号码 11 位数字 · 居民身份证 18 位数字 · 家庭成员必填一位
              </span>
              <div className="flex items-center gap-2">
                <AppleActionButton variant="secondary" onClick={() => setShowNewModal(false)}>
                  取消
                </AppleActionButton>
                <AppleActionButton variant="primary" icon={Check} onClick={handleCreateEmployee}>
                  确认创建完整档案
                </AppleActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 居中自适应弹窗 B：员工全息档案查看与编辑 */}
      {selectedEmployee && editEmpForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#1E7E34] flex items-center justify-center text-xs font-bold">
                  {selectedEmployee.name.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1D1D1F]">
                      {selectedEmployee.name} · 全息档案
                    </h3>
                    <StatusBadge status={selectedEmployee.status} />
                  </div>
                  <p className="text-xs text-[#86868B] font-mono mt-0.5">
                    {selectedEmployee.id} · {selectedEmployee.department} · {selectedEmployee.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setIsEditingEmp(false);
                }}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <EmployeeStandardFormSections
              form={editEmpForm}
              setForm={setEditEmpForm}
              readOnly={!isEditingEmp}
            />

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
              {role === 'HR 主管' && selectedEmployee.status !== '已离职' ? (
                <div className="flex items-center gap-2">
                  {selectedEmployee.status === '试用期' && (
                    <AppleActionButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setActiveNav('lifecycle');
                        setPrefillLifecycleModal({
                          type: '转正评估',
                          employeeName: selectedEmployee.name,
                          employeeId: selectedEmployee.id,
                          department: selectedEmployee.department,
                          role: selectedEmployee.role,
                        });
                      }}
                    >
                      发起转正流程
                    </AppleActionButton>
                  )}
                  <AppleActionButton
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setActiveNav('lifecycle');
                      setPrefillLifecycleModal({
                        type: '离职办理',
                        employeeName: selectedEmployee.name,
                        employeeId: selectedEmployee.id,
                        department: selectedEmployee.department,
                        role: selectedEmployee.role,
                      });
                    }}
                  >
                    发起离职流程
                  </AppleActionButton>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <AppleActionButton
                  variant="secondary"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setIsEditingEmp(false);
                  }}
                >
                  关闭
                </AppleActionButton>
                {role === 'HR 主管' &&
                  (isEditingEmp ? (
                    <AppleActionButton
                      variant="primary"
                      icon={Check}
                      onClick={handleSaveEmployeeEdit}
                    >
                      保存档案修改
                    </AppleActionButton>
                  ) : (
                    <AppleActionButton
                      variant="primary"
                      icon={Edit3}
                      onClick={() => setIsEditingEmp(true)}
                    >
                      编辑档案资料
                    </AppleActionButton>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Spotlight 全局快捷搜索弹窗 */}
      {showSpotlight && (
        <div
          onClick={() => setShowSpotlight(false)}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/25 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] border border-black/[0.08] overflow-hidden"
          >
            <div className="px-4 py-3.5 border-b border-black/[0.06] flex items-center gap-3">
              <Search className="w-4 h-4 text-[#86868B]" />
              <input
                autoFocus
                type="text"
                placeholder="输入模块名称或切换至 ATS 招聘工作台..."
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent"
              />
              <button
                onClick={() => setShowSpotlight(false)}
                className="text-xs text-[#86868B] px-2 py-0.5 rounded bg-[#F5F5F7] cursor-pointer"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              {navItems
                .filter((i) => i.label.includes(spotlightQuery))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (activeApp === 'ats') setAtsActiveNav(item.id);
                        else setActiveNav(item.id);
                        setShowSpotlight(false);
                        setSpotlightQuery('');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-[#F5F5F7] flex items-center justify-between text-xs font-medium text-[#1D1D1F] cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#6E6E73]" />
                        {item.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 6. 顶部轻提示 Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-[#1D1D1F]/95 text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl flex items-center gap-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <div className="text-xs">
            <div className="font-bold">{toast.title}</div>
            {toast.message && <div className="text-white/75 mt-0.5">{toast.message}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. 独立子应用：完整企业级 ATS 招聘管理工作台
// ==========================================
function AtsFullSuiteWorkspace({
  atsActiveNav,
  setAtsActiveNav,
  atsViewMode,
  setAtsViewMode,
  atsRegionMode,
  setAtsRegionMode,
  atsAnonymousMode,
  setAtsAnonymousMode,
  atsProgressView,
  setAtsProgressView,
  selectedAtsJobId,
  setSelectedAtsJobId,
  jobs,
  setJobs,
  candidates,
  setCandidates,
  talentPool,
  setTalentPool,
  employees,
  activeCandidateDrawer,
  setActiveCandidateDrawer,
  scorecardCandidate,
  setScorecardCandidate,
  offerCandidate,
  setOfferCandidate,
  onUpdateCandidateStage,
  onPublishJob,
  onTriggerToast,
  onboardingTasks = [],
  onJumpToOnboarding,
}) {
  // 全屏独立职位发布页状态
  const [jobAnchor, setJobAnchor] = useState('basic');
  const [showHrisQueueModal, setShowHrisQueueModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    department: '技术部',
    hcCode: 'HC-2026-TECH-08',
    title: '',
    level: 'P6',
    salaryBand: '28K - 38K · 15薪',
    locations: ['总部 · 现场办公'],
    remoteTag: '支持混合办公',
    empType: '全职',
    jdContent:
      '【岗位职责】\n1. 负责核心业务系统的架构设计与高可用演进；\n2. 主导生成式 AI 工作流与工程化效能提升。\n\n【任职要求】\n1. 3年以上相关研发或业务落地经验，具备扎实的代码功底；\n2. 良好的跨团队沟通与结果导向意识。',
    internalNote: '核心战略业务线，团队扁平氛围好，汇报给技术部负责人周予安。',
    stages: ['新投递', '初筛通过', '一面', '二面', 'Offer'],
    recruiter: '李明',
    hiringManager: '周予安',
    interviewers: ['周予安', '陆泽宇'],
    careerSite: true,
    internalReferral: true,
    externalChannels: ['Boss直聘', '猎聘', 'LinkedIn'],
    eeoStatement: true,
    gdprConsent: true,
  });

  // 招聘进度筛选
  const [progressSearch, setProgressSearch] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [rejectModalCand, setRejectModalCand] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState('专业技术深度与当前职级匹配度略低');

  // 候选人详情侧滑抽屉 (80% 宽) 内部状态
  const [drawerLeftTab, setDrawerLeftTab] = useState('structured'); // 'resume' | 'structured' | 'history'
  const [drawerRightTab, setDrawerRightTab] = useState('activity'); // 'activity' | 'comms'
  const [expandedScoreId, setExpandedScoreId] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [candidateLogs, setCandidateLogs] = useState({
    'CAN-01': [
      {
        id: 'LOG-1',
        time: '2026-11-24 16:20',
        author: '陈嘉宁',
        role: '用人经理',
        score: '4.9',
        verdict: 'Strong Yes（强力录用）',
        strengths: 'AIGC 视觉镜头语言极具电影感，独立主导过千万级播放短剧。',
        concerns: '期望薪资处于带宽上限，建议 HR 沟通定薪弹性。',
        isScorecard: true,
      },
      {
        id: 'LOG-2',
        time: '2026-11-22 10:15',
        author: '李明',
        role: 'HR 主管',
        text: '已完成初筛并推进至「Offer 待确认」，同步发起定薪审批。',
        isScorecard: false,
      },
    ],
  });

  // 面试评价表 (Interview Scorecard) 状态
  const [scForm, setScForm] = useState({
    techScore: '强烈推荐',
    commScore: '推荐',
    cultureScore: '强烈推荐',
    strengths: '',
    concerns: '',
    finalVerdict: 'Strong Yes',
  });

  // Offer 确认与入职衔接双栏工作台状态
  const [offerForm, setOfferForm] = useState({
    manager: '陈嘉宁',
    startDate: '2026-12-08',
    location: '总部 · 创新研发中心',
    baseMonthly: 32000,
    perfMonthly: 6000,
    months: 14,
    probationMonths: 3,
    probationRatio: 80,
    socialBase: 25000,
    annualBaseUsd: 120000,
    currency: 'USD',
    signOnBonus: 10000,
    bonusPct: 15,
    rsuShares: 2000,
    lang: 'zh',
    status: 'draft', // 'draft' | 'approved' | 'sent' | 'accepted'
  });

  const isOfferLocked = offerForm.status !== 'draft';
  const HC_OPTIONS = [
    { code: 'HC-2026-TECH-08', dept: '技术部', level: 'P6', band: '28K - 38K · 15薪' },
    { code: 'HC-2026-CREA-03', dept: '内容创作部', level: 'P6', band: '30K - 40K · 14薪' },
    { code: 'HC-2026-DES-02', dept: '视觉设计部', level: 'P5', band: '22K - 28K · 13薪' },
    { code: 'HC-2026-OPS-05', dept: '运营部', level: 'P5', band: '18K - 25K · 13薪' },
  ];

  // ==========================================
  // 1. 独立全屏职位发布页（Job Creation & Publishing）
  // ==========================================
  if (atsViewMode === 'job-create') {
    const anchors = [
      { id: 'basic', label: '1. 编制与基础信息' },
      { id: 'jd', label: '2. 职位描述 (JD)' },
      { id: 'pipeline', label: '3. 招聘流程与团队' },
      { id: 'channels', label: '4. 渠道分发与合规' },
    ];

    return (
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* 顶部固定操作栏 */}
        <div className="px-6 py-4 bg-[#FAFAFC] border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AppleActionButton size="xs" onClick={() => setAtsViewMode('dashboard')}>
              返回职位列表
            </AppleActionButton>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F]">发布新招聘职位</h2>
              <p className="text-[11px] text-[#86868B]">关联 Core HR 编制 HC 池，发布后实时同步至招聘漏斗</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AppleActionButton
              variant="secondary"
              onClick={() => onTriggerToast('职位草稿已保存', '已存入「职位管理 → 草稿箱」')}
            >
              保存草稿
            </AppleActionButton>
            <AppleActionButton
              variant="secondary"
              onClick={() =>
                onTriggerToast(
                  '已生成对外招聘官网预览',
                  `${newJobForm.title || '未命名职位'} · ${newJobForm.salaryBand}`
                )
              }
            >
              预览职位页面
            </AppleActionButton>
            <AppleActionButton
              variant="blue"
              icon={Check}
              disabled={!newJobForm.title.trim()}
              onClick={() => {
                onPublishJob({
                  title: newJobForm.title,
                  department: newJobForm.department,
                  headcount: 1,
                  location: newJobForm.locations.join(' / '),
                  salaryRange: newJobForm.salaryBand,
                });
                setAtsViewMode('dashboard');
                setAtsActiveNav('ats-jobs');
              }}
            >
              确认发布
            </AppleActionButton>
          </div>
        </div>

        {/* 左侧步骤锚点 20% + 右侧卡片主内容 80% */}
        <div className="flex flex-col md:flex-row min-h-[560px]">
          <div className="w-full md:w-[22%] border-b md:border-b-0 md:border-r border-black/[0.06] bg-[#FAFAFC]/60 p-4 space-y-1">
            {anchors.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setJobAnchor(a.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  jobAnchor === a.id
                    ? 'bg-[#EBF5FF] text-[#0071E3]'
                    : 'text-[#515154] hover:bg-black/[0.04]'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[680px]">
            {/* 模块一：编制与基础信息 */}
            <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4">
              <div className="text-sm font-bold text-[#1D1D1F]">模块一：编制与基础信息（关联 Core HR）</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1.5">关联部门 *</label>
                  <select
                    value={newJobForm.department}
                    onChange={(e) => setNewJobForm({ ...newJobForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                  >
                    {DEPARTMENTS.filter((d) => d !== '全部部门').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1.5">
                    关联空缺 HC 编号（自动带出职级与薪酬带宽） *
                  </label>
                  <select
                    value={newJobForm.hcCode}
                    onChange={(e) => {
                      const found = HC_OPTIONS.find((h) => h.code === e.target.value);
                      setNewJobForm({
                        ...newJobForm,
                        hcCode: e.target.value,
                        department: found ? found.dept : newJobForm.department,
                        level: found ? found.level : newJobForm.level,
                        salaryBand: found ? found.band : newJobForm.salaryBand,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none font-mono"
                  >
                    {HC_OPTIONS.map((h) => (
                      <option key={h.code} value={h.code}>
                        {h.code}（{h.dept} · {h.level}）
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1.5">职位名称 *</label>
                  <input
                    type="text"
                    placeholder="例如：高级 AIGC 算法架构师"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1.5">
                    自动锁定职级与薪酬带宽
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${newJobForm.level} 级 · ${newJobForm.salaryBand}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#EBF5FF]/70 text-[#0071E3] font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1.5">工作地点与办公模式</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['总部 · 现场办公', '上海研发中心', '支持混合办公', '全远程 Remote'].map((loc) => {
                      const active = newJobForm.locations.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() =>
                            setNewJobForm({
                              ...newJobForm,
                              locations: active
                                ? newJobForm.locations.filter((x) => x !== loc)
                                : [...newJobForm.locations, loc],
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            active
                              ? 'bg-[#0071E3] text-white border-[#0071E3]'
                              : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1.5">雇佣类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['全职', '实习', '外包'].map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setNewJobForm({ ...newJobForm, empType: tp })}
                        className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                          newJobForm.empType === tp
                            ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                            : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                        }`}
                      >
                        {tp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 模块二：职位描述 (JD) */}
            <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1D1D1F]">模块二：职位描述（JD）</span>
                <AppleActionButton
                  size="xs"
                  variant="blue"
                  icon={Sparkles}
                  onClick={() => {
                    setNewJobForm((prev) => ({
                      ...prev,
                      jdContent: `【核心使命】\n加入${prev.department}，主导「${
                        prev.title || '核心技术与创意岗位'
                      }」从 0 到 1 的架构落地与业务突破。\n\n【岗位职责】\n1. 负责前沿 AI 工程管线与多模态工作流设计，持续提升交付质量；\n2. 协同产品、设计与研发团队推进关键项目里程碑交付。\n\n【任职资格】\n1. 本科及以上学历，具备扎实的专业功底与代表性作品/项目案例；\n2. 具备极强的自驱力、结构化沟通能力与跨团队协作精神。`,
                    }));
                    onTriggerToast('AI 已完成 JD 智能润色', '已结合部门与职级生成标准职位描述');
                  }}
                >
                  AI 一键生成 / 润色 JD
                </AppleActionButton>
              </div>
              <textarea
                rows={6}
                value={newJobForm.jdContent}
                onChange={(e) => setNewJobForm({ ...newJobForm, jdContent: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-[#F5F5F7] outline-none leading-relaxed"
              />
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  对内可见备注（仅内部员工 / 内推可见，对外招聘官网隐藏）
                </label>
                <input
                  type="text"
                  value={newJobForm.internalNote}
                  onChange={(e) => setNewJobForm({ ...newJobForm, internalNote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EB] text-[#B25E00] outline-none"
                />
              </div>
            </div>

            {/* 模块三：招聘流程与协作团队 */}
            <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4 text-xs">
              <div className="text-sm font-bold text-[#1D1D1F]">模块三：招聘流程与协作团队</div>
              <div>
                <div className="font-medium text-[#6E6E73] mb-2">横向面试阶段配置器（支持动态增删阶段）</div>
                <div className="flex flex-wrap items-center gap-2">
                  {newJobForm.stages.map((st, idx) => (
                    <div
                      key={`${st}-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] font-semibold"
                    >
                      <span className="text-[10px] text-[#86868B]">{idx + 1}.</span>
                      <span>{st}</span>
                      {newJobForm.stages.length > 3 && idx > 0 && idx < newJobForm.stages.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setNewJobForm({
                              ...newJobForm,
                              stages: newJobForm.stages.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-[#86868B] hover:text-[#D70015] ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const nextRound = `加试轮次 ${newJobForm.stages.length - 2}`;
                      const copy = [...newJobForm.stages];
                      copy.splice(copy.length - 1, 0, nextRound);
                      setNewJobForm({ ...newJobForm, stages: copy });
                    }}
                    className="px-3 py-1.5 rounded-xl border border-dashed border-[#0071E3] text-[#0071E3] font-semibold hover:bg-[#EBF5FF] cursor-pointer"
                  >
                    + 添加面试轮次
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1">招聘负责人 (Recruiter)</label>
                  <input
                    type="text"
                    value={newJobForm.recruiter}
                    onChange={(e) => setNewJobForm({ ...newJobForm, recruiter: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6E6E73] mb-1">用人经理 (Hiring Manager)</label>
                  <input
                    type="text"
                    value={newJobForm.hiringManager}
                    onChange={(e) => setNewJobForm({ ...newJobForm, hiringManager: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 模块四：渠道分发与合规设置 */}
            <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4 text-xs">
              <div className="text-sm font-bold text-[#1D1D1F]">模块四：渠道分发与合规设置</div>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newJobForm.careerSite}
                    onChange={(e) => setNewJobForm({ ...newJobForm, careerSite: e.target.checked })}
                    className="accent-[#0071E3]"
                  />
                  <span>同步发布至企业招聘官网</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newJobForm.internalReferral}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, internalReferral: e.target.checked })
                    }
                    className="accent-[#0071E3]"
                  />
                  <span>开启全员内推悬赏通道</span>
                </label>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5F5F7]/80 border border-black/[0.05] space-y-2.5">
                <div className="font-bold text-[#1D1D1F] flex items-center justify-between">
                  <span>海外合规与反偏见设置（EEO / GDPR / 匿名化筛选）</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5FF] text-[#0071E3]">
                    GLOBAL COMPLIANCE
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJobForm.eeoStatement}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, eeoStatement: e.target.checked })
                      }
                      className="accent-[#0071E3]"
                    />
                    <span>附加 EEO 平等就业机会声明</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJobForm.gdprConsent}
                      onChange={(e) =>
                        setNewJobForm({ ...newJobForm, gdprConsent: e.target.checked })
                      }
                      className="accent-[#0071E3]"
                    />
                    <span>启用 GDPR 候选人数据隐私授权协议</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={atsAnonymousMode}
                      onChange={(e) => setAtsAnonymousMode(e.target.checked)}
                      className="accent-[#0071E3]"
                    />
                    <span>开启简历匿名化筛选（隐藏姓名与头像）</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 顶部全局状态栏（切换国内/海外模式 + 简历匿名化筛选开关 + 一键跳回 HRIS）
  const renderAtsTopBanner = () => (
    <div className="px-4 py-2.5 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#0071E3]">
          <Briefcase className="w-4 h-4" />
          ATS 招聘工作台
        </span>
        <div className="inline-flex p-0.5 rounded-xl bg-[#F5F5F7] border border-black/[0.05]">
          <button
            type="button"
            onClick={() => setAtsRegionMode('domestic')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
              atsRegionMode === 'domestic' ? 'bg-white text-[#1D1D1F] shadow-2xs' : 'text-[#6E6E73]'
            }`}
          >
            国内标准模式
          </button>
          <button
            type="button"
            onClick={() => setAtsRegionMode('overseas')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
              atsRegionMode === 'overseas' ? 'bg-white text-[#0071E3] shadow-2xs' : 'text-[#6E6E73]'
            }`}
          >
            海外全局模式 (Global)
          </button>
        </div>
        <label className="inline-flex items-center gap-1.5 text-[11px] text-[#515154] cursor-pointer">
          <input
            type="checkbox"
            checked={atsAnonymousMode}
            onChange={(e) => setAtsAnonymousMode(e.target.checked)}
            className="accent-[#0071E3]"
          />
          <span>匿名盲筛模式</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <AppleActionButton size="xs" variant="secondary" onClick={() => setShowHrisQueueModal(true)}>
          查看 HRIS 待入职队列 ({onboardingTasks.length})
        </AppleActionButton>
        <AppleActionButton
          size="xs"
          variant="blue"
          icon={Plus}
          onClick={() => setAtsViewMode('job-create')}
        >
          发布新职位
        </AppleActionButton>
      </div>
    </div>
  );

  // ==========================================
  // 2. 各 IA 子模块主体视图渲染
  // ==========================================
  const renderMainContent = () => {
    // 2.1 招聘工作台 (Recruiting Home)
    if (atsActiveNav === 'ats-home') {
      const activeInterviewOrOfferCands = candidates.filter(
        (c) =>
          c.stage === '初试筛选' ||
          c.stage === '专业复试中' ||
          c.stage === '终面通过' ||
          c.stage === 'Offer 待确认'
      );
      const tangCand = candidates.find((x) => x.id === 'CAN-01');
      const songCand = candidates.find((x) => x.id === 'CAN-02');
      const reminders = [
        tangCand &&
          tangCand.stage !== '已录用转入职' &&
          tangCand.stage !== '已淘汰归档' && {
            title: `${tangCand.name} · Offer 待候选人确认（已发送 48 小时）`,
            sub: `${tangCand.jobTitle} · 建议 HR 电话跟进签署意向`,
            action: () => setOfferCandidate(tangCand),
            btnText: '查看 Offer 中心',
          },
        songCand &&
          songCand.stage !== '已录用转入职' &&
          songCand.stage !== '已淘汰归档' && {
            title: `${songCand.name} · 终面已通过，待发起 Offer 审批`,
            sub: `${songCand.jobTitle} · 综合评分 ${songCand.score}`,
            action: () => setOfferCandidate(songCand),
            btnText: '立即拟定 Offer',
          },
      ].filter(Boolean);

      return (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
              RECRUITING HOME
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">招聘工作台</h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              今日面试日程、待填面试评价表与超时阶段催办提醒中心。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
              <div className="text-xs font-medium text-[#86868B]">今日待安排 / 进行中面试</div>
              <div className="text-3xl font-bold text-[#1D1D1F] mt-2 tabular-nums">
                {activeInterviewOrOfferCands.length} 场
              </div>
              <div className="text-[11px] text-[#0071E3] mt-1">14:00 叶知秋（专业复试）即将开始</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
              <div className="text-xs font-medium text-[#86868B]">待填写面试评价表</div>
              <div className="text-3xl font-bold text-[#D97706] mt-2 tabular-nums">2 份</div>
              <div className="text-[11px] text-[#86868B] mt-1">提交评价后方可查看其他面试官打分</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
              <div className="text-xs font-medium text-[#86868B]">阶段停留超 3 天预警</div>
              <div className="text-3xl font-bold text-[#D70015] mt-2 tabular-nums">1 人</div>
              <div className="text-[11px] text-[#86868B] mt-1">韩牧野（初试筛选停留 4 天）</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1D1D1F]">今日面试与待填评价</h2>
                <AppleActionButton size="xs" onClick={() => setAtsActiveNav('ats-progress')}>
                  进入招聘进度看板
                </AppleActionButton>
              </div>
              {activeInterviewOrOfferCands.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#86868B]">
                  当前暂无待面试或待评价候选人
                </div>
              ) : (
                activeInterviewOrOfferCands.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-[#FAFAFC] border border-black/[0.05] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1D1D1F]">
                        {atsAnonymousMode ? `候选人 #${c.id}` : c.name} · {c.jobTitle}
                      </div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">
                        面试官：{c.interviewer} · 当前节点：{c.stage}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AppleActionButton size="xs" onClick={() => setScorecardCandidate(c)}>
                        填写评价表
                      </AppleActionButton>
                      <AppleActionButton
                        size="xs"
                        variant="blue"
                        onClick={() => setActiveCandidateDrawer(c)}
                      >
                        审阅简历
                      </AppleActionButton>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-3">
              <h2 className="text-sm font-bold text-[#1D1D1F]">智能催办提醒</h2>
              {reminders.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#86868B]">
                  所有待审批及待确认 Offer 均已处理完毕
                </div>
              ) : (
                reminders.map((item) => (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-xl bg-[#FFF8EB]/70 border border-[#FF9500]/20 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1D1D1F]">{item.title}</div>
                      <div className="text-[11px] text-[#6E6E73] mt-0.5">{item.sub}</div>
                    </div>
                    <AppleActionButton size="xs" onClick={item.action}>
                      {item.btnText}
                    </AppleActionButton>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2.2 职位管理 (Jobs)
    if (atsActiveNav === 'ats-jobs') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
                JOB REQUISITIONS
              </div>
              <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">职位管理</h1>
              <p className="text-[13px] text-[#6E6E73] mt-1">
                在招 / 草稿 / 已关闭职位全生命周期管理，支持关联 Core HR 编制 HC 池。
              </p>
            </div>
            <AppleActionButton
              variant="blue"
              icon={Plus}
              onClick={() => setAtsViewMode('job-create')}
            >
              发布新招聘职位
            </AppleActionButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0071E3]">
                      {job.department} · {job.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                      招聘中 · {job.headcount} HC
                    </span>
                  </div>
                  <div className="text-base font-bold text-[#1D1D1F] mt-2">{job.title}</div>
                  <div className="text-xs text-[#6E6E73] mt-1">
                    {atsRegionMode === 'overseas'
                      ? `Global Remote / Singapore · Band: $120K - $155K / yr (USD)`
                      : `${job.location} · 薪酬带宽：${job.salaryRange}`}
                  </div>
                </div>

                <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-[#6E6E73]">
                    <span>新简历 {job.applicants}</span>
                    <span>面试中 {job.interviewing}</span>
                    <span className="font-bold text-[#1D1D1F]">Offer {job.offers}</span>
                  </div>
                  <AppleActionButton
                    size="xs"
                    onClick={() => {
                      setSelectedAtsJobId(job.id);
                      setAtsActiveNav('ats-progress');
                    }}
                  >
                    查看该职位看板
                  </AppleActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2.3 招聘进度 (Recruitment Progress — 单职位流转看板 + 全局职位进度表双视角)
    if (atsActiveNav === 'ats-progress') {
      const currentJob = jobs.find((j) => j.id === selectedAtsJobId) || jobs[0];
      const lanes = [
        { key: '初试筛选', label: '新投递 / 初筛' },
        { key: '专业复试中', label: '专业复试中' },
        { key: '终面通过', label: '终面通过' },
        { key: 'Offer 待确认', label: 'Offer 沟通中' },
        { key: '已录用转入职', label: '已录用' },
      ];

      const visibleCands = candidates.filter((c) => {
        if (c.jobId !== currentJob.id && c.jobTitle !== currentJob.title) return false;
        if (onlyMine && c.interviewer !== '李明' && c.interviewer !== '陈嘉宁') return false;
        if (progressSearch && !c.name.includes(progressSearch) && !c.jobTitle.includes(progressSearch)) {
          return false;
        }
        return true;
      });

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
                RECRUITMENT PROGRESS
              </div>
              <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">招聘进度</h1>
              <p className="text-[13px] text-[#6E6E73] mt-1">
                支持「单职位流转看板」与「全局职位进度表」双视角切换，卡片停留超 3 天自动预警。
              </p>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[#E8E8ED]">
              <button
                type="button"
                onClick={() => setAtsProgressView('kanban')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  atsProgressView === 'kanban'
                    ? 'bg-white text-[#1D1D1F] shadow-2xs'
                    : 'text-[#515154]'
                }`}
              >
                单职位看板视图
              </button>
              <button
                type="button"
                onClick={() => setAtsProgressView('list')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  atsProgressView === 'list'
                    ? 'bg-white text-[#1D1D1F] shadow-2xs'
                    : 'text-[#515154]'
                }`}
              >
                全局职位列表视图
              </button>
            </div>
          </div>

          {/* 顶部全局筛选栏 */}
          <div className="bg-white rounded-2xl p-3.5 border border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={selectedAtsJobId}
                onChange={(e) => setSelectedAtsJobId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] outline-none"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}（{j.department}）
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索候选人或职位..."
                  value={progressSearch}
                  onChange={(e) => setProgressSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-xl bg-[#F5F5F7] text-xs outline-none"
                />
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-[#515154] cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(e) => setOnlyMine(e.target.checked)}
                  className="accent-[#0071E3]"
                />
                <span>仅看我负责的</span>
              </label>
            </div>
            <div className="text-xs text-[#86868B]">
              当前聚焦：<span className="font-bold text-[#1D1D1F]">{currentJob.title}</span>
            </div>
          </div>

          {atsProgressView === 'kanban' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {lanes.map((lane) => {
                  const laneCards = visibleCands.filter((c) => c.stage === lane.key);
                  return (
                    <div
                      key={lane.key}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const draggedId = e.dataTransfer.getData('text/plain');
                        if (draggedId) onUpdateCandidateStage(draggedId, lane.key);
                      }}
                      className="bg-[#FAFAFC] rounded-2xl p-3 border border-black/[0.06] min-h-[380px] flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between px-1 py-1">
                        <span className="text-xs font-bold text-[#1D1D1F]">{lane.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-black/[0.06] text-[11px] font-bold text-[#0071E3]">
                          {laneCards.length}
                        </span>
                      </div>

                      {laneCards.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center py-10 text-[11px] text-[#86868B]">
                          暂无候选人
                        </div>
                      ) : (
                        laneCards.map((c, idx) => {
                          const stayDays = idx === 0 && lane.key === '初试筛选' ? 4 : 2;
                          const isOverdue = stayDays > 3;
                          return (
                            <div
                              key={c.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                              onClick={() => setActiveCandidateDrawer(c)}
                              className="bg-white rounded-xl p-3.5 border border-black/[0.06] shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-xs font-bold text-[#1D1D1F]">
                                  {atsAnonymousMode ? `候选人 #${c.id}` : c.name}
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-[#EBF5FF] text-[#0071E3] text-[10px] font-bold">
                                  {Math.round(Number(c.score) * 19)}% 匹配
                                </span>
                              </div>
                              <div className="text-[11px] text-[#6E6E73]">{c.exp}</div>
                              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-black/[0.04]">
                                <span
                                  className={
                                    isOverdue
                                      ? 'text-[#D70015] font-bold'
                                      : 'text-[#86868B]'
                                  }
                                >
                                  停留 {stayDays} 天 {isOverdue ? '· 超期预警' : ''}
                                </span>
                                <span className="text-[#0071E3] font-semibold">
                                  {lane.key === '初试筛选' ? '待安排面试' : '评价已齐'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 底部拖入淘汰专区 */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const draggedId = e.dataTransfer.getData('text/plain');
                  const found = candidates.find((x) => x.id === draggedId);
                  if (found) setRejectModalCand(found);
                }}
                className="p-3.5 rounded-2xl border border-dashed border-[#FF3B30]/40 bg-[#FFF2F2]/40 text-center text-xs text-[#D70015] font-medium"
              >
                将候选人卡片拖拽至此区域，或点击卡片进入详情执行「淘汰归档」
              </div>
            </div>
          ) : (
            /* 视角 B：全局职位进度表（管理者视角） */
            <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                    <th className="py-3.5 px-5">职位名称与部门</th>
                    <th className="py-3.5 px-4">招聘负责人</th>
                    <th className="py-3.5 px-4">HC 编制进度</th>
                    <th className="py-3.5 px-4">漏斗分布（投递 / 面试 / Offer）</th>
                    <th className="py-3.5 px-4">平均招聘周期</th>
                    <th className="py-3.5 px-5 text-right">当前状态预警</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] text-xs">
                  {jobs.map((j) => (
                    <tr
                      key={j.id}
                      onClick={() => {
                        setSelectedAtsJobId(j.id);
                        setAtsProgressView('kanban');
                      }}
                      className="hover:bg-[#FAFAFC] cursor-pointer"
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#1D1D1F]">{j.title}</div>
                        <div className="text-[11px] text-[#86868B]">
                          {j.department} · {j.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#515154]">李明</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#0071E3]">
                        已录用 {j.offers} / 需求 {j.headcount}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                        {j.applicants} / {j.interviewing} / {j.offers}
                      </td>
                      <td className="py-3.5 px-4 font-mono">15.5 天</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-[11px] font-semibold">
                          正常推进中
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // 2.4 候选人库 (Candidates)
    if (atsActiveNav === 'ats-candidates') {
      return (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
              CANDIDATES DIRECTORY
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">候选人库</h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              点击任意候选人可唤出右侧 80% 宽度全息审阅抽屉，支持简历预览、结构化评估与协作 @ 提醒。
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                  <th className="py-3.5 px-5">候选人</th>
                  <th className="py-3.5 px-4">应聘岗位</th>
                  <th className="py-3.5 px-4">所属部门</th>
                  <th className="py-3.5 px-4">
                    {atsRegionMode === 'overseas' ? 'Expected Annual (USD)' : '期望薪酬'}
                  </th>
                  <th className="py-3.5 px-4">
                    {atsRegionMode === 'overseas' ? 'Work Auth & Timezone' : '最快到岗'}
                  </th>
                  <th className="py-3.5 px-4">当前节点</th>
                  <th className="py-3.5 px-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs">
                {candidates.map((c, idx) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveCandidateDrawer(c)}
                    className="hover:bg-[#FAFAFC] cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">
                      {atsAnonymousMode ? `匿名候选人 #${c.id}` : c.name}
                      <div className="text-[11px] font-normal text-[#86868B]">{c.exp}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{c.jobTitle}</td>
                    <td className="py-3.5 px-4 text-[#6E6E73]">{c.department}</td>
                    <td className="py-3.5 px-4 font-mono">
                      {atsRegionMode === 'overseas'
                        ? `$${115 + idx * 10}K - $${135 + idx * 10}K / yr`
                        : c.expectedSalary}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6E6E73]">
                      {atsRegionMode === 'overseas'
                        ? 'Authorized · UTC+8 / PST'
                        : c.availableDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.stage} />
                    </td>
                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <AppleActionButton size="xs" onClick={() => setActiveCandidateDrawer(c)}>
                        审阅详情
                      </AppleActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 2.5 人才库 (Talent Pool)
    if (atsActiveNav === 'ats-talent') {
      return (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
              TALENT POOL
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">人才库</h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              沉淀未录用但具备长期跟踪价值的银牌储备候选人。
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
            {talentPool.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#86868B]">
                人才库还是空的，淘汰候选人时可以选择放入人才库
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                    <th className="py-3.5 px-5">姓名</th>
                    <th className="py-3.5 px-4">原应聘职位</th>
                    <th className="py-3.5 px-4">入库时间</th>
                    <th className="py-3.5 px-5 text-right">储备标签</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] text-xs">
                  {talentPool.map((tp) => (
                    <tr key={tp.id} className="hover:bg-[#FAFAFC]">
                      <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">{tp.name}</td>
                      <td className="py-3.5 px-4 text-[#1D1D1F]">{tp.role}</td>
                      <td className="py-3.5 px-4 font-mono text-[#6E6E73]">{tp.lastActive}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-[11px] font-semibold">
                          {tp.tag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    // 2.6 Offer 中心 (Offers)
    if (atsActiveNav === 'ats-offers') {
      const offerList = candidates.filter(
        (c) =>
          c.stage === '终面通过' ||
          c.stage === 'Offer 待确认' ||
          c.stage === '已录用转入职'
      );
      const getOfferDisplayStatus = (st) => {
        if (st === '已录用转入职') return '已转入 HRIS';
        if (st === 'Offer 待确认') return '已发送';
        return '待审批';
      };

      return (
        <div className="space-y-6">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
              OFFER CENTER
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">Offer 中心</h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              集中管理拟定、审批中、已发送及已签署转入 HRIS 的全部录用 Offer。
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
            {offerList.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#86868B]">暂无待审批或已发出的 Offer</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                    <th className="py-3.5 px-5">候选人</th>
                    <th className="py-3.5 px-4">应聘职位</th>
                    <th className="py-3.5 px-4">基本月薪</th>
                    <th className="py-3.5 px-4">状态</th>
                    <th className="py-3.5 px-5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] text-xs">
                  {offerList.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAFAFC]">
                      <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">{c.name}</td>
                      <td className="py-3.5 px-4 text-[#1D1D1F]">{c.jobTitle}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#1D1D1F]">
                        ¥ {offerForm.baseMonthly.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={getOfferDisplayStatus(c.stage)} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <AppleActionButton
                          size="xs"
                          onClick={() => {
                            setOfferForm((prev) => ({
                              ...prev,
                              status:
                                c.stage === '已录用转入职'
                                  ? 'accepted'
                                  : c.stage === 'Offer 待确认'
                                  ? 'sent'
                                  : 'draft',
                            }));
                            setOfferCandidate(c);
                          }}
                        >
                          查看
                        </AppleActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    // 2.7 招聘报表 (Analytics — 方案 A：由职位与候选人数据实时汇总计算，口径严格一致)
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);
    const totalInterviewing = jobs.reduce((sum, j) => sum + (j.interviewing || 0), 0);
    const totalOffers = jobs.reduce((sum, j) => sum + (j.offers || 0), 0);
    const totalHired = candidates.filter((c) => c.stage === '已录用转入职').length;

    const funnelSteps = [
      { stage: '简历投递总计', count: totalApplicants, pct: 100, conv: '100%' },
      {
        stage: '初筛通过进入面试',
        count: totalInterviewing,
        pct: totalApplicants ? Math.round((totalInterviewing / totalApplicants) * 100) : 0,
        conv: totalApplicants ? `${((totalInterviewing / totalApplicants) * 100).toFixed(1)}%` : '0%',
      },
      {
        stage: '正式发放 Offer',
        count: totalOffers,
        pct: totalApplicants ? Math.round((totalOffers / totalApplicants) * 100) : 0,
        conv: totalInterviewing ? `${((totalOffers / totalInterviewing) * 100).toFixed(1)}%` : '0%',
      },
      {
        stage: '候选人接受并转入职',
        count: totalHired,
        pct: totalApplicants ? Math.round((totalHired / totalApplicants) * 100) : 0,
        conv: totalOffers ? `${((totalHired / totalOffers) * 100).toFixed(1)}%` : '0%',
      },
    ];

    const deptProgressList = ['技术部', '内容创作部', '视觉设计部', '运营部'].map((dept) => {
      const deptJobs = jobs.filter((j) => j.department === dept);
      const target = deptJobs.reduce((s, j) => s + (j.headcount || 0), 0);
      const hired = deptJobs.reduce((s, j) => s + (j.offers || 0), 0);
      return {
        dept,
        hired,
        target,
        avgDays: dept === '技术部' ? '18.2 天' : dept === '内容创作部' ? '13.5 天' : '15.0 天',
        bottleneck:
          hired >= target && target > 0
            ? '当前在招 HC 已全部锁定 Offer'
            : '持续推进面试安排与候选人跟进',
      };
    });

    const channelMetrics = [
      {
        channel: '员工内部推荐',
        leads: Math.round(totalApplicants * 0.35),
        interviewRate: '42.0%',
        offers: Math.max(1, totalOffers),
        avgDays: '11.5 天',
        costPerHire: atsRegionMode === 'overseas' ? '$420' : '¥ 3,000',
        roiTag: '最高 ROI',
      },
      {
        channel: atsRegionMode === 'overseas' ? 'LinkedIn Talent' : 'Boss直聘企业版',
        leads: Math.round(totalApplicants * 0.4),
        interviewRate: '31.5%',
        offers: 1,
        avgDays: '17.2 天',
        costPerHire: atsRegionMode === 'overseas' ? '$890' : '¥ 6,200',
        roiTag: '主力渠道',
      },
      {
        channel: '企业招聘官网直投',
        leads: totalApplicants - Math.round(totalApplicants * 0.35) - Math.round(totalApplicants * 0.4),
        interviewRate: '25.0%',
        offers: 0,
        avgDays: '16.0 天',
        costPerHire: atsRegionMode === 'overseas' ? '$150' : '¥ 800',
        roiTag: '低成本沉淀',
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold tracking-widest text-[#0071E3] uppercase">
              RECRUITING ANALYTICS & INSIGHTS
            </div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mt-1">招聘报表</h1>
            <p className="text-[13px] text-[#6E6E73] mt-1">
              {atsRegionMode === 'overseas'
                ? 'Global Recruitment Funnel Conversion, Channel ROI & Time-to-Hire Metrics.'
                : '漏斗各环节转化率、招聘渠道 ROI 投入产出比与各部门招聘周期（Time to Hire）分析。'}
            </p>
          </div>
          <AppleActionButton
            variant="secondary"
            icon={Download}
            onClick={() =>
              onTriggerToast('招聘分析报告已导出', '已生成 2026 Q4 季度招聘漏斗与渠道 ROI 统计报表')
            }
          >
            导出分析报表
          </AppleActionButton>
        </div>

        {/* 核心 4 项指标卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
            <div className="text-xs text-[#86868B]">平均招聘周期 (Time to Hire)</div>
            <div className="text-3xl font-bold text-[#1D1D1F] mt-2 tabular-nums">16.5 天</div>
            <div className="text-[11px] text-[#248A3D] mt-1">较上季度缩短 4.2 天</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
            <div className="text-xs text-[#86868B]">Offer 接受率</div>
            <div className="text-3xl font-bold text-[#0071E3] mt-2 tabular-nums">90.9%</div>
            <div className="text-[11px] text-[#86868B] mt-1">11 份发出 · 10 份确认签署</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
            <div className="text-xs text-[#86868B]">单人平均招聘成本 (CPH)</div>
            <div className="text-3xl font-bold text-[#1D1D1F] mt-2 font-mono tabular-nums">
              {atsRegionMode === 'overseas' ? '$740' : '¥ 5,320'}
            </div>
            <div className="text-[11px] text-[#248A3D] mt-1">较预算基准节约 18.4%</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-black/[0.06]">
            <div className="text-xs text-[#86868B]">季度 HC 编制达成率</div>
            <div className="text-3xl font-bold text-[#248A3D] mt-2 tabular-nums">83.3%</div>
            <div className="text-[11px] text-[#86868B] mt-1">目标 12 HC · 已锁定 10 HC</div>
          </div>
        </div>

        {/* 漏斗各环节转化率 + 部门招聘周期对照 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1D1D1F]">招聘漏斗各环节转化率</h2>
              <span className="text-[11px] text-[#86868B]">统计周期：2026 Q4 季度</span>
            </div>
            <div className="space-y-3">
              {funnelSteps.map((step) => (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1D1D1F]">{step.stage}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[#86868B]">环节转化 {step.conv}</span>
                      <span className="font-bold text-[#0071E3] w-12 text-right">{step.count} 人</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0071E3] transition-all duration-300"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1D1D1F]">各部门招聘周期与 HC 进度</h2>
              <span className="text-[11px] text-[#86868B]">实时联动编制池</span>
            </div>
            <div className="space-y-3.5 text-xs">
              {deptProgressList.map((d) => (
                <div
                  key={d.dept}
                  className="p-3.5 rounded-xl bg-[#FAFAFC] border border-black/[0.05] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1D1D1F]">{d.dept}</span>
                    <span className="font-mono text-[#0071E3] font-semibold">
                      已录用 {d.hired}/{d.target} HC · 周期 {d.avgDays}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6E6E73]">诊断建议：{d.bottleneck}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 招聘渠道 ROI 投入产出对比表 */}
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-x-auto">
          <div className="p-5 border-b border-black/[0.05] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1D1D1F]">招聘渠道 ROI 与转化效能对比</h2>
            <span className="text-xs text-[#86868B]">按入职贡献与单人成本综合评估</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] text-[11px] font-semibold text-[#86868B]">
                <th className="py-3.5 px-5">招聘渠道名称</th>
                <th className="py-3.5 px-4">累计投递简历数</th>
                <th className="py-3.5 px-4">初筛进入面试率</th>
                <th className="py-3.5 px-4">发放 Offer 数</th>
                <th className="py-3.5 px-4">平均到岗周期</th>
                <th className="py-3.5 px-4">单人招聘成本 (CPH)</th>
                <th className="py-3.5 px-5 text-right">效能评级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs">
              {channelMetrics.map((ch) => (
                <tr key={ch.channel} className="hover:bg-[#FAFAFC]">
                  <td className="py-3.5 px-5 font-bold text-[#1D1D1F]">{ch.channel}</td>
                  <td className="py-3.5 px-4 font-mono">{ch.leads} 份</td>
                  <td className="py-3.5 px-4 font-mono text-[#0071E3] font-semibold">{ch.interviewRate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{ch.offers} 人</td>
                  <td className="py-3.5 px-4 font-mono text-[#6E6E73]">{ch.avgDays}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#1D1D1F]">{ch.costPerHire}</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                      {ch.roiTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderAtsTopBanner()}
      {renderMainContent()}

      {/* HRIS 待入职队列居中自适应预览弹窗（不再突兀跳出 ATS） */}
      {showHrisQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">HRIS 待入职同步队列（同源实时预览）</h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  以下候选人已由 ATS 录用并自动写入核心人事「入职管理」待报到名单
                </p>
              </div>
              <button
                onClick={() => setShowHrisQueueModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 text-xs">
              {onboardingTasks.length === 0 ? (
                <div className="text-center py-8 text-[#86868B]">当前暂无待报到入职记录</div>
              ) : (
                onboardingTasks.map((ob) => {
                  const checkedCount = Object.values(ob.checklist || {}).filter(Boolean).length;
                  return (
                    <div
                      key={ob.id}
                      className="p-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1D1D1F]">{ob.candidateName}</span>
                          <span className="text-[#6E6E73]">
                            {ob.department} · {ob.role}
                          </span>
                          <StatusBadge status={ob.stage} />
                        </div>
                        <div className="text-[11px] text-[#86868B] font-mono">
                          单号：{ob.id} · 预计报到：{ob.expectedDate} · 入职材料齐全度：{checkedCount}/5 项
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0071E3] shrink-0">
                        已同步至 Core HR
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-[#86868B]">
                如需核验身份证/体检报告原件并分配正式工号，可前往 HRIS 入职管理
              </span>
              <div className="flex items-center gap-2">
                <AppleActionButton variant="secondary" onClick={() => setShowHrisQueueModal(false)}>
                  关闭弹窗
                </AppleActionButton>
                <AppleActionButton
                  variant="primary"
                  onClick={() => {
                    setShowHrisQueueModal(false);
                    onJumpToOnboarding();
                  }}
                >
                  前往 HRIS 办理建档
                </AppleActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 淘汰原因轻量弹窗 */}
      {rejectModalCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] space-y-4">
            <h3 className="text-base font-bold text-[#1D1D1F]">
              淘汰归档 · {rejectModalCand.name}
            </h3>
            <div>
              <label className="block text-xs font-medium text-[#6E6E73] mb-1.5">选择淘汰归因</label>
              <select
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none"
              >
                <option value="专业技术深度与当前职级匹配度略低">专业技术深度与当前职级匹配度略低</option>
                <option value="期望薪酬超出岗位预算上限">期望薪酬超出岗位预算上限</option>
                <option value="到岗时间与业务项目排期冲突">到岗时间与业务项目排期冲突</option>
                <option value="进入人才库作为银牌储备候选人">进入人才库作为银牌储备候选人</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <AppleActionButton variant="secondary" onClick={() => setRejectModalCand(null)}>
                取消
              </AppleActionButton>
              <AppleActionButton
                variant="danger"
                onClick={() => {
                  if (rejectReasonText === '进入人才库作为银牌储备候选人') {
                    setTalentPool((prev) => [
                      {
                        id: `TP-${Date.now()}`,
                        name: rejectModalCand.name,
                        role: rejectModalCand.jobTitle,
                        company: rejectModalCand.exp,
                        tag: '银牌储备候选人',
                        score: rejectModalCand.score,
                        lastActive: '2026-11-25',
                      },
                      ...prev,
                    ]);
                  }
                  onUpdateCandidateStage(rejectModalCand.id, '已淘汰归档');
                  setRejectModalCand(null);
                }}
              >
                确认淘汰归档
              </AppleActionButton>
            </div>
          </div>
        </div>
      )}

      {/* 3. 候选人详情页：右侧宽抽屉（Slide-over Drawer，宽度占屏幕 80%，保留左侧 20% 遮罩点击关闭） */}
      {activeCandidateDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
          <div className="w-[20%] h-full" onClick={() => setActiveCandidateDrawer(null)} />
          <div className="w-[80%] h-full bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.16)] border-l border-black/[0.08] flex flex-col">
            {/* 顶部固定操作头 (Sticky Header) */}
            <div className="px-6 py-4 border-b border-black/[0.06] bg-[#FAFAFC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF5FF] text-[#0071E3] flex items-center justify-center text-xs font-bold">
                  {atsAnonymousMode ? '盲筛' : activeCandidateDrawer.name.slice(-2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1D1D1F]">
                      {atsAnonymousMode
                        ? `匿名候选人 #${activeCandidateDrawer.id}`
                        : activeCandidateDrawer.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#F5F5F7] text-xs font-semibold text-[#515154]">
                      {activeCandidateDrawer.jobTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-semibold">
                      员工内推渠道
                    </span>
                  </div>
                  <div className="text-[11px] text-[#86868B] mt-0.5">{activeCandidateDrawer.exp}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={activeCandidateDrawer.stage}
                  onChange={(e) => {
                    const next = e.target.value;
                    onUpdateCandidateStage(activeCandidateDrawer.id, next);
                    setActiveCandidateDrawer({ ...activeCandidateDrawer, stage: next });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] text-xs font-semibold outline-none"
                >
                  {['初试筛选', '专业复试中', '终面通过', 'Offer 待确认', '已录用转入职', '已淘汰归档'].map(
                    (st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    )
                  )}
                </select>
                <AppleActionButton
                  size="xs"
                  variant="secondary"
                  onClick={() => setScorecardCandidate(activeCandidateDrawer)}
                >
                  填写面试评价表
                </AppleActionButton>
                <AppleActionButton
                  size="xs"
                  variant="blue"
                  onClick={() => {
                    setOfferCandidate(activeCandidateDrawer);
                    setActiveCandidateDrawer(null);
                  }}
                >
                  拟定 / 确认 Offer
                </AppleActionButton>
                <AppleActionButton
                  size="xs"
                  variant="danger"
                  onClick={() => {
                    setRejectModalCand(activeCandidateDrawer);
                    setActiveCandidateDrawer(null);
                  }}
                >
                  淘汰
                </AppleActionButton>
                <button
                  onClick={() => setActiveCandidateDrawer(null)}
                  className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 左右双栏分屏：左侧主内容 60% + 右侧协同记录 40% */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* 左侧 60% */}
              <div className="w-full lg:w-[60%] border-b lg:border-b-0 lg:border-r border-black/[0.06] p-6 overflow-y-auto space-y-5">
                <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
                  {[
                    { id: 'structured', label: '结构化简历档案' },
                    { id: 'resume', label: '原始简历预览 (PDF)' },
                    { id: 'history', label: '历史投递记录' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDrawerLeftTab(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        drawerLeftTab === t.id
                          ? 'bg-[#1D1D1F] text-white'
                          : 'text-[#6E6E73] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* 核心信息卡片（按国内 / 海外模式自动切换高亮字段） */}
                <div className="p-4 rounded-2xl bg-[#F5F5F7]/90 border border-black/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {atsRegionMode === 'domestic' ? (
                    <>
                      <div>
                        <div className="text-[11px] text-[#86868B]">年龄 / 学历</div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5">28 岁 · 硕士</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">期望薪资</div>
                        <div className="font-bold text-[#0071E3] mt-0.5 font-mono">
                          {activeCandidateDrawer.expectedSalary}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">当前状态</div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5">在职 · 考虑机会</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">最快到岗时间</div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5 font-mono">
                          {activeCandidateDrawer.availableDate}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-[11px] text-[#86868B]">Work Authorization</div>
                        <div className="font-bold text-[#248A3D] mt-0.5">Authorized / No Visa Req</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">Expected Annual</div>
                        <div className="font-bold text-[#0071E3] mt-0.5 font-mono">$115K - $135K</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">LinkedIn Profile</div>
                        <div className="font-bold text-[#0071E3] mt-0.5 underline">linkedin.com/in/pro</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#86868B]">Local Timezone</div>
                        <div className="font-bold text-[#1D1D1F] mt-0.5">UTC+8 / PST Overlap</div>
                      </div>
                    </>
                  )}
                </div>

                {drawerLeftTab === 'structured' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl border border-black/[0.06] space-y-2">
                      <div className="font-bold text-[#1D1D1F]">核心项目与工作经历</div>
                      <p className="text-[#515154] leading-relaxed">
                        主导新一代多模态内容生成管线设计，结合 ComfyUI 自定义节点与实时渲染调度引擎，将单集视频制作周期由 5 天压缩至 14 小时。
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl border border-black/[0.06] space-y-2">
                      <div className="font-bold text-[#1D1D1F]">面试官初评摘要</div>
                      <p className="text-[#515154] leading-relaxed">
                        {activeCandidateDrawer.evaluation}
                      </p>
                    </div>
                  </div>
                )}

                {drawerLeftTab === 'resume' && (
                  <div className="p-8 rounded-2xl border border-black/[0.08] bg-[#FAFAFC] text-center space-y-2 text-xs">
                    <FileText className="w-8 h-8 text-[#0071E3] mx-auto" />
                    <div className="font-bold text-[#1D1D1F]">
                      {atsAnonymousMode
                        ? `匿名简历附件_${activeCandidateDrawer.id}.pdf`
                        : `${activeCandidateDrawer.name}_个人简历_2026.pdf`}
                    </div>
                    <p className="text-[#86868B]">原始 PDF 渲染预览已就绪 · 支持关键词高亮检索</p>
                  </div>
                )}

                {drawerLeftTab === 'history' && (
                  <div className="p-4 rounded-2xl border border-black/[0.06] text-xs text-[#6E6E73]">
                    首次投递该岗位 · 暂无历史重复投递记录。
                  </div>
                )}
              </div>

              {/* 右侧协同记录区 40% */}
              <div className="w-full lg:w-[40%] flex flex-col bg-[#FAFAFC]/70">
                <div className="px-5 py-3 border-b border-black/[0.06] flex items-center gap-2">
                  {[
                    { id: 'activity', label: '动态与评价 (Scorecards)' },
                    { id: 'comms', label: '沟通记录 (Email/SMS)' },
                  ].map((rt) => (
                    <button
                      key={rt.id}
                      onClick={() => setDrawerRightTab(rt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        drawerRightTab === rt.id
                          ? 'bg-white text-[#1D1D1F] shadow-2xs'
                          : 'text-[#6E6E73]'
                      }`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-3 text-xs">
                  {drawerRightTab === 'activity' ? (
                    (candidateLogs[activeCandidateDrawer.id] || candidateLogs['CAN-01']).map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-white border border-black/[0.06] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1D1D1F]">
                            {log.author} · <span className="font-normal text-[#86868B]">{log.role}</span>
                          </span>
                          <span className="text-[10px] font-mono text-[#86868B]">{log.time}</span>
                        </div>
                        {log.isScorecard ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-bold">
                                {log.verdict}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedScoreId(expandedScoreId === log.id ? null : log.id)
                                }
                                className="text-[#0071E3] font-semibold cursor-pointer"
                              >
                                {expandedScoreId === log.id ? '收起明细' : '展开评价明细'}
                              </button>
                            </div>
                            {expandedScoreId === log.id && (
                              <div className="pt-2 border-t border-black/[0.05] text-[#515154] space-y-1">
                                <div>
                                  <span className="font-semibold text-[#1D1D1F]">核心优势：</span>
                                  {log.strengths}
                                </div>
                                <div>
                                  <span className="font-semibold text-[#1D1D1F]">潜在顾虑：</span>
                                  {log.concerns}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[#515154]">{log.text}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-1.5">
                      <div className="font-bold text-[#1D1D1F]">面试邀请邮件已发送</div>
                      <div className="text-[#6E6E73]">
                        已向候选人发送线上视频会议链接与面试日程确认函。
                      </div>
                    </div>
                  )}
                </div>

                {/* 底部固定 @ 同事协作输入框 */}
                <div className="p-4 bg-white border-t border-black/[0.06] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="输入内部协同备注，支持 @同事 发送通知..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#F5F5F7] text-xs outline-none"
                  />
                  <AppleActionButton
                    size="xs"
                    variant="blue"
                    disabled={!noteInput.trim()}
                    onClick={() => {
                      const cid = activeCandidateDrawer.id;
                      const prevList = candidateLogs[cid] || candidateLogs['CAN-01'];
                      setCandidateLogs({
                        ...candidateLogs,
                        [cid]: [
                          {
                            id: `NOTE-${Date.now()}`,
                            time: '刚刚',
                            author: '李明',
                            role: 'HR 主管',
                            text: noteInput,
                            isScorecard: false,
                          },
                          ...prevList,
                        ],
                      });
                      setNoteInput('');
                      onTriggerToast('内部备注已发布', '已通知相关协同面试官');
                    }}
                  >
                    发送
                  </AppleActionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 面试评价表（Interview Scorecard — 左右对照分屏弹窗） */}
      {scorecardCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  结构化面试评价表 · {scorecardCandidate.name}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  应聘岗位：{scorecardCandidate.jobTitle} · 4 档互斥评估体系（杜绝骑墙分）
                </p>
              </div>
              <button
                onClick={() => setScorecardCandidate(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row max-h-[68vh] overflow-y-auto">
              {/* 左侧 45% 参考区 */}
              <div className="w-full md:w-[42%] bg-[#FAFAFC] p-6 border-b md:border-b-0 md:border-r border-black/[0.06] space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-2">
                  <div className="font-bold text-[#0071E3]">HR 预设本轮重点考察项</div>
                  <ul className="list-disc pl-4 space-y-1 text-[#515154]">
                    <li>复杂 AIGC 工程或创意项目的独立架构与交付深度</li>
                    <li>跨职能团队协作中的结构化表达与推进力</li>
                    <li>对快速迭代与高标准产出的文化契合度</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-black/[0.06] space-y-1.5">
                  <div className="font-bold text-[#1D1D1F]">候选人简历核心摘要</div>
                  <p className="text-[#6E6E73] leading-relaxed">{scorecardCandidate.exp}</p>
                  <p className="text-[#515154] leading-relaxed">{scorecardCandidate.evaluation}</p>
                </div>
              </div>

              {/* 右侧 55% 评分表单区 */}
              <div className="flex-1 p-6 space-y-5 text-xs">
                <div className="space-y-3">
                  <div className="font-bold text-[#1D1D1F]">区块一：分项维度评分（4 档明确互斥）</div>
                  {[
                    { key: 'techScore', label: '专业技术 / 业务核心能力' },
                    { key: 'commScore', label: '逻辑思维与结构化沟通' },
                    { key: 'cultureScore', label: '文化价值观与自驱力匹配' },
                  ].map((dim) => (
                    <div key={dim.key} className="space-y-1.5">
                      <div className="font-medium text-[#515154]">{dim.label}</div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['强烈不推荐', '不推荐', '推荐', '强烈推荐'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setScForm({ ...scForm, [dim.key]: opt })}
                            className={`py-1.5 rounded-lg font-semibold border text-[11px] cursor-pointer ${
                              scForm[dim.key] === opt
                                ? opt.includes('不推荐')
                                  ? 'bg-[#D70015] text-white border-[#D70015]'
                                  : 'bg-[#0071E3] text-white border-[#0071E3]'
                                : 'bg-[#F5F5F7] text-[#515154] border-transparent'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1D1D1F] mb-1">核心优势 (Strengths)</label>
                    <textarea
                      rows={2}
                      placeholder="请列举候选人最突出的亮点..."
                      value={scForm.strengths}
                      onChange={(e) => setScForm({ ...scForm, strengths: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1D1D1F] mb-1">潜在风险 / 顾虑 (Concerns)</label>
                    <textarea
                      rows={2}
                      placeholder="如有需下一轮重点验证的疑点请注明..."
                      value={scForm.concerns}
                      onChange={(e) => setScForm({ ...scForm, concerns: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-[#1D1D1F]">区块三：最终录用结论（必填） *</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Strong Yes', desc: '强力录用' },
                      { id: 'Yes', desc: '同意录用' },
                      { id: 'No', desc: '不予录用' },
                      { id: 'Strong No', desc: '坚决淘汰' },
                    ].map((v) => {
                      const active = scForm.finalVerdict === v.id;
                      const isNo = v.id.includes('No');
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setScForm({ ...scForm, finalVerdict: v.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? isNo
                                ? 'bg-[#FFF2F2] border-[#D70015] text-[#D70015]'
                                : 'bg-[#EBF5FF] border-[#0071E3] text-[#0071E3]'
                              : 'bg-[#FAFAFC] border-black/[0.06] text-[#1D1D1F]'
                          }`}
                        >
                          <div className="font-bold">{v.id}</div>
                          <div className="text-[11px] opacity-80">{v.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#86868B] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                防偏见提示：提交评价后，您才能查看本轮其他面试官的评价内容
              </span>
              <div className="flex items-center gap-2">
                <AppleActionButton variant="secondary" onClick={() => setScorecardCandidate(null)}>
                  取消
                </AppleActionButton>
                <AppleActionButton
                  variant="blue"
                  icon={Check}
                  onClick={() => {
                    const cid = scorecardCandidate.id;
                    const prevList = candidateLogs[cid] || candidateLogs['CAN-01'];
                    setCandidateLogs({
                      ...candidateLogs,
                      [cid]: [
                        {
                          id: `SC-${Date.now()}`,
                          time: '刚刚',
                          author: '李明',
                          role: '面试官',
                          score: '4.9',
                          verdict: scForm.finalVerdict,
                          strengths: scForm.strengths || '综合能力优秀，匹配岗位预期',
                          concerns: scForm.concerns || '无明显短板',
                          isScorecard: true,
                        },
                        ...prevList,
                      ],
                    });
                    onTriggerToast(
                      '结构化面试评价表已提交',
                      `已解锁本轮其他面试官评价记录（结论：${scForm.finalVerdict}）`
                    );
                    setScorecardCandidate(null);
                  }}
                >
                  提交面试评价
                </AppleActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Offer 确认与入职衔接双栏工作台（Offer & Onboarding Handoff） */}
      {offerCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F]">
                  Offer 确认与入职衔接工作台 · {offerCandidate.name}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  左侧配置薪酬包与审批流，右侧实时渲染 Offer 函并支持一键转入 Core HR 待入职名单
                </p>
              </div>
              <button
                onClick={() => setOfferCandidate(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F7] text-[#86868B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[72vh] overflow-y-auto">
              {/* 左侧 45%：Offer 参数配置区 */}
              <div className="w-full lg:w-[45%] p-6 border-b lg:border-b-0 lg:border-r border-black/[0.06] space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#1D1D1F]">1. 入职基本信息</div>
                  {isOfferLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: 'draft' });
                        onTriggerToast('Offer 已撤回为待审批', '现在可以重新编辑薪资与入职参数');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF5E6] text-[#B25E00] text-[11px] font-semibold hover:bg-[#FFE8C2] cursor-pointer"
                    >
                      撤回并重新审批
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">入职职位（自动锁定）</label>
                    <input
                      type="text"
                      disabled
                      value={offerCandidate.jobTitle}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">汇报对象（读取 Core HR）</label>
                    <select
                      disabled={isOfferLocked}
                      value={offerForm.manager}
                      onChange={(e) => setOfferForm({ ...offerForm, manager: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                    >
                      {employees.slice(0, 6).map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}（{emp.role}）
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">预计入职日期</label>
                    <input
                      type="date"
                      disabled={isOfferLocked}
                      value={offerForm.startDate}
                      onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6E6E73] mb-1">工作地点</label>
                    <input
                      type="text"
                      disabled={isOfferLocked}
                      value={offerForm.location}
                      onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="font-bold text-[#1D1D1F] pt-2">
                  2. 薪酬包配置（{atsRegionMode === 'domestic' ? '国内标准模板' : '海外全局模板'}）
                </div>
                {atsRegionMode === 'domestic' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">基本月薪 (元)</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.baseMonthly}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, baseMonthly: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">绩效奖金基数 (元)</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.perfMonthly}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, perfMonthly: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">薪资月数</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.months}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, months: Number(e.target.value) || 12 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">试用期薪资比例 (%)</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.probationRatio}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, probationRatio: Number(e.target.value) || 80 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">Base Annual Salary</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.annualBaseUsd}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, annualBaseUsd: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">Currency</label>
                      <select
                        disabled={isOfferLocked}
                        value={offerForm.currency}
                        onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none disabled:opacity-60"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="SGD">SGD (S$)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">Sign-on Bonus</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.signOnBonus}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, signOnBonus: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#6E6E73] mb-1">RSU / Option Grants</label>
                      <input
                        type="number"
                        disabled={isOfferLocked}
                        value={offerForm.rsuShares}
                        onChange={(e) =>
                          setOfferForm({ ...offerForm, rsuShares: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#F5F5F7] outline-none font-mono disabled:opacity-60"
                      />
                    </div>
                  </div>
                )}

                {/* 合规校验条：对比 Core HR 薪酬带宽 */}
                {offerForm.baseMonthly > 35000 && atsRegionMode === 'domestic' ? (
                  <div className="p-3 rounded-xl bg-[#FFF5E6] border border-[#FF9500]/30 text-[#B25E00] text-[11px] font-medium">
                    薪酬带宽预警：当前基本月薪超出岗位标准带宽上限（35,000 元），已自动追加「HRD + 财务BP」特批节点。
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#EAF8EE] text-[#1E7E34] text-[11px] font-medium">
                    合规校验通过：定薪处于 Core HR 对应职级标准薪酬带宽内。
                  </div>
                )}

                <div className="text-[11px] text-[#86868B]">
                  审批链路预览：用人总监（{offerForm.manager}） → HR 主管（李明） →{' '}
                  {offerForm.baseMonthly > 35000 ? '财务 BP 特批' : '自动归档发函'}
                </div>
              </div>

              {/* 右侧 55%：Offer 函实时预览与状态流转 */}
              <div className="w-full lg:w-[55%] p-6 bg-[#FAFAFC] flex flex-col justify-between space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {['审批通过', '已发送候选人', '候选人已接受'].map((step, i) => {
                        const activeStep =
                          (i === 0 && offerForm.status !== 'draft') ||
                          (i === 1 && (offerForm.status === 'sent' || offerForm.status === 'accepted')) ||
                          (i === 2 && offerForm.status === 'accepted');
                        return (
                          <span
                            key={step}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              activeStep
                                ? 'bg-[#0071E3] text-white'
                                : 'bg-white text-[#86868B] border border-black/[0.06]'
                            }`}
                          >
                            {i + 1}. {step}
                          </span>
                        );
                      })}
                    </div>
                    <div className="inline-flex p-0.5 rounded-lg bg-white border border-black/[0.06]">
                      <button
                        type="button"
                        onClick={() => setOfferForm({ ...offerForm, lang: 'zh' })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          offerForm.lang === 'zh' ? 'bg-[#1D1D1F] text-white' : 'text-[#6E6E73]'
                        }`}
                      >
                        中文函
                      </button>
                      <button
                        type="button"
                        onClick={() => setOfferForm({ ...offerForm, lang: 'en' })}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          offerForm.lang === 'en' ? 'bg-[#1D1D1F] text-white' : 'text-[#6E6E73]'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* 正式 Offer 文档预览卡片 */}
                  <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-3 leading-6">
                    <div className="text-center font-bold text-base text-[#1D1D1F]">
                      {offerForm.lang === 'zh' ? '录用通知书 (OFFER LETTER)' : 'OFFICIAL OFFER OF EMPLOYMENT'}
                    </div>
                    <p>
                      {offerForm.lang === 'zh'
                        ? `尊敬的 ${offerCandidate.name}：`
                        : `Dear ${offerCandidate.name},`}
                    </p>
                    <p className="text-[#515154]">
                      {offerForm.lang === 'zh'
                        ? `我们非常荣幸地通知您，您已通过我司全部面试评估，正式邀请您加入「${offerCandidate.department}」担任「${offerCandidate.jobTitle}」一职，汇报对象为 ${offerForm.manager}，预计入职日期为 ${offerForm.startDate}。`
                        : `We are pleased to offer you the position of ${offerCandidate.jobTitle} in ${offerCandidate.department}, reporting to ${offerForm.manager}, with an anticipated start date of ${offerForm.startDate}.`}
                    </p>
                    <div className="p-3 rounded-xl bg-[#F5F5F7] font-mono text-[11px] text-[#1D1D1F]">
                      {atsRegionMode === 'domestic'
                        ? `薪酬结构：基本月薪 ¥${offerForm.baseMonthly.toLocaleString()} + 绩效基数 ¥${offerForm.perfMonthly.toLocaleString()}（全年 ${offerForm.months} 薪，试用期按 ${offerForm.probationRatio}% 发放）`
                        : `Compensation: ${offerForm.currency} ${offerForm.annualBaseUsd.toLocaleString()}/yr Base + ${offerForm.signOnBonus.toLocaleString()} Sign-on + ${offerForm.rsuShares} RSUs`}
                    </div>
                  </div>
                </div>

                {/* 状态推进与最终转入 Core HR 待入职闭环按钮 */}
                <div className="pt-3 border-t border-black/[0.06] flex flex-wrap items-center justify-end gap-2">
                  {offerForm.status === 'draft' && (
                    <AppleActionButton
                      variant="primary"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: 'approved' });
                        onTriggerToast('Offer 审批已通过', '配置已锁定，可立即发送电子签 Offer');
                      }}
                    >
                      提交审批
                    </AppleActionButton>
                  )}
                  {offerForm.status === 'approved' && (
                    <AppleActionButton
                      variant="blue"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: 'sent' });
                        onUpdateCandidateStage(offerCandidate.id, 'Offer 待确认');
                        onTriggerToast('电子签 Offer 已发送', '已推送至候选人邮箱与短信签署链接');
                      }}
                    >
                      发送电子签 Offer
                    </AppleActionButton>
                  )}
                  {offerForm.status === 'sent' && (
                    <AppleActionButton
                      variant="secondary"
                      onClick={() => {
                        setOfferForm({ ...offerForm, status: 'accepted' });
                        onUpdateCandidateStage(offerCandidate.id, '已录用转入职', {
                          startDate: offerForm.startDate,
                          baseMonthly: offerForm.baseMonthly,
                          perfMonthly: offerForm.perfMonthly,
                          probationRatio: offerForm.probationRatio,
                          manager: offerForm.manager,
                          level: 'P6',
                        });
                      }}
                    >
                      确认候选人已电子签署
                    </AppleActionButton>
                  )}
                  {offerForm.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateCandidateStage(offerCandidate.id, '已录用转入职', {
                          startDate: offerForm.startDate,
                          baseMonthly: offerForm.baseMonthly,
                          perfMonthly: offerForm.perfMonthly,
                          probationRatio: offerForm.probationRatio,
                          manager: offerForm.manager,
                          level: 'P6',
                        });
                        setOfferCandidate(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#248A3D] hover:bg-[#1E7E34] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      重新转入
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}