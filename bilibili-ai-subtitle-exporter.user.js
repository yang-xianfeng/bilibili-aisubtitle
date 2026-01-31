// ==UserScript==
// @name         Bilibili AI Subtitle Exporter Pro
// @namespace    https://github.com/yang-xianfeng/bilibili-aisubtitle
// @version      1.0.0
// @description  自动点击、XHR 拦截、时间轴格式化、去重下载 B 站 AI 字幕
// @author       yang-xianfeng
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/watch/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/yang-xianfeng/bilibili-aisubtitle
// @supportURL   https://github.com/yang-xianfeng/bilibili-aisubtitle/issues
// @updateURL    https://raw.githubusercontent.com/yang-xianfeng/bilibili-aisubtitle/main/dist/bilibili-ai-subtitle-exporter.user.js
// @downloadURL  https://raw.githubusercontent.com/yang-xianfeng/bilibili-aisubtitle/main/dist/bilibili-ai-subtitle-exporter.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- 配置项 ---
    const CONFIG = {
        keyword: 'aisubtitle', // 拦截 URL 关键词
        autoClick: true,       // 是否自动点击字幕按钮
        downloadPrefix: 'B站总结素材_', // 下载文件名前缀
        format: 'txt_with_time' // 格式: 'txt_with_time' (带时间轴) | 'srt' (标准字幕) | 'pure_text' (纯文本)
    };

    // 防止重复处理的集合
    const processedUrls = new Set();

    console.clear(); // 清理旧日志
    console.log(`%c 🚀 B站字幕提取器已启动 `, "background: #00A1D6; color: white; font-size: 14px; padding: 4px; border-radius: 4px;");

    // --- 核心工具函数 ---

    // 格式化时间秒数 -> HH:MM:SS
    function formatTime(seconds) {
        const date = new Date(null);
        date.setSeconds(seconds);
        const utc = date.toUTCString();
        // 提取 HH:MM:SS
        return utc.substr(utc.indexOf(':') - 2, 8);
    }

    // 格式化为 SRT 格式的时间戳 (00:00:00,000)
    function formatSrtTime(seconds) {
        const date = new Date(null);
        date.setMilliseconds(seconds * 1000);
        return date.toISOString().substr(11, 12).replace('.', ',');
    }

    // 生成最终文本内容
    function generateContent(bodyArray) {
        if (CONFIG.format === 'pure_text') {
            return bodyArray.map(item => item.content).join('\n');
        } 
        
        if (CONFIG.format === 'srt') {
            return bodyArray.map(item => {
                return `${item.sid}\n${formatSrtTime(item.from)} --> ${formatSrtTime(item.to)}\n${item.content}\n`;
            }).join('\n');
        }

        // 默认: txt_with_time (最适合做笔记和总结)
        return bodyArray.map(item => {
            return `${formatTime(item.from)} --> ${formatSrtTime(item.to)} ${item.content}`;
        }).join('\n');
    }

    // 下载文件
    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        console.log(`%c ✅ 下载成功: ${filename}`, "color: green; font-weight: bold;");
    }

    // --- 拦截器逻辑 ---

    const rawOpen = XMLHttpRequest.prototype.open;
    const rawSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._targetUrl = url; // 暂存 URL
        return rawOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4) { // 请求完成
                const url = this._targetUrl;

                // 1. 过滤 URL
                if (url && url.includes(CONFIG.keyword)) {
                    
                    // 2. 防止重复下载
                    if (processedUrls.has(url)) {
                        console.log("Duplicate request ignored.");
                        return;
                    }

                    console.log(`🎯 捕获字幕数据源: ${url}`);
                    
                    try {
                        const json = JSON.parse(this.responseText);
                        
                        if (json.body && Array.isArray(json.body)) {
                                
                            processedUrls.add(url); // 标记已处理

                            // 3. 生成内容
                            const finalContent = generateContent(json.body);
                            
                            // 4. 获取视频标题 (作为文件名)
                            const pageTitle = document.title.split('_')[0].trim().replace(/[\\\/:*?"<>|]/g, '');
                            const ext = CONFIG.format === 'srt' ? '.srt' : '.txt';
                            const filename = `${CONFIG.downloadPrefix}${pageTitle}${ext}`;

                            // 5. 执行下载
                            console.log(`📦 正在生成文件 (${json.body.length} 行)...`);
                            downloadFile(finalContent, filename);

                        } else {
                            console.warn("❌ 数据格式不符 (缺少 body)");
                        }
                    } catch (e) {
                        console.error("解析失败", e);
                    }
                }
            }
        });
        return rawSend.apply(this, arguments);
    };

    // --- 自动触发逻辑 ---

    if (CONFIG.autoClick) {
        setTimeout(() => {
            const aiBtn = document.querySelector('div.bpx-player-ctrl-subtitle-language-item[data-lan="ai-zh"]');
            const ccBtn = document.querySelector('div.bpx-player-ctrl-subtitle-language-item[data-lan="zh-CN"]');
            
            if (aiBtn) {
                console.log("🖱️ 自动点击 [AI中文]...");
                aiBtn.click();
            } else if (ccBtn) {
                console.log("🖱️ 未找到AI字幕，尝试点击 [中文]...");
                ccBtn.click();
            } else {
                console.log("ℹ️ 未找到字幕按钮，请手动开启字幕。脚本已就绪。");
            }
        }, 1500); // 1.5秒后尝试点击，留给页面一点加载时间
    }

})();
