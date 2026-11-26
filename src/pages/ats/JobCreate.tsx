import { Check, Sparkles, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AppleActionButton } from "../../components/ui/AppleActionButton";
import { DEPARTMENTS } from "../../constants/index";
import type { AtsWorkspace } from "../../hooks/useAtsWorkspace";
export function JobCreate() {
  const {
    setAtsActiveNav,
    setAtsViewMode,
    atsAnonymousMode,
    setAtsAnonymousMode,
    jobs,
    onPublishJob,
    onTriggerToast,
    jobAnchor,
    setJobAnchor,
    newJobForm,
    setNewJobForm,
    HC_OPTIONS,
  } = useOutletContext<AtsWorkspace>();
  const anchors = [
    { id: "basic", label: "1. 编制与基础信息" },
    { id: "jd", label: "2. 职位描述 (JD)" },
    { id: "pipeline", label: "3. 招聘流程与团队" },
    { id: "channels", label: "4. 渠道分发与合规" },
  ];
  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* 顶部固定操作栏 */}
      <div className="px-6 py-4 bg-[#FAFAFC] border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AppleActionButton
            size="xs"
            onClick={() => setAtsViewMode("dashboard")}
          >
            返回职位列表
          </AppleActionButton>
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F]">
              发布新招聘职位
            </h2>
            <p className="text-[11px] text-[#86868B]">
              关联 Core HR 编制 HC 池，发布后实时同步至招聘漏斗
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AppleActionButton
            variant="secondary"
            onClick={() =>
              onTriggerToast("职位草稿已保存", "已存入「职位管理 → 草稿箱」")
            }
          >
            保存草稿
          </AppleActionButton>
          <AppleActionButton
            variant="secondary"
            onClick={() =>
              onTriggerToast(
                "已生成对外招聘官网预览",
                `${newJobForm.title || "未命名职位"} · ${newJobForm.salaryBand}`,
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
                location: newJobForm.locations.join(" / "),
                salaryRange: newJobForm.salaryBand,
              });
              setAtsViewMode("dashboard");
              setAtsActiveNav("ats-jobs");
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
                  ? "bg-[#EBF5FF] text-[#0071E3]"
                  : "text-[#515154] hover:bg-black/[0.04]"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[680px]">
          {/* 模块一：编制与基础信息 */}
          <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4">
            <div className="text-sm font-bold text-[#1D1D1F]">
              模块一：编制与基础信息（关联 Core HR）
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1.5">
                  关联部门 *
                </label>
                <select
                  value={newJobForm.department}
                  onChange={(e) =>
                    setNewJobForm({ ...newJobForm, department: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] outline-none"
                >
                  {DEPARTMENTS.filter((d) => d !== "全部部门").map((d) => (
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
                    const found = HC_OPTIONS.find(
                      (h) => h.code === e.target.value,
                    );
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
                <label className="block font-medium text-[#6E6E73] mb-1.5">
                  职位名称 *
                </label>
                <input
                  type="text"
                  placeholder="例如：高级 AIGC 算法架构师"
                  value={newJobForm.title}
                  onChange={(e) =>
                    setNewJobForm({ ...newJobForm, title: e.target.value })
                  }
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
                <label className="block font-medium text-[#6E6E73] mb-1.5">
                  工作地点与办公模式
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "总部 · 现场办公",
                    "上海研发中心",
                    "支持混合办公",
                    "全远程 Remote",
                  ].map((loc) => {
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
                            ? "bg-[#0071E3] text-white border-[#0071E3]"
                            : "bg-[#F5F5F7] text-[#515154] border-transparent"
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1.5">
                  雇佣类型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["全职", "实习", "外包"].map((tp) => (
                    <button
                      key={tp}
                      type="button"
                      onClick={() =>
                        setNewJobForm({ ...newJobForm, empType: tp })
                      }
                      className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                        newJobForm.empType === tp
                          ? "bg-[#1D1D1F] text-white border-[#1D1D1F]"
                          : "bg-[#F5F5F7] text-[#515154] border-transparent"
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
              <span className="text-sm font-bold text-[#1D1D1F]">
                模块二：职位描述（JD）
              </span>
              <AppleActionButton
                size="xs"
                variant="blue"
                icon={Sparkles}
                onClick={() => {
                  setNewJobForm((prev) => ({
                    ...prev,
                    jdContent: `【核心使命】\n加入${prev.department}，主导「${
                      prev.title || "核心技术与创意岗位"
                    }」从 0 到 1 的架构落地与业务突破。\n\n【岗位职责】\n1. 负责前沿 AI 工程管线与多模态工作流设计，持续提升交付质量；\n2. 协同产品、设计与研发团队推进关键项目里程碑交付。\n\n【任职资格】\n1. 本科及以上学历，具备扎实的专业功底与代表性作品/项目案例；\n2. 具备极强的自驱力、结构化沟通能力与跨团队协作精神。`,
                  }));
                  onTriggerToast(
                    "AI 已完成 JD 智能润色",
                    "已结合部门与职级生成标准职位描述",
                  );
                }}
              >
                AI 一键生成 / 润色 JD
              </AppleActionButton>
            </div>
            <textarea
              rows={6}
              value={newJobForm.jdContent}
              onChange={(e) =>
                setNewJobForm({ ...newJobForm, jdContent: e.target.value })
              }
              className="w-full p-3.5 rounded-xl bg-[#F5F5F7] outline-none leading-relaxed"
            />
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1">
                对内可见备注（仅内部员工 / 内推可见，对外招聘官网隐藏）
              </label>
              <input
                type="text"
                value={newJobForm.internalNote}
                onChange={(e) =>
                  setNewJobForm({ ...newJobForm, internalNote: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EB] text-[#B25E00] outline-none"
              />
            </div>
          </div>

          {/* 模块三：招聘流程与协作团队 */}
          <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4 text-xs">
            <div className="text-sm font-bold text-[#1D1D1F]">
              模块三：招聘流程与协作团队
            </div>
            <div>
              <div className="font-medium text-[#6E6E73] mb-2">
                横向面试阶段配置器（支持动态增删阶段）
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {newJobForm.stages.map((st, idx) => (
                  <div
                    key={`${st}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] font-semibold"
                  >
                    <span className="text-[10px] text-[#86868B]">
                      {idx + 1}.
                    </span>
                    <span>{st}</span>
                    {newJobForm.stages.length > 3 &&
                      idx > 0 &&
                      idx < newJobForm.stages.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setNewJobForm({
                              ...newJobForm,
                              stages: newJobForm.stages.filter(
                                (_, i) => i !== idx,
                              ),
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
                <label className="block font-medium text-[#6E6E73] mb-1">
                  招聘负责人 (Recruiter)
                </label>
                <input
                  type="text"
                  value={newJobForm.recruiter}
                  onChange={(e) =>
                    setNewJobForm({ ...newJobForm, recruiter: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#6E6E73] mb-1">
                  用人经理 (Hiring Manager)
                </label>
                <input
                  type="text"
                  value={newJobForm.hiringManager}
                  onChange={(e) =>
                    setNewJobForm({
                      ...newJobForm,
                      hiringManager: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 模块四：渠道分发与合规设置 */}
          <div className="p-5 rounded-2xl border border-black/[0.06] bg-white space-y-4 text-xs">
            <div className="text-sm font-bold text-[#1D1D1F]">
              模块四：渠道分发与合规设置
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newJobForm.careerSite}
                  onChange={(e) =>
                    setNewJobForm({
                      ...newJobForm,
                      careerSite: e.target.checked,
                    })
                  }
                  className="accent-[#0071E3]"
                />
                <span>同步发布至企业招聘官网</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newJobForm.internalReferral}
                  onChange={(e) =>
                    setNewJobForm({
                      ...newJobForm,
                      internalReferral: e.target.checked,
                    })
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
                      setNewJobForm({
                        ...newJobForm,
                        eeoStatement: e.target.checked,
                      })
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
                      setNewJobForm({
                        ...newJobForm,
                        gdprConsent: e.target.checked,
                      })
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
