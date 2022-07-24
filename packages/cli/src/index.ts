import { Command, flags } from '@oclif/command'
import shades, { ColorObj } from '@theme-color-shades/core'
import chalk from 'chalk'
import tinyColor from 'tinycolor2'
import * as fs from 'fs';
// import asciiArt from 'ascii-art'

type outputFormat = 'object' | 'array';
type templateData = string[] | tinyColor.Instance[] | ColorObj

class Cli extends Command {
	static description = 'CLI command to create a group of color shades ready to be used in your UI library.'

	static flags = {
		// see: https://oclif.io/docs/flags#__docusaurus
		// add --version flag to show CLI version
		version: flags.version({ char: 'v' }),
		help: flags.help({ char: 'h' }),
		format: flags.string({
			char: 'f',
			description: 'output format. It can be array or object.',
			options: ['array', 'object'],
		}),
	}

	static args = [
		{
			// see: https://oclif.io/docs/args#__docusaurus
			name: 'color',
			required: true,
			description:
				'Color in HEX format. Since # needs to be escaped from terminal, wrap it in quotes or remove the #, e.g. "#312333" or 312333.',
		},
		{
			// see: https://oclif.io/docs/args#__docusaurus
			name: 'output',
			required: false,
			description: 'Output file for ChakraUI theming. Exports a "colors" variable to extend your ChakraUI theme'
		}
	]

	async run() {
		const { args, flags } = this.parse(Cli)
		const templateOutput = async (data: templateData) => `export const colors = {\n\tbrand:${JSON.stringify(data, null, 4)}\n}`;
		const result = shades({
			color: args.color,
			saturation: true,
			hue: true,
			outputFormat: (flags.format as outputFormat) ?? 'object',
		})

		const rgbColor = tinyColor(args.color).toRgb()

		// Removed this art for now to have a smaller CLI response and a smaller bundle.
		// const art1 = await asciiArt
		// 	.image({
		// 		filepath: path.join(__dirname + '/images/logo.png'),
		// 		width: 20,
		// 		height: 20,
		// 		alphabet: 'variant4',
		// 	})
		// 	.toPromise()

		// this.log(art1)
		this.log(`Theme Color Shades ${this.config.version}`)

		if (!/^#?(?:[0-9a-fA-F]{3}){1,2}$/.test(args.color)) {
			this.error(new Error('Argument must be valid a 3 or 6-digit hex color.'))
		}

		this.log(
			`Hello! Here is your requested shades using ${chalk
				.rgb(rgbColor.r, rgbColor.g, rgbColor.b)
				.inverse(args.color)} as reference:\n`
		)

		this.log(JSON.stringify(result, null, 2))

		this.log(
			`\nWanna see how these shades play out in some components before using?
Check it out here: https://themecolorshades.com/components/?color=${tinyColor(args.color).toHexString().slice(1)}`
		)
		if(args.output){ 
			templateOutput({...result}).then((r) => fs.writeFileSync(args.output, r)) 
		}
	}
}

export = Cli
