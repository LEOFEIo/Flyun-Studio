export type CandidateRow = {
  id: number;
  candidateName: string;
  userEmail: string;
  currentCompany: string;
  jobLevel: string;
  expectedSalary: string;
  status: string;
  jobTitle: string;
  jobDomain: string;
  jobLocation: string;
};
export const stageLabels: Record<string, string> = {
  new: "新申请",
  contacted: "已联系",
  screening: "评估中",
  interview: "面试中",
  offer: "Offer",
  hired: "已入职",
  closed: "已结束",
};
export const previewCandidates: CandidateRow[] = [
  {
    id: 1,
    candidateName: "林知夏",
    userEmail: "zhixia@example.com",
    currentCompany: "Nebula AI",
    jobLevel: "P7",
    expectedSalary: "70–90K",
    status: "interview",
    jobTitle: "AI Infra 平台负责人",
    jobDomain: "AI Infra",
    jobLocation: "北京 / 上海",
  },
  {
    id: 2,
    candidateName: "陈嘉树",
    userEmail: "jiashu@example.com",
    currentCompany: "OpenVision",
    jobLevel: "资深",
    expectedSalary: "65–85K",
    status: "screening",
    jobTitle: "多模态基模算法专家",
    jobDomain: "大模型与多模态",
    jobLocation: "北京 / 深圳",
  },
  {
    id: 3,
    candidateName: "周砚",
    userEmail: "yan@example.com",
    currentCompany: "VectorLab",
    jobLevel: "专家",
    expectedSalary: "80–100K",
    status: "new",
    jobTitle: "大模型推理优化架构师",
    jobDomain: "AI Infra",
    jobLocation: "杭州 / 上海",
  },
  {
    id: 4,
    candidateName: "许云澜",
    userEmail: "yunlan@example.com",
    currentCompany: "Arc Studio",
    jobLevel: "负责人",
    expectedSalary: "面议",
    status: "offer",
    jobTitle: "AI 产品构建者",
    jobDomain: "AI 产品与设计",
    jobLocation: "北京 / 远程",
  },
  {
    id: 5,
    candidateName: "沈亦安",
    userEmail: "yian@example.com",
    currentCompany: "MotionX",
    jobLevel: "高级",
    expectedSalary: "60–80K",
    status: "interview",
    jobTitle: "具身学习算法科学家",
    jobDomain: "机器人与具身智能",
    jobLocation: "北京 / 深圳",
  },
  {
    id: 6,
    candidateName: "顾南川",
    userEmail: "nanchuan@example.com",
    currentCompany: "Autonomy",
    jobLevel: "负责人",
    expectedSalary: "90–120K",
    status: "contacted",
    jobTitle: "端到端自动驾驶负责人",
    jobDomain: "自动驾驶",
    jobLocation: "北京 / 苏州",
  },
];
