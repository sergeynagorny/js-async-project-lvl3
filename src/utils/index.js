import prettier from 'prettier'

export const formatHtml = (html) => prettier.format(html, { parser: 'html' })

export const formatUrl = (url) => {
    const Reg = {
        protocol: new RegExp(/^https?:\/\//),
        characters: new RegExp(`([/]|[.](?![a-z0-9]+$))`, 'g'),
    }

    const removeProtocol = (str) => str.replace(Reg.protocol, '')
    const replaceCharacter = (str) => str.replace(Reg.characters, '-')

    return replaceCharacter(removeProtocol(url))
}

export const normalizeExtension = (str, ext) => {
    const EXT = 'html|png|jpg|css|js'
    const extRegExp = RegExp(`[.-](${EXT})$`)
    return str.match(extRegExp) ? str : str + ext
}
