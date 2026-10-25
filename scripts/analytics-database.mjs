import fs from 'node:fs';
import { createClient } from '@libsql/client';
const mode=process.argv[2];
const url=process.env.TURSO_DATABASE_URL,token=process.env.TURSO_AUTH_TOKEN;
if(!url||(!token&&!url.startsWith('file:')))throw Error('请在环境变量中配置 TURSO_DATABASE_URL 与 TURSO_AUTH_TOKEN，不要将凭据写入脚本或提交 Git。');
if(!['migrate','backup','restore','cleanup'].includes(mode))throw Error('使用 migrate / backup / restore / cleanup');
const db=createClient({url,authToken:token});
try {
 if(mode==='migrate'){await db.executeMultiple(fs.readFileSync('db/analytics.sql','utf8'));console.log('统计表初始化完成；重复执行不会清空已有记录。');}
 if(mode==='backup'){
   const output=process.argv[3];if(!output||fs.existsSync(output))throw Error('提供一个尚不存在的备份文件路径。');
   const tables=['analytics_sessions','analytics_events','analytics_daily','analytics_limits','analytics_aggregate_events','analytics_counts'];
   const results=await db.batch(tables.map(name=>'SELECT * FROM '+name),'read');
   const backup={format:'nexbody-analytics-v2',createdAt:new Date().toISOString(),tables:Object.fromEntries(tables.map((name,index)=>[name,results[index].rows]))};
   fs.writeFileSync(output,JSON.stringify(backup),{flag:'wx',mode:0o600});console.log('一致性快照已保存；请将备份放在项目外并妥善保管。');
 }
 if(mode==='restore'){
   const input=process.argv[3];if(!input)throw Error('提供备份文件路径，目标必须为新的空数据库。');
   const backup=JSON.parse(fs.readFileSync(input,'utf8'));
   if(!['nexbody-analytics-v1','nexbody-analytics-v2'].includes(backup.format))throw Error('备份格式不正确。');
   const existing=await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'analytics_%'");
   if(existing.rows.length)throw Error('目标已有统计表，拒绝覆盖。请选择一个新的空数据库。');
   const columns={analytics_sessions:['id','started_at','last_seen','channel','source','medium','campaign','entry_path','device','product_at','product_contact_at','funnel_success_at'],analytics_events:['id','sid','at','day','kind','path','module','action'],analytics_daily:['day','sid','kind','path','module','action','count'],analytics_limits:['key','hits','expires'],analytics_aggregate_events:['id','at','day','channel','source','medium','campaign','device','kind','path','module','action'],analytics_counts:['day','channel','source','medium','campaign','device','kind','path','module','action','count']};
   if(backup.format==='nexbody-analytics-v1'){backup.tables.analytics_aggregate_events=[];backup.tables.analytics_counts=[];}
   for(const name of Object.keys(columns))if(!Array.isArray(backup.tables?.[name]))throw Error('备份缺少数据表。');
   await db.executeMultiple(fs.readFileSync('db/analytics.sql','utf8'));
   const statements=[];
   for(const [name,keys] of Object.entries(columns))for(const row of backup.tables[name])statements.push({sql:'INSERT OR REPLACE INTO '+name+'('+keys.join(',')+') VALUES('+keys.map(()=>'?').join(',')+')',args:keys.map(key=>row[key]??null)});
   if(statements.length)await db.batch(statements,'write');console.log('已恢复到新的数据库；切换正式连接前请核对各表行数与看板结果。');
 }
 if(mode==='cleanup'){
   const now=Date.now(),day=new Date(now-365*86400000+8*3600000).toISOString().slice(0,10);
   await db.batch([{sql:'DELETE FROM analytics_limits WHERE expires<?',args:[now]},{sql:'DELETE FROM analytics_events WHERE at<?',args:[now-90*86400000]},{sql:'DELETE FROM analytics_aggregate_events WHERE at<?',args:[now-90*86400000]},{sql:'DELETE FROM analytics_counts WHERE day<?',args:[day]},{sql:'DELETE FROM analytics_daily WHERE day<?',args:[day]},{sql:'DELETE FROM analytics_sessions WHERE last_seen<? AND NOT EXISTS(SELECT 1 FROM analytics_daily WHERE sid=analytics_sessions.id) AND NOT EXISTS(SELECT 1 FROM analytics_events WHERE sid=analytics_sessions.id)',args:[now-365*86400000]}],'write');console.log('保留策略已执行：明细 90 天，汇总 365 天。');
 }
}finally{db.close();}
