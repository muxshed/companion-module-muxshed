import { combineRgb } from '@companion-module/base'

export function initPresets(self) {
	const white = combineRgb(255, 255, 255)
	const dark = combineRgb(20, 15, 8)
	const red = combineRgb(204, 0, 0)
	const amber = combineRgb(255, 176, 0)

	const button = (name, text, actionId, bgcolor, feedbacks = []) => ({
		type: 'button',
		category: 'Muxshed',
		name,
		style: { text, size: '18', color: white, bgcolor },
		steps: [{ down: [{ actionId, options: {} }], up: [] }],
		feedbacks,
	})

	self.setPresetDefinitions({
		go_live: button('Go Live', 'GO\nLIVE', 'go_live', dark, [
			{ feedbackId: 'on_air', options: {}, style: { bgcolor: red, color: white } },
		]),
		end_stream: button('End Stream', 'END', 'end_stream', dark),
		bleep: button('Bleep', 'BLEEP', 'bleep', combineRgb(120, 30, 30)),
		record: button('Record', 'REC', 'record_toggle', dark, [
			{ feedbackId: 'recording', options: {}, style: { bgcolor: red, color: white } },
		]),
		uptime: {
			type: 'button',
			category: 'Muxshed',
			name: 'Stream uptime',
			style: { text: '$(muxshed:stream_uptime)', size: '18', color: amber, bgcolor: dark },
			steps: [],
			feedbacks: [{ feedbackId: 'on_air', options: {}, style: { bgcolor: combineRgb(14, 42, 20) } }],
		},
	})
}
