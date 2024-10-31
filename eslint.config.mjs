import antfu from '@antfu/eslint-config'
import unocss from '@unocss/eslint-config/flat'
import format from 'eslint-plugin-format'

export default antfu({
  plugins: {
    format,
  },
}, unocss)
