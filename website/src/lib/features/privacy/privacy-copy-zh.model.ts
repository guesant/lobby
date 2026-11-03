import type { PrivacyPolicyContent } from './privacy.types.ts';

export const privacyPolicyCopyZh: Omit<
  PrivacyPolicyContent,
  'contactURL' | 'analyticsEnabled' | 'references'
> = {
  title: '隐私政策',
  description: '本网站如何处理浏览数据和同意选择。',
  contactLabel: '通过电子邮件联系',
  inactiveNotice: '此版本网站尚未启用 Google Analytics。',
  referencesLabel: '来源与相关信息',
  sections: [
    {
      title: '数据处理责任方',
      paragraphs: [
        'Gabriel R. Antunes 负责本网站进行的个人数据处理。有关隐私的问题和请求，可通过本页末尾的联系方式发送。',
      ],
    },
    {
      title: 'Analytics 与测量数据',
      paragraphs: [
        '只有在你同意后，本网站才会加载 Google Analytics。启用后，它可能测量页面浏览、滚动、外部链接点击、下载、嵌入视频互动和表单互动。搜索词不会发送。网站配置已关闭 Google Signals 和广告个性化。',
        '这些功能可能处理访问页面的网址、访问来源、浏览器和设备技术信息，以及与所测量互动相关的数据。请勿在网址或用于测量的内容中填写个人信息。',
      ],
    },
    {
      title: '目的与选择',
      paragraphs: [
        '处理目的是了解网站使用情况并据此改进。在你选择同意之前，Google 标签不会加载，也不会发送 Analytics 数据。你可以拒绝或在设置中撤回同意。',
      ],
    },
    {
      title: 'Google 与数据传输',
      paragraphs: [
        '同意后，数据会发送至 Google 提供的 Google Analytics 服务。Google 可能依据其条款和政策在其他国家或地区的基础设施中处理数据。你也可以查阅 Google 的隐私政策以及其合作网站所用技术的说明。',
      ],
    },
    {
      title: '保存期限',
      paragraphs: [
        'Analytics 事件和用户数据计划设置为保存两个月。标准汇总报告可能适用 Google Analytics 的其他控制和期限。同意选择会在此浏览器保存六个月，也可以提前更改。',
      ],
    },
    {
      title: '你的权利与联系方式',
      paragraphs: [
        '你可以请求了解数据处理情况、行使适用的数据保护权利或撤回同意。请求将依据适用法律和可用数据处理。撤回后，本网站将停止新的测量，但不会自动删除 Google 已收到的数据；如适用，还需向服务提供方提出删除请求。',
      ],
    },
  ],
};
