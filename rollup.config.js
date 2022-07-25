import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
// import css from 'rollup-plugin-css-only';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg-import';
import autoPreprocess from 'svelte-preprocess';
// import rollup_start_dev from './rollup_start_dev';
// import dev from 'rollup-plugin-dev'
import json from '@rollup/plugin-json';
// import nodePolyfills from 'rollup-plugin-node-polyfills';
import files from 'rollup-plugin-import-file';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default  ['user', 'operator','site'].map((name, index) => ({
	input: `src/${name}/main.js`,
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file:`public/kolmit/${name}/${name}.js`
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write(`public/kolmit/${name}/${name}.css`);
			},
			preprocess: autoPreprocess(),
                        emitCss: true
		}),
		svg({
			// process SVG to DOM Node or String. Default: false
			stringify: true
		  }),
		postcss({
		extract: true,
		minimize: true,
		use: [
			['sass', {
				includePaths: [
					'./node_modules',
					'./node_modules/bulma',
						'./src'
							]
				}]
				]
		}),

		json(),

		files({
			output: `public/kolmit/${name}/assets`,
			extensions: /\.(mp3|wav)$/,
			hash: true,
		  }),
		// nodePolyfills(),

		// dev({ proxy: { '/v3/*': ['http://localhost:*', { https: true }] } }),
		
		// json({
		// 	// All JSON files will be parsed by default,
		// 	// but you can also specifically include/exclude files
		// 	include: 'node_modules/**',
		// 	exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],
	  
		// 	// for tree-shaking, properties will be declared as
		// 	// variables, using either `var` or `const`
		// 	preferConst: true, // Default: false
	  
		// 	// specify indentation for the generated default export —
		// 	// defaults to '\t'
		// 	indent: '  ',
	  
		// 	// ignores indent and generates the smallest code
		// 	compact: true, // Default: false
	  
		// 	// generate a named export for every property of the JSON object
		// 	namedExports: true // Default: true
		//   }),
		// postcss(),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		// css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte','svelte/transition', 'svelte/internal']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload({
            watch: `./public/kolmit/${name}.*`
        }),
		// !production && livereload('public'),
		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
}));