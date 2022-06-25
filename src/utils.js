import prettier from 'prettier'

export const formatHtml = (html) => prettier.format(html, { parser: 'html' })
