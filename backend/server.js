const express = require("express");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "device.json");

// === Helper: ចាប់យកប្រភេទ Device និង Browser ===
function parseUserAgent(ua) {
  if (!ua) return { browser: "Unknown", os: "Unknown" };
  let browser = "Unknown";
  let os = "Unknown";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "MacOS";
  else if (ua.includes("X11")) os = "UNIX";
  else if (ua.includes("Linux")) os = "Linux";
  if (ua.includes("Android")) os = "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os };
}

// === Helper: បង្កើត Key សម្គាល់គណនីនីមួយៗ (Username + Password) ===
function getUserKey(username, password) {
  return `${username}:::${password}`;
}

// === Helper: ស្វែងរក User តាមរយៈ Username និង Token (សម្រាប់គណនីដែលមាន Username ដូចគ្នា) ===
function findUserByUsernameAndToken(db, username, token) {
  if (!username || !token) return null;
  for (const key in db.users) {
    const u = db.users[key];
    if (u.username === username && u.sessionToken === token) {
      return u;
    }
  }
  return null;
}

// === Database Helper ===
function loadDB() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// === USERS CONFIG ===
const USERS = [
  { username: "Yuos_chamroeun", password: "chamroeun@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Soma", password: "soma@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sokthida", password: "sokthida@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Vutha", password: "vutha@17pro", startDate: "2025-11-11", durationDays: 365 },
  { username: "Simtap", password: "simtap@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Chanlim", password: "chanlim@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Raksa", password: "raksa@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sopheas", password: "sopheas@9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Saovanny", password: "vanny@99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Soksangha", password: "@sangha9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Seanghai", password: "@seanghai99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Saksophea", password: "sophea@2025", startDate: "2025-11-11", durationDays: 1700 },
  { username: "Virak", password: "@virak9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Seyha", password: "@seyha999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sichan", password: "@sichan99", startDate: "2025-11-11", durationDays: 1700 },
  { username: "Yang", password: "1986@Yang", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sreysros", password: "sreysros@99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Chetra", password: "chetra@999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Bunnavath", password: "vath@168", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Davin", password: "davin#2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Davin", password: "davin168", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sochar", password: "sochar@99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Roza", password: "roza@9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Penglong", password: "long@99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Kimhong", password: "kimhong@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Kamsan", password: "kamsan@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Meng_y", password: "mengy@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Senghuor", password: "huor@9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sipathnarath", password: "naroth@9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Rathana", password: "rathana@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Leangmey", password: "leangmey@99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Somnang", password: "somnang@99", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Chamroeun", password: "chomroeun03/11/1993", startDate: "2025-12-16", durationDays: 365 },
  { username: "Mengleang", password: "meng168leang", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Chamnab", password: "chamnab@168", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Chandara", password: "dara@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Kimleng", password: "kimleng@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Lyheang", password: "lyheang@2025", startDate: "2025-11-11", durationDays: 600 },
  
  { username: "Seavmey", password: "seavmey@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Sokhethida", password: "thida@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Sokla", password: "sokla@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Vita", password: "vita@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Silin", password: "silin@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Soriya", password: "soriya@9999", startDate: "2025-11-11", durationDays: 365 },
  { username: "Chamnab02", password: "chamnab@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Virak", password: "virak@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Chanvirak", password: "virak@2025", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Rethsamoun", password: "samoun@2025", startDate: "2025-11-11", durationDays: 1600 },
  { username: "Serysophea", password: "sophea@2025", startDate: "2025-11-11", durationDays: 600 },
  { username: "Soheng", password: "soheng@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Chenda", password: "chenda@9999", startDate: "2025-11-11", durationDays: 365 },
  { username: "Siphathnaroth", password: "naroth@9999", startDate: "2025-11-11", durationDays: 1200 },
  { username: "Senghuor", password: "senghuor@2025", startDate: "2025-11-11", durationDays: 365 },
  { username: "Sovan", password: "van@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Thearoth", password: "roth@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Chungkhoang", password: "Khoang@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Pheaktra", password: "tra@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Sotheavath", password: "vath@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Sothynorom", password: "rom@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Ponareay", password: "nareay@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Dalin", password: "dalin@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Lina", password: "na@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Savuth", password: "savuth@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Makara", password: "makara@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Seavmey", password: "mey@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Oudom", password: "dom@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Sopheak", password: "pheak@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Ponleu", password: "ponleu@168", startDate: "2025-11-16", durationDays: 1000 },
  { username: "Boline", password: "boline@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Rangsey", password: "sey@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Sovannarath", password: "rath@151225", startDate: "2025-11-15", durationDays: 365 },
  { username: "Channak", password: "nak@151225", startDate: "2025-11-15", durationDays: 800 },
  { username: "Pichly", password: "pichly@151225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Soyvet", password: "vet@151225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Piseth", password: "seth@151225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Lyponleu", password: "ponleu@168", startDate: "2025-11-16", durationDays: 365 },
  { username: "Sreynet", password: "net@121225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Arunrefa", password: "refa@121225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Chakriya", password: "ya@121225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Dararaksmey", password: "smey@121225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Sengpheaktra", password: "tra@121225", startDate: "2025-11-16", durationDays: 365 },
  { username: "kimbunthav", password: "thav@171225", startDate: "2025-11-16", durationDays: 365 },
  { username: "Sokla", password: "sokla@2025", startDate: "2025-11-16", durationDays: 1200 },
  { username: "Linda", password: "linda@2026", startDate: "2025-11-16", durationDays: 1200 },
  { username: "Sovan", password: "sovan@2025", startDate: "2025-11-16", durationDays: 1200 },
  { username: "Longpheng", password: "pheng@2026", startDate: "2026-1-10", durationDays: 1 },
  { username: "Thavongvuth", password: "vuth@168", startDate: "2026-1-10", durationDays: 366 },
  { username: "Pichbondith", password: "bondith@168", startDate: "2026-1-14", durationDays: 366 },
  { username: "Samart", password: "art@168", startDate: "2026-1-14", durationDays: 366 },
  { username: "Kimsor", password: "kimsor@1280", startDate: "2026-1-14", durationDays: 365 },
  { username: "Kamsan2", password: "san@002", startDate: "2026-1-14", durationDays: 366 },
  { username: "Chheang", password: "Chheang7272", startDate: "2026-1-28", durationDays: 366 },
  { username: "Keyla", password: "262626", startDate: "2026-2-3", durationDays: 366 },
  { username: "Sokchan", password: "chan@168", startDate: "2026-2-3", durationDays: 366 },
  { username: "Puthea", password: "puthea@168", startDate: "2026-2-3", durationDays: 200},
  { username: "Vandy", password: "vandy@1280", startDate: "2026-2-3", durationDays: 168},
  { username: "Smile", password: "Smile@12345", startDate: "2026-2-14", durationDays: 168},
  { username: "K.Malin", password: "840876", startDate: "2026-2-21", durationDays: 365},
  { username: "Malin.K", password: "113268", startDate: "2026-2-21", durationDays: 365},
  { username: "Soksovannaro", password: "66664444@@", startDate: "2026-2-21", durationDays: 365},
  { username: "Lyheng", password: "1", startDate: "2026-2-21", durationDays: 365},
  { username: "Uonsroem", password: "060820", startDate: "2026-2-21", durationDays: 365},
  { username: "HENGSOKLIN", password: "448899", startDate: "2026-2-21", durationDays: 365},
  { username: "Thanphakdei", password: "Thanphakdei15", startDate: "2026-2-22", durationDays: 366},
  { username: "Chuncheu", password: "cheu@9999", startDate: "2026-2-22", durationDays: 1300},
  { username: "SeangE1", password: "E@9999", startDate: "2026-2-22", durationDays: 366},
  { username: "SeangE2", password: "E@9999", startDate: "2026-2-22", durationDays: 366},
  { username: "VONG123", password: "vong123", startDate: "2026-2-22", durationDays: 366},
  { username: "Vann_Sotheara", password: "Sotheara16", startDate: "2026-2-22", durationDays: 366},
  { username: "Cheataso", password: "22datefeb2k26kh", startDate: "2026-2-22", durationDays: 366},
  { username: "Min_Soeurn", password: "LOVEYOU", startDate: "2026-2-22", durationDays: 366},
  { username: "BLOOD", password: "R078688892k", startDate: "2026-2-22", durationDays: 366},
  { username: "Dara", password: "1989", startDate: "2026-2-25", durationDays: 900},
  { username: "Jesa", password: "jesa178", startDate: "2026-3-03", durationDays: 366},
  { username: "Semsarith", password: "Babymilo123", startDate: "2026-3-03", durationDays: 366},
  { username: "Phea", password: "phea168", startDate: "2026-3-03", durationDays: 390},
  { username: "HeangphonMD10", password: "Phon@168", startDate: "2026-4-03", durationDays: 366},
  { username: "2HeangphonMD10", password: "Phon@168", startDate: "2026-4-03", durationDays: 366},
  { username: "3HeangphonMD10", password: "Phon@168", startDate: "2026-4-03", durationDays: 366},
  { username: "Vannak1", password: "Nak168168", startDate: "2026-4-03", durationDays: 366},
  { username: "Vannak2", password: "Nak168168", startDate: "2026-4-03", durationDays: 366},
  { username: "Phearun168", password: "Phearun$168", startDate: "2026-4-03", durationDays: 366},
  { username: "Lormengkorng33", password: "3", startDate: "2026-4-03", durationDays: 366},
  { username: "Regina", password: "Regina1017", startDate: "2026-5-03", durationDays: 369},
  { username: "Kosalsen111", password: "11223344", startDate: "2026-5-03", durationDays: 366},
  { username: "Mengleang", password: "leang12345", startDate: "2026-16-03", durationDays: 366},
  { username: "Laydavin", password: "1314925", startDate: "2026-16-03", durationDays: 366},
  { username: "samloth168L9", password: "sean55@", startDate: "2026-18-03", durationDays: 366},
  { username: "vouchleng22", password: "Leng22", startDate: "2026-23-03", durationDays: 366},
  { username: "Mony02", password: "MonyMD10", startDate: "2026-24-03", durationDays: 367},
  { username: "Phut", password: "PhutMD10", startDate: "2026-24-03", durationDays: 366},
  { username: "THUL.YEN", password: "19.23.19", startDate: "2026-24-03", durationDays: 366},
  { username: "Chheng.theng", password: "2233", startDate: "2026-25-03", durationDays: 366},
  { username: "Dakhid168", password: "Khid168", startDate: "2026-26-03", durationDays: 366},
  { username: "Khenchanthou", password: "a12345678", startDate: "2026-26-03", durationDays: 366},
  { username: "Sokreaksmey", password: "Smey1994", startDate: "2026-28-03", durationDays: 366},
  { username: "Chanbopha", password: "bopha123", startDate: "2026-28-03", durationDays: 367},
  { username: "Say", password: "saysay@98", startDate: "2026-28-03", durationDays: 367},
  { username: "Visalkim", password: "010822", startDate: "2026-28-03", durationDays: 367},
  { username: "Chhorn.Sokay", password: "apple009", startDate: "2026-28-03", durationDays: 367},
  { username: "David12", password: "David1217", startDate: "2026-03-04", durationDays: 90},
  { username: "Exam26", password: "54321", startDate: "2026-07-04", durationDays: 367},
  { username: "Heakbunheang", password: "heang123", startDate: "2026-13-04", durationDays: 90},
  { username: "Mony", password: "Keamony21", startDate: "2026-28-04", durationDays: 367},
  { username: "soklyr", password: "sokly@#$123", startDate: "2026-19-05", durationDays: 367},
  { username: "KwangNak", password: "230499", startDate: "2026-20-05", durationDays: 367},
  { username: "Sokla2", password: "31071999", startDate: "2026-20-05", durationDays: 367},
  { username: "Sorin", password: "sorin9999", startDate: "2026-23-05", durationDays: 367},
  { username: "Raksmey", password: "raksmey99", startDate: "2026-23-05", durationDays: 3},
  { username: "Longpheng", password: "pheng168", startDate: "2026-26-05", durationDays: 367},
  { username: "Nhemchenda", password: "Chendaa15@", startDate: "2026-28-05", durationDays: 367},
  { username: "Chansey12@V", password: "Chan12&$", startDate: "2026-28-05", durationDays: 367},
  { username: "ChincheaCheatta", password: "Cheatta78", startDate: "2026-28-05", durationDays: 367},
  { username: "KongSovathpanha", password: "Panha", startDate: "2026-28-05", durationDays: 367},
  { username: "Brokh", password: "Brokh2211", startDate: "2026-29-05", durationDays: 367},
  { username: "Bilaka", password: "heaty140301", startDate: "2026-29-05", durationDays: 367},
  { username: "Kaknika", password: "kaknika12", startDate: "2026-01-06", durationDays: 367},
  { username: "Sethaka", password: "ka1403", startDate: "2026-02-06", durationDays: 834},
  { username: "Menglong", password: "12345", startDate: "2026-07-06", durationDays: 367},
  { username: "Kimlay", password: "lay123", startDate: "2026-09-06", durationDays: 367},
  { username: "Sothyrak", password: "Sothyrak123456", startDate: "2026-24-06", durationDays: 367},
  { username: "LyNa", password: "Lyna200497", startDate: "2026-25-06", durationDays: 457},
  { username: "Simnatt", password: "570033", startDate: "2026-06-07", durationDays: 367},
  { username: "Yoeurtyen", password: "Yen0709", startDate: "2026-06-07", durationDays: 367},
  { username: "Uklonghor", password: "848550", startDate: "2026-07-07", durationDays: 367},
  { username: "Seyha", password: "@seyha999", startDate: "2026-07-07", durationDays: 367},
  { username: "Bunheang", password: "heang168", startDate: "2026-08-07", durationDays: 367},
  { username: "Sovannarom", password: "7344440", startDate: "2026-08-07", durationDays: 367},
  { username: "Pengse", password: "123456", startDate: "2026-13-07", durationDays: 367},
  { username: "laysreynich", password: "123456789", startDate: "2026-15-07", durationDays: 367},
  { username: "Chamroeun2", password: "chomroeun03/11/1993", startDate: "2026-15-07", durationDays: 367},
  { username: "Chanreaksmey", password: "mey#2025", startDate: "2026-17-07", durationDays: 367},
  { username: "Lonponleu", password: "Leu9999", startDate: "2026-17-07", durationDays: 367},
  { username: "Virakyut", password: "yut168", startDate: "2026-20-07", durationDays: 367},
  { username: "Lyminh", password: "minh168", startDate: "2026-21-07", durationDays: 367},
  { username: "Veasna", password: "211220", startDate: "2026-06-08", durationDays: 367},
  { username: "Lyboromey", password: "mey12345", startDate: "2026-20-08", durationDays: 367},
  { username: "SOEURAVY", password: "300594", startDate: "2026-27-08", durationDays: 367},
  { username: "oung_ekreach", password: "20010719", startDate: "2026-03-09", durationDays: 367},
  { username: "Soksovannaro168", password: "168168@@", startDate: "2026-09-09", durationDays: 367},
  { username: "Sreypau", password: "Sreypau", startDate: "2026-24-09", durationDays: 367},
  { username: "Rath", password: "rath@2026", startDate: "2026-21-10", durationDays: 367},
  { username: "Measpisey", password: "pisey@2026", startDate: "2026-21-10", durationDays: 367},
  { username: "Panha", password: "1808", startDate: "2026-18-11", durationDays: 367},

  //----Renew Account-----
  { username: "Reovan", password: "sovan@2025", startDate: "2025-11-11", durationDays: 1100 },
  { username: "Sovan", password: "sovan@2025", startDate: "2025-11-11", durationDays: 1100 },
  { username: "Sovan", password: "11112222", startDate: "2026-20-11", durationDays: 800},

  //------laboratory accounts-----
  { username: "Test", password: "test@2026", startDate: "2026-29-05", durationDays: 3 },
  { username: "Test02", password: "Smey1994", startDate: "2026-01-08", durationDays: 30 }
];

// === Initialize Users ===
(function initUsers() {
  const db = loadDB();
  if (!db.users) db.users = {};

  // សម្អាត Key ចាស់ៗដែលគ្មានទម្រង់ username:::password ដើម្បីកុំឲ្យជាន់គ្នា
  for (const oldKey in db.users) {
    if (!oldKey.includes(":::")) {
      delete db.users[oldKey];
    }
  }

  USERS.forEach(u => {
    const key = getUserKey(u.username, u.password);
    if (!db.users[key]) {
      db.users[key] = {
        username: u.username,
        password: u.password,
        deviceId: null,
        sessionToken: null,
        status: "logged_out",
        waitingDevice: null,
        requestId: null,
        declineMessage: null,
        lastActive: 0,
        startDate: u.startDate || null,
        durationDays: u.durationDays || 365,
        lastUrl: null,
        deviceInfo: null,
        pendingDeviceInfo: null
      };
    } else {
      db.users[key].username = u.username;
      db.users[key].password = u.password;
      if (!db.users[key].startDate) db.users[key].startDate = u.startDate || null;
      if (!db.users[key].durationDays) db.users[key].durationDays = u.durationDays || 365;
      if (db.users[key].lastUrl === undefined) db.users[key].lastUrl = null;
    }
  });

  saveDB(db);
})();

function genToken() { return crypto.randomUUID(); }

// === EXPIRATION HANDLER ===
function isExpired(user) {
  if (!user.startDate) return false;
  const start = new Date(user.startDate).getTime();
  const expire = start + user.durationDays * 24 * 60 * 60 * 1000;
  return Date.now() >= expire;
}

function expireTimestamp(user) {
  if (!user.startDate) return null;
  const start = new Date(user.startDate).getTime();
  return start + user.durationDays * 24 * 60 * 60 * 1000;
}

// === LOGIN ROUTE ===
app.post("/login", (req, res) => {
  const { username, password, deviceId } = req.body || {};
  if (!username || !password || !deviceId)
    return res.json({ success: false, message: "Missing inputs" });

  const db = loadDB();
  const key = getUserKey(username, password);
  const user = db.users[key];

  // បើរកមិនឃើញគូ Username + Password ទេ ពិនិត្យមើលថាតើ Username មានឬអត់ ដើម្បីបង្ហាញ Message ឲ្យត្រឹមត្រូវ
  if (!user) {
    const usernameExists = Object.values(db.users).some(u => u.username === username);
    if (!usernameExists) {
      return res.json({ success: false, message: "Invalid username" });
    }
    return res.json({ success: false, message: "Wrong password" });
  }

  // CHECK EXPIRATION
  if (isExpired(user)) {
    return res.json({
      success: false,
      expired: true,
      expireAt: expireTimestamp(user),
      message: "Account expired. Please contact admin."
    });
  }

  // CHECK DECLINE
  if (user.declineMessage) {
    const msg = user.declineMessage;
    user.declineMessage = null;
    saveDB(db);
    return res.json({ success: false, isDeclined: true, message: msg });
  }

  // ចាប់យក IP, Browser និង OS
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || "Unknown IP";
  const ua = req.headers['user-agent'];
  const { browser, os } = parseUserAgent(ua);
  const currentDeviceInfo = { ip, browser, os };

  user.lastActive = Date.now();

  // FIRST LOGIN
  if (!user.deviceId) {
    user.deviceId = deviceId;
    user.sessionToken = genToken();
    user.deviceInfo = currentDeviceInfo;
    user.status = "active";
    saveDB(db);
    return res.json({ 
      success: true, 
      token: user.sessionToken, 
      expireAt: expireTimestamp(user),
      lastUrl: user.lastUrl
    });
  }

  // SAME DEVICE LOGIN
  if (user.deviceId === deviceId) {
    if (!user.sessionToken) user.sessionToken = genToken();
    user.deviceInfo = currentDeviceInfo;
    user.status = "active";
    saveDB(db);
    return res.json({ 
      success: true, 
      token: user.sessionToken, 
      expireAt: expireTimestamp(user),
      lastUrl: user.lastUrl
    });
  }

  // SECOND DEVICE LOGIN → REQUEST APPROVAL
  user.status = "pending";
  user.waitingDevice = deviceId;
  user.requestId = genToken();
  user.pendingDeviceInfo = currentDeviceInfo;
  saveDB(db);

  return res.json({
    success: false,
    requiresApproval: true,
    requestId: user.requestId,
    message: "Waiting for approval..."
  });
});

// === UPDATE PROGRESS ===
app.post("/update-progress", (req, res) => {
  const { username, token, url } = req.body;
  if (!username || !token || !url) return res.json({ success: false });

  const db = loadDB();
  const user = findUserByUsernameAndToken(db, username, token);

  // Security check: Match username & token
  if (user) {
    user.lastUrl = url;
    user.lastActive = Date.now();
    saveDB(db);
    return res.json({ success: true });
  }
  
  // បើ Token ខុស (មានអ្នក Login ចូល Device ផ្សេង) បញ្ជាឲ្យ Logout ភ្លាមៗ
  return res.json({ success: false, forceLogout: true, message: "Invalid token" });
});

// === CHECK REQUESTS ===
app.post("/check-requests", (req, res) => {
  const { username, token } = req.body;

  const db = loadDB();
  const user = findUserByUsernameAndToken(db, username, token);

  if (user) {
    const now = Date.now();
    if (now - user.lastActive > 10000) {
      user.lastActive = now;
      saveDB(db);
    }

    if (user.status === "pending") {
      return res.json({ hasRequest: true, requestId: user.requestId, deviceInfo: user.pendingDeviceInfo });
    }

    return res.json({ hasRequest: false });
  }

  // ប្រសិនបើមានបញ្ជូន token មក តែរកមិនឃើញគណនីដែលត្រូវនឹង token នោះទេ បញ្ជាឲ្យ Logout
  if (username && token) {
    return res.json({ success: false, forceLogout: true, message: "Invalid token" });
  }

  return res.json({ hasRequest: false });
});

// === APPROVE ===
app.post("/approve", (req, res) => {
  const { username, requestId } = req.body;

  const db = loadDB();
  // ស្វែងរកតាម username និង requestId ដើម្បីច្បាស់ថាចំគណនីដែលកំពុងស្នើសុំពិតប្រាកដ
  const user = Object.values(db.users).find(
    u => u.username === username && u.requestId === requestId
  );

  if (user) {
    user.deviceId = user.waitingDevice;
    user.sessionToken = genToken();
    user.deviceInfo = user.pendingDeviceInfo;
    user.status = "active";
    user.waitingDevice = null;
    user.requestId = null;
    user.pendingDeviceInfo = null;
    saveDB(db);
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// === DECLINE ===
app.post("/decline", (req, res) => {
  const { username, requestId } = req.body;

  const db = loadDB();
  // រកគណនីដែលកំពុងមាន status "pending" របស់ username នោះ (ឬផ្ទៀង requestId បើមាន)
  const user = Object.values(db.users).find(
    u => u.username === username && (requestId ? u.requestId === requestId : u.status === "pending")
  );

  if (user) {
    user.declineMessage =
      "Sorry! Account owner did not approve. សូមទោស! ម្ចាស់គណនីមិនអនុញ្ញាតទេ។";

    user.status = "active";
    user.waitingDevice = null;
    user.requestId = null;
    user.pendingDeviceInfo = null;

    saveDB(db);
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// === LOGOUT ===
app.post("/logout", (req, res) => {
  const { token } = req.body;

  const db = loadDB();

  for (const k in db.users) {
    const u = db.users[k];

    if (u.sessionToken === token) {
      u.sessionToken = null;
      u.deviceId = null;
      u.status = "logged_out";
      saveDB(db);
      return res.json({ success: true });
    }
  }

  res.json({ success: false });
});

// === AUTO LOGOUT (30min inactive) ===
setInterval(() => {
  const db = loadDB();
  const now = Date.now();

  let updateNeeded = false;

  for (const k in db.users) {
    const u = db.users[k];

    if (u.deviceId && u.lastActive && now - u.lastActive > 30 * 60 * 1000) {
      u.deviceId = null;
      u.sessionToken = null;
      u.status = "logged_out";
      u.waitingDevice = null;
      u.requestId = null;

      updateNeeded = true;
    }
  }

  if (updateNeeded) saveDB(db);
}, 60000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
