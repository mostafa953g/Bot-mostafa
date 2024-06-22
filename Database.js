const balances = new Map();

function getBalance(userId) {
    return balances.get(userId) || 0;
}

function addPoints(userId, points) {
    const currentBalance = getBalance(userId);
    balances.set(userId, currentBalance + points);
}

module.exports = {
    getBalance,
    addPoints
};
