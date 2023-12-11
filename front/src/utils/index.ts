import dayjs from 'dayjs';

export function dateFormatter(value: string, format: string = 'YYYY-MM-DD') {
    return dayjs(value).format(format)
}

/**
 * 递归获取树形数据和半选中的键
 *
 * @param data 源数据列表
 * @param parentId 当前父节点的ID
 * @param childrenKey 子节点在对象中的键名
 * @param depth 当前节点深度
 * @returns {treeData, halfCheckedKeys} 树形数据和半选中的键
 */
export function getTreeDataAndHalfCheckedKeys(
    data: any[],
    parentId: number = 0,
    childrenKey: string = "children",
    depth: number = 0
): { treeData: any[]; halfCheckedKeys: string[] } {
    const treeData: any[] = []; // 存储树形数据的数组
    const halfCheckedKeys: Set<string> = new Set(); // 存储半选中的键的唯一 uid

    // 遍历数据
    data
        .filter((item) => item.father === parentId) // 筛选出具有指定父节点的元素
        .forEach((item) => {
            const { treeData: itemChildren, halfCheckedKeys: childHalfCheckedKeys } = getTreeDataAndHalfCheckedKeys(
                data,
                item.key,
                childrenKey,
                depth + 1
            );

            if (itemChildren.length > 0) {
                halfCheckedKeys.add(item.uid); // 添加当前父节点的 uid
                item[childrenKey] = itemChildren; // 将子节点添加到父节点的 children 属性中
                childHalfCheckedKeys.forEach((node) => halfCheckedKeys.add(node)); // 将子节点的半选中键合并到当前父节点数组中
            }

            treeData.push({
                ...item,
                depth,
            });
        });

    return { treeData, halfCheckedKeys: Array.from(halfCheckedKeys) }; // 转换 Set 为数组并返回
}

/**
 * 获取时间段
 *
 * @returns 凌晨=0 早上=1 中午=2 晚上=3
 */
export function getTimePeriod(): string {
    const date = new Date()
    const hour = date.getHours();

    if (hour >= 0 && hour < 5) {
        return "凌晨";
    } else if (hour >= 5 && hour < 12) {
        return "早上";
    } else if (hour >= 12 && hour < 14) {
        return "中午";
    } else if (hour >= 14 && hour < 18) {
        return "下午";
    } else {
        return "晚上";
    }
}


