import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import React, {useState} from 'react';
import {Text, Box, Newline, useInput} from 'ink';
import TextInput from 'ink-text-input';
import semver from 'semver';
import logSymbols from 'log-symbols';
import RangeStepper from 'range-stepper';
import {v4} from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inkVersion = JSON.parse(
	fs.readFileSync(`${__dirname}/../node_modules/ink/package.json`, {
		encoding: 'utf8',
	}),
).version;
const inkTextInputVersion = JSON.parse(
	fs.readFileSync(`${__dirname}/../node_modules/ink-text-input/package.json`, {
		encoding: 'utf8',
	}),
).version;
const defaultValue = 'value';

export default function App() {
	const [inputValue, setInputValue] = useState(defaultValue);
	const [direction, setDirection] = useState('left');
	const [newDirection, setNewDirection] = useState('left');
	const [expectedValue, setExpectedValue] = useState('');
	const [inputStepper, setInputStepper] = useState(new RangeStepper({max: 3}));
	const [someActivity, setSomeActivity] = useState(false);
	const [expectedValueSubmitted, setExpectedValueSubmitted] = useState(false);
	const [isDirectionValid, setIsDirectionValid] = useState(true);

	useInput((input, key) => {
		if (key.tab) {
			setInputStepper(inputStepper.next().dup());
		} else if (!key.ctrl) {
			setSomeActivity(true);
		}
	});

	const afterDirectionChanged = direction => {
		setDirection(direction);
		setInputValue('value');
		setExpectedValue('');
		setExpectedValueSubmitted(false);
		setInputStepper(new RangeStepper({max: 3}));
	};

	const getDescription = () => {
		if (!someActivity) {
			return <Text bold>Change TextInput&apos;s value somehow</Text>;
		}

		if (direction === 'left') {
			return (
				<Box flexDirection="column">
					<Text>
						When a cursor reached the most left position and is moving to left
						one more time
					</Text>
					<Text>
						{getCursorHandlingStatusFigure()}&nbsp;
						<Text backgroundColor={getCursorHandlingStatusColor()}>
							a cursor remains in the screen at most left position
						</Text>
					</Text>
					{expectedValue !== '' && expectedValueSubmitted && (
						<Text>
							{getMovingStateFigure()}
							&nbsp;
							<Text backgroundColor={getMovingStateColor()}>
								the newly typing chars should be printed in correct position
							</Text>
						</Text>
					)}
				</Box>
			);
		}

		return (
			<Box flexDirection="column">
				<Text>
					When a cursor reached right position and is moving to right futher
				</Text>
				<Text>
					{getCursorHandlingStatusFigure()}&nbsp;
					<Text backgroundColor={getCursorHandlingStatusColor()}>
						a cursor remains in the screen at most right position
					</Text>
				</Text>
				{expectedValue !== '' && expectedValueSubmitted && (
					<Text>
						{getMovingStateFigure()}
						&nbsp;
						<Text backgroundColor={getMovingStateColor()}>
							the newly typing chars should be printed in correct position
						</Text>
					</Text>
				)}
			</Box>
		);
	};

	const getLabelColor = () => {
		if (expectedValue !== '' && inputValue !== '') {
			return expectedValue === inputValue ? 'green' : 'red';
		}

		return null;
	};

	const getCursorHandlingStatusFigure = () => {
		/* eslint-disable n/prefer-global/process */
		if (process.env.INK_TEXT_INPUT_FIXED) {
			return logSymbols.success;
		}
		/* eslint-enable n/prefer-global/process */

		return semver.lte(inkTextInputVersion, '5.0.1')
			? logSymbols.error
			: logSymbols.success;
	};

	const getCursorHandlingStatusColor = () => {
		/* eslint-disable n/prefer-global/process */
		if (process.env.INK_TEXT_INPUT_FIXED) {
			return 'green';
		}
		/* eslint-enable n/prefer-global/process */

		return semver.lte(inkTextInputVersion, '5.0.1') ? 'red' : 'green';
	};

	const getMovingStateColor = () => {
		if (direction === 'left')
			return inputValue === expectedValue ? 'green' : 'red';
		if (direction === 'right')
			return inputValue === expectedValue ? 'green' : 'red';
		return '';
	};

	const getMovingStateFigure = () => {
		if (direction === 'left')
			return inputValue === expectedValue
				? logSymbols.success
				: logSymbols.error;
		if (direction === 'right')
			return inputValue === expectedValue
				? logSymbols.success
				: logSymbols.error;
		return '';
	};

	return (
		<Box flexDirection="column">
			<Box>
				<Text>
					<Text bold>ink-text-input</Text> wrong cursor handling issue demo
				</Text>
			</Box>
			<Box flexDirection="column">
				{[
					['ink', inkVersion],
					['ink-text-input', inkTextInputVersion],
				].map(item => (
					<Text key={v4()}>
						<Text bold>{item[0]}</Text> version: {item[1]}
					</Text>
				))}
			</Box>
			<Box flexDirection="row">
				<Box flexDirection="column">
					<Box marginTop={1}>{getDescription()}</Box>
					<Box marginY={1}>
						<Text>
							<Text italic={inputStepper.isCurrent(0)}>Input:&nbsp;</Text>
							<TextInput
								focus={inputStepper.isCurrent(0)}
								value={inputValue}
								onChange={setInputValue}
							/>
						</Text>
					</Box>
					{['left', 'right'].includes(direction) && (
						<Box flexDirection="column">
							<Box>
								<Text italic={inputStepper.isCurrent(1)}>Direction:&nbsp;</Text>
								<TextInput
									focus={inputStepper.isCurrent(1)}
									value={newDirection}
									onChange={value => {
										if (!isDirectionValid) {
											setIsDirectionValid(true);
										}

										setNewDirection(value);
									}}
									onSubmit={value => {
										if (['left', 'right'].includes(value)) {
											if (direction !== value) {
												setDirection(value);
												afterDirectionChanged(value);
											}
										} else setIsDirectionValid(false);
									}}
								/>
								<Newline />
								{!isDirectionValid && (
									<Text>
										&nbsp;direction is invalid, available values: left and
										right.
									</Text>
								)}
							</Box>
							<Box>
								<Text
									italic={inputStepper.isCurrent(2)}
									color={expectedValue !== '' && 'green'}
								>
									Expected:&nbsp;
								</Text>
								<TextInput
									focus={inputStepper.isCurrent(2)}
									value={expectedValue}
									onChange={value => {
										setExpectedValue(value);
									}}
									onSubmit={() => {
										setExpectedValueSubmitted(true);
									}}
								/>
							</Box>
							<Box>
								<Text
									italic={inputStepper.isCurrent(3)}
									color={getLabelColor()}
								>
									Actual:&nbsp;
								</Text>
								<TextInput
									focus={inputStepper.isCurrent(3)}
									value={inputValue}
								/>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
}
