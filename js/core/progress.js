// 成长：金币、等级、菜谱解锁
const recipes = require("../../config/recipes.js");

const BASE_COST = 60;
const COST_G = 1.18;
const PRICE_G = 1.05;
const BASE_PRICE = 12;
const MAX_LEVEL = 20;

function levelCost(level) {
  return Math.round(BASE_COST * Math.pow(COST_G, level - 1));
}

function unitPrice(level) {
  return BASE_PRICE * Math.pow(PRICE_G, level - 1);
}

function maxLevel() {
  return MAX_LEVEL;
}

function canLevelUp(S) {
  if (S.level >= MAX_LEVEL) return false;
  return S.coins >= levelCost(S.level);
}

function levelUp(S) {
  if (!canLevelUp(S)) return false;
  S.coins -= levelCost(S.level);
  S.level += 1;
  return true;
}

// 槽位：8 级起 4 格
function slotCount(level) {
  return level >= 8 ? 4 : 3;
}

// 食材池：6 级起扩（当前只有 8 种，先按 8 算）
function kindPool(level) {
  return 8;
}

function nextUnlock(level) {
  const all = recipes.RECIPES;
  for (let i = 0; i < all.length; i++) {
    if (all[i].lv > level) return all[i];
  }
  return null;
}

module.exports = { levelCost, unitPrice, canLevelUp, levelUp, slotCount, kindPool, nextUnlock, maxLevel, BASE_PRICE };
