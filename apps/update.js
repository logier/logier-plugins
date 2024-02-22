import plugin from '../../../lib/plugins/plugin.js'
import { execSync } from 'child_process'
import { update } from '../../other/update.js'
import { Version  , Plugin_Name } from '../components/index.js'
import render from '../components/render/render.js'

export class ql_update extends plugin {
	constructor() {
		super({
			name: '[鸢尾花插件]更新',
			dsc: '更新',
			event: 'message',
			priority: 2000,
			rule: [
				{
					reg: '^#?(鸢尾花)(插件)?(强制)?更新$',
					fnc: 'update_plugin',
					permission: 'master'
				},
				{
					reg: '^#?(鸢尾花)(插件)?版本$',
					fnc: 'plugin_version',
				},
				{
					reg: '^#?(鸢尾花)(插件)?更新日志$',
					fnc: 'update_log',
				},
			]
		});
	}

	async update_plugin() {
		let Update_Plugin = new update();
		Update_Plugin.e = this.e;
		Update_Plugin.reply = this.reply;

		if (Update_Plugin.getPlugin(Plugin_Name)) {
			if (this.e.msg.includes('强制')) {
				await execSync('git reset --hard', { cwd: `${process.cwd()}/plugins/${Plugin_Name}/` });
			}
			await Update_Plugin.runUpdate(Plugin_Name);
			if (Update_Plugin.isUp) {
				setTimeout(() => Update_Plugin.restart(), 2000)
			}
		}
		return true;
	}
	async update_log() {
		let Update_Plugin = new update();
		Update_Plugin.e = this.e;
		Update_Plugin.reply = this.reply;

		if (Update_Plugin.getPlugin(Plugin_Name)) {
			this.e.reply(await Update_Plugin.getLog(Plugin_Name));
		}
		return true;
	}
	async plugin_version() {return versionInfo(this.e);}
}
async function versionInfo(e) {
	return await render('help/version-info', {
		currentVersion: Version.ver,
		changelogs: Version.logs,
		elem: 'cryo'
	}, { e, scale: 1.2 })
}
