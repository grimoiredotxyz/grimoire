/** @type {import('tailwindcss').Config} */
/** @type { import('@radix-ui/colors') } */

const colors = require('@radix-ui/colors')

const { sage, mint, grass, amber, sky, red, gold } = colors

const typography = {
  fontSizeMin: 1.05,
  fontSizeMax: 1.25,
  msFactorMin: 1.125,
  msFactorMax: 1.2,
  lineHeight: 1.6,
}

const screensRem = {
  min: 20,
  '2xs': 30,
  xs: 36,
  sm: 40,
  md: 48,
  lg: 64,
  xl: 80,
  '2xl': 85.364,
}

const fsMin = typography.fontSizeMin
const fsMax = typography.fontSizeMax
const msFactorMin = typography.msFactorMin
const msFactorMax = typography.msFactorMax
const screenMin = screensRem.min
const screenMax = screensRem['2xl']

// Calc min and max font-size
const calcMulti = (multiMin = 0, multiMax = null) => {
  return {
    fsMin: fsMin * Math.pow(msFactorMin, multiMin),
    fsMax: fsMax * Math.pow(msFactorMax, multiMax || multiMin),
  }
}

// build the clamp property
const clamp = (multiMin = 0, multiMax = null) => {
  const _calcMulti = calcMulti(multiMin, multiMax || multiMin)
  const _fsMin = _calcMulti.fsMin
  const _fsMax = _calcMulti.fsMax
  return `clamp(${_fsMin}rem, calc(${_fsMin}rem + (${_fsMax} - ${_fsMin}) * ((100vw - ${screenMin}rem) / (${screenMax} - ${screenMin}))), ${_fsMax}rem)`
}

const remToPx = (rem) => {
  return `${rem * 16}px`
}

module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    screens: {
      min: remToPx(screensRem.min),
      '2xs': remToPx(screensRem['2xs']),
      xs: remToPx(screensRem.xs),
      sm: remToPx(screensRem.sm),
      md: remToPx(screensRem.md),
      lg: remToPx(screensRem.lg),
      xl: remToPx(screensRem.xl),
      '2xl': remToPx(screensRem['2xl']),
      '3xl': remToPx(100),
    },
    fontFamily: {
      sans: ['sans'],
      mono: ['monospace'],
    },
    fontSize: {
      '3xs': clamp(-5),
      '2xs': clamp(-2),
      xs: clamp(-1.5),
      sm: clamp(-1.25),
      base: clamp(-1),
      md: clamp(0.125),
      lg: clamp(0.5),
      xl: clamp(1),
      '2xl': clamp(2),
      '3xl': clamp(3),
      '4xl': clamp(5),
    },

    extend: {
      spacing: {
        '1ex': '1ex',
      },
      colors: {
        neutral: {
          1: sage.sage1,
          2: sage.sage2,
          3: sage.sage3,
          4: sage.sage4,
          5: sage.sage5,
          6: sage.sage6,
          7: sage.sage7,
          8: sage.sage8,
          9: sage.sage9,
          10: sage.sage10,
          11: sage.sage11,
          12: sage.sage12,
        },
        accent: {
          1: gold.gold1,
          2: gold.gold2,
          3: gold.gold3,
          4: gold.gold4,
          5: gold.gold5,
          6: gold.gold6,
          7: gold.gold7,
          8: gold.gold8,
          9: gold.gold9,
          10: gold.gold10,
          11: gold.gold11,
          12: gold.gold12,
        },
        primary: {
          1: mint.mint1,
          2: mint.mint2,
          3: mint.mint3,
          4: mint.mint4,
          5: mint.mint5,
          6: mint.mint6,
          7: mint.mint7,
          8: mint.mint8,
          9: mint.mint9,
          10: mint.mint10,
          11: mint.mint11,
          12: mint.mint12,
        },
        secondary: {
          1: amber.amber1,
          2: amber.amber2,
          3: amber.amber3,
          4: amber.amber4,
          5: amber.amber5,
          6: amber.amber6,
          7: amber.amber7,
          8: amber.amber8,
          9: amber.amber9,
          10: amber.amber10,
          11: amber.amber11,
          12: amber.amber12,
        },
        interactive: {
          1: sky.sky1,
          2: sky.sky2,
          3: sky.sky3,
          4: sky.sky4,
          5: sky.sky5,
          6: sky.sky6,
          7: sky.sky7,
          8: sky.sky8,
          9: sky.sky9,
          10: sky.sky10,
          11: sky.sky11,
          12: sky.sky12,
        },
        negative: {
          1: red.red1,
          2: red.red2,
          3: red.red3,
          4: red.red4,
          5: red.red5,
          6: red.red6,
          7: red.red7,
          8: red.red8,
          9: red.red9,
          10: red.red10,
          11: red.red11,
          12: red.red12,
        },
        positive: {
          1: grass.grass1,
          2: grass.grass2,
          3: grass.grass3,
          4: grass.grass4,
          5: grass.grass5,
          6: grass.grass6,
          7: grass.grass7,
          8: grass.grass8,
          9: grass.grass9,
          10: grass.grass10,
          11: grass.grass11,
          12: grass.grass12,
        },
      },
    }
  },
  plugins: [
    require('tailwindcss-logical'),
    require('@tailwindcss/typography'),
  ]
};
