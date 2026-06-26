import { combineRgb } from '@companion-module/base'

export function initFeedbacks(self) {
	const white = combineRgb(255, 255, 255)
	const red = combineRgb(204, 0, 0)
	const green = combineRgb(0, 150, 40)

	self.setFeedbackDefinitions({
		on_air: {
			type: 'boolean',
			name: 'On Air (live)',
			defaultStyle: { bgcolor: red, color: white },
			options: [],
			callback: () => self.state.pipeline === 'live',
		},
		recording: {
			type: 'boolean',
			name: 'Recording',
			defaultStyle: { bgcolor: red, color: white },
			options: [],
			callback: () => self.state.recording,
		},
		pipeline_state: {
			type: 'boolean',
			name: 'Pipeline is in state',
			defaultStyle: { bgcolor: green, color: white },
			options: [
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					default: 'live',
					choices: ['idle', 'starting', 'live', 'stopping', 'error'].map((s) => ({
						id: s,
						label: s,
					})),
				},
			],
			callback: (fb) => self.state.pipeline === fb.options.state,
		},
	})
}
