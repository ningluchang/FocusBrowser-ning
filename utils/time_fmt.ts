export const formatDuration = (ms: number): string => {
    if (ms <= 0) return '已解锁';

    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    const parts = [];
    if (h > 0) parts.push(`${h}小时`);
    if (m > 0) parts.push(`${m}分钟`);
    if (s > 0 && h === 0) parts.push(`${s}秒`); // 秒只在短时间显示

    return parts.join('');
};