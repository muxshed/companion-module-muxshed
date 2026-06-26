export function initVariables(self) {
	self.setVariableDefinitions([
		{ variableId: 'pipeline_state', name: 'Pipeline state' },
		{ variableId: 'on_air', name: 'On air (yes/no)' },
		{ variableId: 'recording', name: 'Recording (yes/no)' },
		{ variableId: 'stream_uptime', name: 'Stream uptime (HH:MM:SS)' },
		{ variableId: 'active_scene', name: 'Active scene id' },
	])
	updateVariables(self)
}

export function updateVariables(self) {
	self.setVariableValues({
		pipeline_state: self.state.pipeline,
		on_air: self.state.pipeline === 'live' ? 'yes' : 'no',
		recording: self.state.recording ? 'yes' : 'no',
		stream_uptime: uptime(self.state),
		active_scene: self.state.activeScene || '',
	})
}

function uptime(state) {
	if (state.pipeline !== 'live' || !state.startedAt) return '00:00:00'
	const secs = Math.max(0, Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000))
	const h = String(Math.floor(secs / 3600)).padStart(2, '0')
	const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
	const s = String(secs % 60).padStart(2, '0')
	return `${h}:${m}:${s}`
}
