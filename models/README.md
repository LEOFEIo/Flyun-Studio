# 3D Avatar

首页会自动尝试加载：

`models/avatar.glb`

如果文件不存在，会使用 `assets/portfolio3d.js` 中的程序化数字人作为 fallback，所以页面仍然可以正常运行。

## 推荐模型规格

- 格式：GLB / glTF 2.0
- 文件名：`avatar.glb`
- 人物：完整全身，Y 轴朝上，正面朝 +Z 或 -Z 均可
- 面数：网页端建议 30k–150k triangles
- 贴图：建议 2K，尽量使用 KTX2 / WebP
- 材质：PBR / Metallic-Roughness
- 动画：可选；Idle 动画后续可在 `portfolio3d.js` 中接入 AnimationMixer

替换时只需要上传新的 `models/avatar.glb`，不需要改首页 HTML。
