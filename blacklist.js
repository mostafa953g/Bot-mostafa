const fs = require('fs');
const path = './blacklist.json';

function loadBlacklist() {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(path));
}

function saveBlacklist(blacklist) {
    fs.writeFileSync(path, JSON.stringify(blacklist, null, 2));
}

function isUserIdBlacklisted(userId) {
    const blacklist = loadBlacklist();
    return blacklist.some(entry => entry.idblack === userId);
}

function getBlacklistReason(userId) {
    const blacklist = loadBlacklist();
    const entry = blacklist.find(entry => entry.idblack === userId);
    return entry ? entry.reason : null;
}

function addToBlacklist(userId, reason) {
    const blacklist = loadBlacklist();
    if (!isUserIdBlacklisted(userId)) {
        blacklist.push({ idblack: userId, reason: reason });
        saveBlacklist(blacklist);
        return true;
    }
    return false;
}

function removeFromBlacklist(userId) {
    let blacklist = loadBlacklist();
    if (isUserIdBlacklisted(userId)) {
        blacklist = blacklist.filter(entry => entry.idblack !== userId);
        saveBlacklist(blacklist);
        return true;
    }
    return false;
}

module.exports = {
    isUserIdBlacklisted,
    getBlacklistReason,
    addToBlacklist,
    removeFromBlacklist
};
const blacklist = [
    "192.168.1.1",
    "10.0.0.1",
    "172.16.0.1"
];

module.exports = blacklist;

// تعريف الدالة للتحقق من القائمة السوداء
function isUserIdBlacklisted(userId) {
    // منطق التحقق من القائمة السوداء
    // على سبيل المثال، يمكنك استخدام مجموعة أو قاعدة بيانات للتحقق
    const blacklistedUsers = new Set(['123456', '789012']); // مثال على معرفات مستخدمين محظورين
    return blacklistedUsers.has(userId);
}

module.exports = {
    isUserIdBlacklisted,
};