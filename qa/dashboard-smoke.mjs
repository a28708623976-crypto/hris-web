import assert from 'node:assert/strict';
import { moduleHarness } from './module-harness.mjs';
const h=await moduleHarness('dashboard');
const {app,base,both,open,same,modal,checks}=h;
const card=(label)=>app.getByText(label,{exact:true}).locator('../..');
const nav=async(name)=>app.locator('aside nav').getByRole('button',{name:new RegExp('^'+name)}).click();
const detail=async(id)=>app.locator('main div.p-5').filter({hasText:id}).getByRole('button',{name:'查看详情',exact:true}).click();
try {
  for(const role of ['HR 主管','部门负责人','普通员工']) {
    await open('/dashboard',role);await same(role+' workspace cards and shortcuts',true);
    assert.equal(await app.locator('main .lg\\:grid-cols-4 > div').count(),4);
    if(role==='普通员工') {
      assert.equal(await app.getByRole('heading',{name:'部门在职人数分布',exact:true}).count(),0);
      assert.ok((await card('我的合同到期日').innerText()).includes('2026-12-12'));
    } else {
      assert.ok((await card('在编总人数').innerText()).includes('11 人'));
      assert.equal(await app.locator('main .space-y-3\\.5 > div').count(),5);
    }
  }
  await open('/dashboard');
  await both(page=>page.getByRole('button',{name:'快速办理入职',exact:true}).click());
  await same('quick onboarding reuses existing employee form',true);
  await both(page=>modal(page).getByRole('button',{name:'取消',exact:true}).click());
  const shortcuts=['查看全员员工花名册','办理新员工入职核验','审批入转调离流程','一键生成证明文件'];
  for(const name of shortcuts) {
    await both(page=>page.getByRole('button',{name:new RegExp('^'+name)}).click());
    await same(name+' navigates to prototype destination');
    await h.navigate('工作台');
  }
  // The next scenarios assert corrected live counters instead of reproducing prototype bugs.
  await app.goto(base+'/onboarding');
  await app.locator('main div.p-5').filter({hasText:'OB-2026-002'}).getByRole('button',{name:'核验材料并办理',exact:true}).click();
  await modal(app).getByRole('button',{name:'核验通过并建档',exact:true}).click();
  await nav('工作台');
  assert.ok((await card('在编总人数').innerText()).includes('12 人'));
  assert.ok((await card('待处理入转调离').innerText()).includes('3 项'));
  assert.ok((await app.getByRole('button',{name:/^办理新员工入职核验/}).innerText()).includes('1 项待报到'));
  checks.push('onboarding updates headcount probation departments and waiting shortcut');
  await nav('转调离管理');await detail('LC-2026-001');
  await modal(app).getByRole('button',{name:'驳回申请',exact:true}).click();
  await modal(app).locator('textarea').fill('本季度材料需补充');
  await modal(app).getByRole('button',{name:'确认驳回退回',exact:true}).click();
  await nav('工作台');
  assert.ok((await card('待处理入转调离').innerText()).includes('2 项'));
  assert.ok((await app.getByRole('button',{name:/^审批入转调离流程/}).innerText()).includes('1 项待审批'));
  checks.push('rejected lifecycle is excluded from pending counters');
  await nav('合同管理');
  await app.locator('main tbody tr').filter({hasText:'EMP005'}).getByRole('button',{name:'查看详情',exact:true}).click();
  await h.field(app,'新合同到期日期').fill('2031-12-20');
  await modal(app).getByRole('button',{name:'保存条款并办理电子续签',exact:true}).click();
  await nav('工作台');
  assert.ok((await card('30天内合同到期').innerText()).includes('1 份'));
  await app.locator('header select').selectOption('普通员工');
  assert.ok((await card('我的合同到期日').innerText()).includes('2031-12-20'));
  checks.push('renewal updates HR warning and personal contract date');
  await h.finish();
} catch(error) {await h.fail(error);} finally {await h.browser.close();}
