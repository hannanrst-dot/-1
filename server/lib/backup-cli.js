'use strict';
/** ابزار خط فرمان پشتیبان‌گیری: node server/lib/backup-cli.js */
const fs = require('fs');
const path = require('path');
const { db } = require('../db');
const config = require('../config');

if (!fs.existsSync(config.backupDir)) fs.mkdirSync(config.backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const file = path.join(config.backupDir, `backup-${stamp}.db`);
db.prepare('VACUUM INTO ?').run(file);
console.log('پشتیبان ساخته شد:', file);
