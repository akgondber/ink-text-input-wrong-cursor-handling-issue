#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

meow(
	`
		Usage
		  $ ink-text-input-demo

		Options
			--ink-version  Ink version

		Examples
		  $ ink-text-input-issue
	`,
	{
		importMeta: import.meta,
	},
);

render(<App />);
