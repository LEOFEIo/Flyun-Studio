import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log(
    "DATABASE_URL is not set; skipping database setup during this build.",
  );
  process.exit(0);
}

const sql = neon(connectionString);

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    password_hash TEXT,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    github_login TEXT,
    github_id TEXT,
    github_avatar_url TEXT,
    github_name TEXT,
    github_bio TEXT,
    github_company TEXT,
    github_location TEXT,
    github_followers INTEGER NOT NULL DEFAULT 0,
    github_public_repos INTEGER NOT NULL DEFAULT 0,
    github_top_languages TEXT NOT NULL DEFAULT '',
    github_connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_login TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_avatar_url TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_name TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_bio TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_company TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_location TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_followers INTEGER NOT NULL DEFAULT 0`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_public_repos INTEGER NOT NULL DEFAULT 0`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_top_languages TEXT NOT NULL DEFAULT ''`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_connected_at TIMESTAMPTZ`;
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx
  ON users (LOWER(username))
  WHERE username IS NOT NULL
`;

await sql`
  CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    current_company TEXT NOT NULL DEFAULT '',
    current_role TEXT NOT NULL DEFAULT '',
    years_experience INTEGER NOT NULL DEFAULT 0,
    current_salary TEXT NOT NULL DEFAULT '',
    expected_salary TEXT NOT NULL DEFAULT '',
    job_level TEXT NOT NULL DEFAULT '',
    promotion_status TEXT NOT NULL DEFAULT '',
    performance_pay TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    profile_status TEXT NOT NULL DEFAULT 'draft',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    team TEXT NOT NULL,
    domain TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT NOT NULL DEFAULT '全职',
    salary_range TEXT NOT NULL DEFAULT '面议',
    summary TEXT NOT NULL,
    requirements TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    candidate_name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    current_company TEXT NOT NULL DEFAULT '',
    current_salary TEXT NOT NULL,
    expected_salary TEXT NOT NULL,
    job_level TEXT NOT NULL,
    promotion_status TEXT NOT NULL,
    performance_pay TEXT NOT NULL,
    motivation TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    consultant_notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS talent_profiles (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    location TEXT NOT NULL,
    summary TEXT NOT NULL,
    skills TEXT NOT NULL,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    source_count INTEGER NOT NULL DEFAULT 0,
    match_score INTEGER NOT NULL DEFAULT 80,
    recent_signal TEXT NOT NULL DEFAULT '',
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

await sql`
  INSERT INTO jobs (
    slug, title, team, domain, location, employment_type, salary_range,
    summary, requirements, status
  ) VALUES
    (
      'multimodal-foundation-expert',
      '多模态基模算法专家',
      'Foundation Model',
      '大模型与多模态',
      '北京 / 深圳 / 杭州',
      '全职',
      '面议',
      '负责多模态基模的数据、模型与训练体系，推动电商和商业化场景落地。',
      '具备多模态预训练或后训练经验|熟悉数据 Pipeline 与质量评估|有头部基模团队经历优先',
      'active'
    ),
    (
      'ai-infra-platform-lead',
      'AI Infra 平台负责人',
      'AI Systems',
      'AI Infra',
      '北京 / 上海',
      '全职',
      '面议',
      '从 0 到 1 建设大模型训练与推理平台，负责资源效率、稳定性与研发体验。',
      '有千卡级训练平台经验|熟悉调度、容错与可观测性|具备团队管理和跨部门推进能力',
      'active'
    ),
    (
      'embodied-learning-scientist',
      '具身学习算法科学家',
      'Embodied Intelligence',
      '机器人与具身智能',
      '北京 / 深圳',
      '全职',
      '面议',
      '研究并落地机器人强化学习、VLA 与世界模型，打通仿真到真机训练闭环。',
      '具备 RL、模仿学习或 VLA 经验|有真机项目与量产经验优先|硕博背景优先',
      'active'
    ),
    (
      'end-to-end-driving-lead',
      '端到端自动驾驶算法负责人',
      'Autonomous Driving',
      '自动驾驶',
      '北京 / 苏州 / 上海',
      '全职',
      '面议',
      '负责端到端感知与规划算法，推动规模化量产上车和数据闭环建设。',
      '20 人以上团队管理经验优先|有量产上车项目|熟悉世界模型或一段式方案',
      'active'
    ),
    (
      'inference-optimization-architect',
      '大模型推理优化架构师',
      'Inference',
      'AI Infra',
      '杭州 / 上海 / 深圳',
      '全职',
      '面议',
      '面向高并发和长序列场景优化推理系统，覆盖 Prefill/Decode、KV Cache 与异构加速。',
      '熟悉 vLLM 等推理框架|具备 CUDA 或算子优化能力|有实际业务性能指标',
      'active'
    ),
    (
      'ai-product-builder',
      'AI 产品构建者',
      'New Product',
      'AI 产品与设计',
      '北京 / 远程',
      '全职',
      '面议',
      '把用户洞察、模型能力与产品工程连接起来，快速验证 AI 原生产品。',
      '能独立完成产品定义和原型|理解 Agent 与多模态应用|具备数据分析与增长意识',
      'active'
    )
  ON CONFLICT (slug) DO NOTHING
`;

await sql`
  INSERT INTO talent_profiles (
    slug, name, title, domain, location, summary, skills, evidence_count,
    source_count, match_score, recent_signal, verified
  ) VALUES
    (
      'chen-mo',
      '陈墨',
      'AI Infra 工程师',
      'AI Infra',
      '北京',
      '近两年的公开工作集中在训练恢复与推理效率，持续维护一个拥有 38 位贡献者的开源项目。',
      '分布式训练,推理优化,Go,Python,调度系统',
      16,
      9,
      94,
      '最近关注异构推理调度与 KV Cache',
      TRUE
    ),
    (
      'lin-qiao',
      '林乔',
      '具身智能研究员',
      '机器人与具身智能',
      '上海',
      '从仿真研究转向真机控制后，连续三年保持论文和工程代码同步更新。',
      '强化学习,VLA,机器人控制,仿真,Python',
      14,
      7,
      91,
      '完成移动操作机器人真机闭环验证',
      TRUE
    ),
    (
      'zhou-ye',
      '周也',
      '推理架构师',
      'AI Infra',
      '杭州',
      '长期关注编译器、算子融合和端侧推理，公开演讲与代码贡献互相印证。',
      '编译器,CUDA,算子优化,端侧推理,C++',
      18,
      10,
      88,
      '近期研究异构算力的动态调度',
      TRUE
    ),
    (
      'xu-ning',
      '许宁',
      'AI 产品构建者',
      'AI 产品与设计',
      '深圳',
      '兼具设计研究和独立开发能力，能把用户洞察快速转换为可运行产品。',
      '产品策略,交互设计,Agent,AIGC,数据分析',
      12,
      8,
      85,
      '持续探索多智能体与空间交互',
      TRUE
    )
  ON CONFLICT (slug) DO NOTHING
`;

console.log("Feiyun database is ready.");
