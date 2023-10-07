import React from 'react';
import chalk from 'chalk';
import test from 'ava';
import {render} from 'ink-testing-library';
import App from './source/app.js';

test('displays title', t => {
	const {lastFrame} = render(<App />);

	t.true(
		lastFrame().includes(
			`${chalk.bold('ink-text-input')} wrong cursor handling issue demo`,
		),
	);
});
